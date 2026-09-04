"""
Recommendation Engine — Generates action recommendations based on risk level.
Abstracted so it can be replaced with an LLM call.
"""


class RecommendationEngine:
    """
    Generates structured recommendations from risk level and factors.
    Replace with LLM to get contextual, dynamic recommendations.
    """

    RECOMMENDATIONS = {
        "LOW": {
            "action": "Monitor",
            "description": "Transaction appears normal. Continue standard monitoring procedures.",
            "urgency": "LOW",
            "steps": [
                "Log the transaction for audit trail.",
                "Continue standard real-time monitoring.",
                "No immediate action required.",
                "Review if subsequent activity appears unusual.",
            ],
        },
        "MEDIUM": {
            "action": "Verify",
            "description": "Perform additional verification and monitor subsequent customer activity closely.",
            "urgency": "MEDIUM",
            "steps": [
                "Request secondary authentication from the customer.",
                "Send transaction confirmation notification.",
                "Monitor subsequent transactions for 24 hours.",
                "Flag account for enhanced monitoring.",
                "Document verification outcome.",
            ],
        },
        "HIGH": {
            "action": "Review",
            "description": "Require additional verification and route the case for manual review immediately.",
            "urgency": "HIGH",
            "steps": [
                "Require step-up authentication (OTP/biometric).",
                "Route case for immediate manual review.",
                "Notify the risk management team.",
                "Pause transaction pending verification completion.",
                "Contact customer through verified channel to confirm.",
                "Document all findings and actions taken.",
            ],
        },
        "CRITICAL": {
            "action": "Hold & Escalate",
            "description": "Immediately hold the transaction and escalate to the risk team for identity verification.",
            "urgency": "CRITICAL",
            "steps": [
                "Immediately hold the transaction.",
                "Initiate full identity verification protocol.",
                "Escalate to the Senior Risk Analyst on duty.",
                "Notify the Compliance Officer.",
                "Temporarily restrict account activity.",
                "Preserve all evidence and transaction logs.",
                "Follow regulatory reporting requirements if applicable.",
            ],
        },
    }

    def get_recommendation(self, risk_level: str, factors: list) -> dict:
        """
        Returns structured recommendation for the given risk level.
        Optionally enriches with factor-specific notes.
        """
        base = self.RECOMMENDATIONS.get(risk_level, self.RECOMMENDATIONS["MEDIUM"]).copy()

        # Add factor-specific notes for CRITICAL/HIGH
        if risk_level in ("CRITICAL", "HIGH"):
            factor_names = [f["factor_name"] for f in factors if f["impact"] in ("HIGH", "CRITICAL")]
            if factor_names:
                base["triggered_by"] = factor_names

        return base
