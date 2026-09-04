"""
Risk Engine — Deterministic, transparent risk scoring.
Structured so ExplanationEngine and RecommendationEngine
can be replaced by an LLM in the future without changing this file.
"""


class RiskEngine:
    """Core risk scoring engine. Returns a score (0-100) and a list of risk factors."""

    THRESHOLDS = {
        "LOW": (0, 30),
        "MEDIUM": (31, 60),
        "HIGH": (61, 80),
        "CRITICAL": (81, 100),
    }

    def calculate_score(self, data: dict) -> dict:
        """
        Args:
            data: dict with keys matching AssessmentCreate fields
        Returns:
            {
                'total_score': float,
                'risk_level': str,
                'factors': [ { factor_name, impact, score_contribution, explanation } ]
            }
        """
        factors = []
        total = 0.0

        total += self._check_amount_anomaly(data, factors)
        total += self._check_new_device(data, factors)
        total += self._check_location_anomaly(data, factors)
        total += self._check_unusual_time(data, factors)
        total += self._check_high_frequency(data, factors)
        total += self._check_account_age(data, factors)
        total += self._check_previous_risk(data, factors)

        total = min(total, 100.0)
        risk_level = self._classify(total)

        return {
            "total_score": round(total, 1),
            "risk_level": risk_level,
            "factors": factors,
        }

    # ---- Individual factor checks ----------------------------------------

    def _check_amount_anomaly(self, data: dict, factors: list) -> float:
        amount = data.get("transaction_amount", 0)
        avg = data.get("previous_average_amount", 1)
        if avg <= 0:
            avg = 1
        ratio = amount / avg

        if ratio > 5:
            score = 30
            impact = "CRITICAL"
            explanation = (
                f"Transaction amount (₹{amount:,.0f}) is {ratio:.1f}x higher than "
                f"the customer's historical average (₹{avg:,.0f}). "
                "This extreme deviation strongly indicates potential fraud."
            )
        elif ratio > 3:
            score = 20
            impact = "HIGH"
            explanation = (
                f"Transaction amount (₹{amount:,.0f}) is {ratio:.1f}x higher than "
                f"the customer's historical average (₹{avg:,.0f}). "
                "This significant deviation warrants investigation."
            )
        elif ratio > 2:
            score = 10
            impact = "MEDIUM"
            explanation = (
                f"Transaction amount (₹{amount:,.0f}) is {ratio:.1f}x higher than "
                f"the customer's historical average (₹{avg:,.0f}). "
                "This is moderately above normal spending patterns."
            )
        else:
            return 0.0

        factors.append({
            "factor_name": "Amount Anomaly",
            "impact": impact,
            "score_contribution": score,
            "explanation": explanation,
        })
        return score

    def _check_new_device(self, data: dict, factors: list) -> float:
        if not data.get("is_new_device", False):
            return 0.0
        device = data.get("device_type", "Unknown")
        factors.append({
            "factor_name": "New Device",
            "impact": "HIGH",
            "score_contribution": 20,
            "explanation": (
                f"Transaction originated from a new, previously unrecognized {device} device. "
                "Device changes are a strong indicator of account takeover attempts."
            ),
        })
        return 20.0

    def _check_location_anomaly(self, data: dict, factors: list) -> float:
        prev = (data.get("previous_location") or "").strip().lower()
        curr = (data.get("current_location") or "").strip().lower()
        if not prev or not curr or prev == curr:
            return 0.0
        factors.append({
            "factor_name": "Location Anomaly",
            "impact": "HIGH",
            "score_contribution": 15,
            "explanation": (
                f"Current transaction location ({data.get('current_location')}) differs from "
                f"the customer's typical activity location ({data.get('previous_location')}). "
                "Unexpected location changes may indicate unauthorized access."
            ),
        })
        return 15.0

    def _check_unusual_time(self, data: dict, factors: list) -> float:
        login_time = data.get("login_time", "12:00")
        try:
            hour = int(str(login_time).split(":")[0])
        except (ValueError, IndexError):
            return 0.0
        if 0 <= hour <= 5:
            factors.append({
                "factor_name": "Unusual Transaction Time",
                "impact": "MEDIUM",
                "score_contribution": 10,
                "explanation": (
                    f"Transaction was initiated at {login_time} — during an unusual late-night/early-morning "
                    "period (12:00 AM–5:59 AM). Off-hours transactions have elevated fraud risk."
                ),
            })
            return 10.0
        return 0.0

    def _check_high_frequency(self, data: dict, factors: list) -> float:
        freq = data.get("transaction_frequency", 0)
        if freq > 10:
            factors.append({
                "factor_name": "High Transaction Frequency",
                "impact": "MEDIUM",
                "score_contribution": 10,
                "explanation": (
                    f"Customer has made {freq} transactions today, which is significantly above "
                    "normal activity levels. Rapid transaction sequences are a known fraud pattern."
                ),
            })
            return 10.0
        return 0.0

    def _check_account_age(self, data: dict, factors: list) -> float:
        age = data.get("account_age_days", 365)
        if age < 7:
            factors.append({
                "factor_name": "Very New Account",
                "impact": "HIGH",
                "score_contribution": 15,
                "explanation": (
                    f"Account is only {age} day(s) old. Newly created accounts performing "
                    "large or unusual transactions are a high-risk signal for synthetic fraud."
                ),
            })
            return 15.0
        elif age < 30:
            factors.append({
                "factor_name": "New Account",
                "impact": "MEDIUM",
                "score_contribution": 10,
                "explanation": (
                    f"Account is {age} days old. New accounts carry elevated risk as "
                    "behavioral patterns have not yet been established."
                ),
            })
            return 10.0
        return 0.0

    def _check_previous_risk(self, data: dict, factors: list) -> float:
        prev_score = data.get("previous_risk_score", 0)
        if prev_score > 70:
            factors.append({
                "factor_name": "High Prior Risk History",
                "impact": "HIGH",
                "score_contribution": 15,
                "explanation": (
                    f"Customer has a prior risk score of {prev_score:.0f}/100, indicating a "
                    "history of flagged or suspicious activity. Prior risk history significantly "
                    "elevates the probability of current fraud."
                ),
            })
            return 15.0
        elif prev_score > 50:
            factors.append({
                "factor_name": "Elevated Prior Risk History",
                "impact": "MEDIUM",
                "score_contribution": 8,
                "explanation": (
                    f"Customer's prior risk score of {prev_score:.0f}/100 indicates some "
                    "history of flagged activity that warrants additional monitoring."
                ),
            })
            return 8.0
        return 0.0

    def _classify(self, score: float) -> str:
        if score <= 30:
            return "LOW"
        elif score <= 60:
            return "MEDIUM"
        elif score <= 80:
            return "HIGH"
        else:
            return "CRITICAL"
