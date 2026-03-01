import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def send_branded_email(subject, html_content, to_email):
    """Base function to send branded HTML emails."""
    smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_user = os.getenv('SMTP_USER')
    smtp_pass = os.getenv('SMTP_PASS')

    if not smtp_user or not smtp_pass:
        print("Error: SMTP credentials not found in environment variables.")
        return False

    message = MIMEMultipart("alternative")
    message['From'] = f"EduSlide Pro <{smtp_user}>"
    message['To'] = to_email
    message['Subject'] = subject

    # Attach HTML content
    part = MIMEText(html_content, "html")
    message.attach(part)

    try:
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(smtp_user, to_email, message.as_string())
        server.quit()
        print(f"SUCCESS: {subject} sent to {to_email}")
        return True
    except Exception as e:
        print(f"FAILURE: Could not send email. Error: {e}")
        return False

def send_welcome_email(name, email, role):
    subject = "Welcome to EduSlide Pro!"
    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                <h2 style="color: #4a90e2; text-align: center;">Welcome to EduSlide Pro</h2>
                <p>Hello <strong>{name}</strong>,</p>
                <p>Your account has been successfully created as a <strong>{role.capitalize()}</strong>.</p>
                <p>You can now log in to manage, upload, and view PPT presentations for your college.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{os.getenv('CLIENT_URL', 'http://localhost:5173')}/login" 
                       style="background-color: #4a90e2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                       Login to Your Account
                    </a>
                </div>
                <p>If you have any questions, feel free to reply to this email.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #777; text-align: center;">&copy; 2024 EduSlide Pro - College PPT Management System</p>
            </div>
        </body>
    </html>
    """
    return send_branded_email(subject, html, email)

def send_otp_email(email, otp_code):
    subject = f"{otp_code} is your EduSlide Pro Verification Code"
    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #4a90e2; text-align: center;">Verify Your Identity</h2>
                <p>Hello,</p>
                <p>Someone recently requested a verification code for your EduSlide Pro account.</p>
                <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4a90e2; border-radius: 5px; margin: 20px 0;">
                    {otp_code}
                </div>
                <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #777; text-align: center;">&copy; 2024 EduSlide Pro - Security Team</p>
            </div>
        </body>
    </html>
    """
    return send_branded_email(subject, html, email)

def send_password_reset_email(email, reset_link):
    subject = "Reset Your EduSlide Pro Password"
    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #d9534f; text-align: center;">Password Reset Request</h2>
                <p>You are receiving this email because we received a password reset request for your account.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" 
                       style="background-color: #d9534f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                       Reset Password
                    </a>
                </div>
                <p>If you did not request a password reset, no further action is required.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #777; text-align: center;">&copy; 2024 EduSlide Pro</p>
            </div>
        </body>
    </html>
    """
    return send_branded_email(subject, html, email)

if __name__ == "__main__":
    # Example usage for testing
    recipient = os.getenv('SMTP_USER')
    if recipient:
        print("--- Testing Branded Emails ---")
        send_welcome_email("Jayanth", recipient, "faculty")
        # send_otp_email(recipient, "123456")
    else:
        print("Please set your SMTP_USER in the .env file to run the test.")
