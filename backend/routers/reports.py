import json
from datetime import datetime
from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
from models import RiskAssessment, AuditLog

router = APIRouter()

RISK_COLORS = {
    "LOW": (34, 197, 94),
    "MEDIUM": (245, 158, 11),
    "HIGH": (249, 115, 22),
    "CRITICAL": (239, 68, 68),
}


@router.post("/reports/{assessment_id}")
def generate_report(assessment_id: int, db: Session = Depends(get_db)):
    assessment = db.query(RiskAssessment).filter(RiskAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    if assessment.risk_score is None:
        raise HTTPException(status_code=400, detail="Assessment has not been analyzed yet")

    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    )
    from reportlab.lib.enums import TA_CENTER, TA_LEFT

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )

    styles = getSampleStyleSheet()
    WIDTH, HEIGHT = A4

    risk_rgb = RISK_COLORS.get(assessment.risk_level, (107, 114, 128))
    risk_color = colors.Color(risk_rgb[0] / 255, risk_rgb[1] / 255, risk_rgb[2] / 255)

    story = []

    # ---- Header ----
    header_style = ParagraphStyle(
        "Header", parent=styles["Normal"],
        fontSize=22, textColor=colors.HexColor("#1e3a5f"),
        spaceAfter=2 * mm, fontName="Helvetica-Bold", alignment=TA_CENTER
    )
    sub_style = ParagraphStyle(
        "Sub", parent=styles["Normal"],
        fontSize=11, textColor=colors.HexColor("#64748b"),
        spaceAfter=6 * mm, alignment=TA_CENTER
    )
    story.append(Paragraph("RiskPilot AI", header_style))
    story.append(Paragraph("Risk Investigation Report", sub_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0")))
    story.append(Spacer(1, 5 * mm))

    # ---- Case summary table ----
    label_style = ParagraphStyle("Label", parent=styles["Normal"], fontSize=9,
                                  textColor=colors.HexColor("#64748b"), fontName="Helvetica-Bold")
    value_style = ParagraphStyle("Value", parent=styles["Normal"], fontSize=10,
                                  textColor=colors.HexColor("#1e293b"))

    def row(label, value):
        return [Paragraph(label, label_style), Paragraph(str(value), value_style)]

    case_data = [
        row("Case ID", assessment.case_id),
        row("Generated", datetime.utcnow().strftime("%B %d, %Y %H:%M UTC")),
        row("Customer Name", assessment.customer_name),
        row("Customer ID", assessment.customer_id),
        row("Transaction Type", assessment.transaction_type),
        row("Transaction Amount", f"₹{assessment.transaction_amount:,.0f}"),
        row("Location", assessment.current_location or assessment.location),
        row("Device Type", assessment.device_type),
        row("New Device", "Yes" if assessment.is_new_device else "No"),
        row("Login Time", assessment.login_time),
        row("Investigation Status", assessment.status),
    ]

    case_table = Table(case_data, colWidths=[60 * mm, 110 * mm])
    case_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f8fafc")),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(case_table)
    story.append(Spacer(1, 6 * mm))

    # ---- Risk Score ----
    score_style = ParagraphStyle("Score", parent=styles["Normal"], fontSize=36,
                                  textColor=risk_color, fontName="Helvetica-Bold", alignment=TA_CENTER)
    level_style = ParagraphStyle("Level", parent=styles["Normal"], fontSize=14,
                                  textColor=risk_color, fontName="Helvetica-Bold", alignment=TA_CENTER)
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0")))
    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph(f"Risk Score: {assessment.risk_score:.0f}/100", score_style))
    story.append(Paragraph(f"Risk Level: {assessment.risk_level}", level_style))
    story.append(Spacer(1, 5 * mm))

    # ---- Risk Factors ----
    section_style = ParagraphStyle("Section", parent=styles["Normal"], fontSize=13,
                                    textColor=colors.HexColor("#1e3a5f"), fontName="Helvetica-Bold",
                                    spaceBefore=4 * mm, spaceAfter=3 * mm)
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0")))
    story.append(Paragraph("Risk Factors", section_style))

    if assessment.risk_factors:
        factor_headers = [
            Paragraph("Factor", label_style),
            Paragraph("Impact", label_style),
            Paragraph("Score", label_style),
            Paragraph("Explanation", label_style),
        ]
        factor_rows = [factor_headers]
        for f in assessment.risk_factors:
            factor_rows.append([
                Paragraph(f.factor_name, value_style),
                Paragraph(f.impact, value_style),
                Paragraph(f"+{f.score_contribution:.0f}", value_style),
                Paragraph(f.explanation, ParagraphStyle("SmallVal", parent=styles["Normal"], fontSize=8)),
            ])
        factor_table = Table(factor_rows, colWidths=[45 * mm, 22 * mm, 18 * mm, 85 * mm])
        factor_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a5f")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(factor_table)

    story.append(Spacer(1, 5 * mm))

    # ---- AI Explanation ----
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0")))
    story.append(Paragraph("AI Analysis & Explanation", section_style))

    explanation_data = None
    if assessment.explanation:
        try:
            explanation_data = json.loads(assessment.explanation)
        except Exception:
            pass

    body_style = ParagraphStyle("Body", parent=styles["Normal"], fontSize=9,
                                 textColor=colors.HexColor("#334155"), leading=14)
    if explanation_data:
        summary = explanation_data.get("summary", "")
        if summary:
            story.append(Paragraph(summary, body_style))
            story.append(Spacer(1, 3 * mm))
        why = explanation_data.get("why_risky", [])
        for i, reason in enumerate(why, 1):
            story.append(Paragraph(f"{i}. {reason}", body_style))

    story.append(Spacer(1, 5 * mm))

    # ---- Recommendation ----
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0")))
    story.append(Paragraph("Recommended Action", section_style))
    if assessment.recommendation:
        story.append(Paragraph(assessment.recommendation, body_style))

    if explanation_data and explanation_data.get("recommendation"):
        rec = explanation_data["recommendation"]
        steps = rec.get("steps", [])
        if steps:
            story.append(Spacer(1, 2 * mm))
            story.append(Paragraph("Action Steps:", label_style))
            for step in steps:
                story.append(Paragraph(f"  • {step}", body_style))

    story.append(Spacer(1, 8 * mm))

    # ---- Footer ----
    footer_style = ParagraphStyle("Footer", parent=styles["Normal"], fontSize=8,
                                   textColor=colors.HexColor("#94a3b8"), alignment=TA_CENTER)
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e2e8f0")))
    story.append(Spacer(1, 3 * mm))
    story.append(Paragraph(
        f"Generated by RiskPilot AI on {datetime.utcnow().strftime('%B %d, %Y at %H:%M UTC')} | "
        f"Case: {assessment.case_id} | CONFIDENTIAL",
        footer_style,
    ))

    doc.build(story)
    buffer.seek(0)

    # Audit
    log = AuditLog(
        timestamp=datetime.utcnow(),
        user="Analyst",
        action="Report Generated",
        case_id=assessment.case_id,
        description=f"PDF risk report generated for case {assessment.case_id}",
    )
    db.add(log)
    db.commit()

    filename = f"RiskPilot-Report-{assessment.case_id}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
