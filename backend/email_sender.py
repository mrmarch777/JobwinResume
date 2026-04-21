"""
JobwinResume — Email Sender
File: email_sender.py
What it does: Sends professional job application emails to HR
"""

import os
import json
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
from dotenv import load_dotenv

load_dotenv()

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL")


def send_application_email(
    to_email: str,
    hr_name: str,
    applicant_name: str,
    applicant_email: str,
    job_title: str,
    company: str,
    cover_letter: str,
) -> dict:
    """
    Send a job application email to HR.
    Returns success/failure status.
    """

    subject = f"Application for {job_title} — {applicant_name}"

    # Professional email body
    body = f"""Dear {hr_name},

{cover_letter}

Best regards,
{applicant_name}
{applicant_email}

---
Sent via JobwinResume — India's Smartest Job Search Platform
"""

    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=to_email,
        subject=subject,
        plain_text_content=body
    )

    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)

        if response.status_code in [200, 201, 202]:
            return {
                "success": True,
                "message": f"Email sent to {hr_name} at {company}!",
                "status_code": response.status_code
            }
        else:
            return {
                "success": False,
                "message": f"Failed to send email. Status: {response.status_code}"
            }

    except Exception as e:
        return {
            "success": False,
            "message": f"Error sending email: {str(e)}"
        }


def send_bulk_applications(applications: list) -> list:
    """
    Send multiple job application emails at once.
    applications = list of dicts with email details
    Returns list of results.
    """
    results = []
    for app in applications:
        result = send_application_email(
            to_email=app.get("hr_email"),
            hr_name=app.get("hr_name", "Hiring Manager"),
            applicant_name=app.get("applicant_name"),
            applicant_email=app.get("applicant_email"),
            job_title=app.get("job_title"),
            company=app.get("company"),
            cover_letter=app.get("cover_letter"),
        )
        result["job_title"] = app.get("job_title")
        result["company"] = app.get("company")
        results.append(result)
    return results


# ── Test this file directly ──────────────────────────────────
if __name__ == "__main__":
    print("📧 Testing email sender...")
    result = send_application_email(
        to_email=FROM_EMAIL,  # Send to yourself for testing
        hr_name="Test HR",
        applicant_name="Amar Khot",
        applicant_email=FROM_EMAIL,
        job_title="Data Analyst",
        company="Test Company",
        cover_letter="This is a test email from JobwinResume. The email system is working correctly!"
    )
    print(f"Result: {result}")
