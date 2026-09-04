"""
Anomaly Engine — Statistical deviation analysis for transaction amounts.
"""


class AnomalyEngine:
    """
    Compares current transaction against historical behavior.
    Returns deviation metrics and anomaly status.
    """

    def analyze(self, current_amount: float, previous_average: float, frequency: int = 1) -> dict:
        """
        Returns:
            {
                'normal_range': {'min': float, 'max': float},
                'current': float,
                'deviation_percent': float,
                'is_anomalous': bool,
                'status': str,
                'severity': str,
            }
        """
        if previous_average <= 0:
            previous_average = 1.0

        # Normal range: 20% to 200% of historical average
        normal_min = previous_average * 0.2
        normal_max = previous_average * 2.0

        is_anomalous = current_amount < normal_min or current_amount > normal_max
        deviation_pct = ((current_amount - previous_average) / previous_average) * 100

        # Severity classification
        abs_dev = abs(deviation_pct)
        if abs_dev > 500:
            severity = "EXTREME"
        elif abs_dev > 200:
            severity = "HIGH"
        elif abs_dev > 100:
            severity = "MODERATE"
        else:
            severity = "LOW"

        return {
            "normal_range": {
                "min": round(normal_min, 2),
                "max": round(normal_max, 2),
            },
            "current": round(current_amount, 2),
            "previous_average": round(previous_average, 2),
            "deviation_percent": round(deviation_pct, 1),
            "is_anomalous": is_anomalous,
            "status": "ANOMALOUS" if is_anomalous else "NORMAL",
            "severity": severity if is_anomalous else "NONE",
        }
