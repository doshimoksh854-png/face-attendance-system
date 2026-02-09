from flask_mail import Mail, Message
from flask import current_app

mail = Mail()

def send_password_reset_email(user_email, reset_link):
    """Send password reset email to user"""
    try:
        msg = Message(
            subject='Password Reset Request - Face Attendance System',
            recipients=[user_email],
            sender=current_app.config.get('MAIL_DEFAULT_SENDER')
        )
        
        # Email body - HTML version
        msg.html = f'''
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f9f9f9;
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background: white;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .button {{
                    display: inline-block;
                    padding: 15px 30px;
                    background: #667eea;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                    font-weight: bold;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 20px;
                    font-size: 12px;
                    color: #888;
                }}
                .warning {{
                    background: #fff3cd;
                    border-left: 4px solid #ff9800;
                    padding: 15px;
                    margin: 20px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    
                    <p>You requested to reset your password for the Face Attendance System.</p>
                    
                    <p>Click the button below to reset your password:</p>
                    
                    <center>
                        <a href="{reset_link}" class="button">
                            Reset My Password
                        </a>
                    </center>
                    
                    <div class="warning">
                        <p><strong>⚠️ Important:</strong></p>
                        <ul>
                            <li>This link will expire in <strong>1 hour</strong></li>
                            <li>If you didn't request this, please ignore this email</li>
                            <li>Your password won't change until you access the link above</li>
                        </ul>
                    </div>
                    
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">
                        {reset_link}
                    </p>
                    
                    <p>If you have any questions, please contact support.</p>
                    
                    <p>Best regards,<br>
                    <strong>Face Attendance System Team</strong></p>
                </div>
                <div class="footer">
                    <p>This is an automated email. Please do not reply to this message.</p>
                    <p>© 2026 Face Attendance System. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        '''
        
        # Plain text version (fallback)
        msg.body = f'''
Password Reset Request - Face Attendance System

Hello,

You requested to reset your password for the Face Attendance System.

Click this link to reset your password:
{reset_link}

IMPORTANT:
- This link will expire in 1 hour
- If you didn't request this, please ignore this email
- Your password won't change until you access the link above

If the link doesn't work, copy and paste it into your browser.

Best regards,
Face Attendance System Team

---
This is an automated email. Please do not reply to this message.
        '''
        
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return False
