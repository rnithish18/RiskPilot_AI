"""
Explanation Engine — Dynamically generates natural-language explanations
from risk factors. Abstracted so it can be replaced with an LLM call.
"""
from typing import List


class ExplanationEngine:
    """
    Converts structured risk factor data into human-readable explanations.
    Replace this class's methods with LLM calls to upgrade to AI-generated text.
    """

    IMPACT_WEIGHTS = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}

    def generate(self, risk_level: str, total_score: float, factors: List[dict]) -> dict:
        """
        Returns:
            {
                'summary': str,
                'why_risky': [str],
            }
        """
        if not factors:
            return {
                "summary": "No significant risk factors were detected. Transaction appears within normal parameters.",
                "why_risky": [],
            }

        # Sort factors by score contribution descending
        sorted_factors = sorted(factors, key=lambda f: f["score_contribution"], reverse=True)
        top_factor = sorted_factors[0]

        # Build summary
        summary = self._build_summary(risk_level, total_score, sorted_factors, top_factor)

        # Build why_risky list from explanations
        why_risky = [f["explanation"] for f in sorted_factors]

        return {
            "summary": summary,
            "why_risky": why_risky,
        }

    def _build_summary(self, risk_level: str, score: float, factors: list, top: dict) -> str:
        count = len(factors)
        high_impact = [f for f in factors if f["impact"] in ("HIGH", "CRITICAL")]
        risk_desc = {
            "LOW": "a low risk level with minimal concern",
            "MEDIUM": "a medium risk level requiring monitoring",
            "HIGH": "a high risk level requiring immediate review",
            "CRITICAL": "a critical risk level requiring immediate action",
        }.get(risk_level, "an elevated risk level")

        parts = [
            f"This transaction has been flagged with a risk score of {score:.0f}/100, indicating {risk_desc}.",
        ]

        if count == 1:
            parts.append(
                f"The primary concern is: {top['factor_name'].lower()}."
            )
        else:
            parts.append(
                f"A total of {count} risk indicator{'s' if count > 1 else ''} were detected, "
                f"with '{top['factor_name']}' being the most significant contributor (+{top['score_contribution']:.0f} points)."
            )

        if len(high_impact) > 1:
            names = ", ".join(f["factor_name"] for f in high_impact[:3])
            parts.append(
                f"High-impact factors include: {names}."
            )

        return " ".join(parts)
