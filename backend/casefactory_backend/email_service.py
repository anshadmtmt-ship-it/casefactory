import logging
import urllib.request
import urllib.error
import json
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.core.mail.message import make_msgid

logger = logging.getLogger('email')

class BaseEmailProvider:
    def send_email(self, subject, to_email, plain_message, html_message=None, reply_to=None, headers=None):
        raise NotImplementedError("Subclasses must implement send_email")

class SMTPEmailProvider(BaseEmailProvider):
    """SMTP provider utilizing Django's built-in email backend."""
    def send_email(self, subject, to_email, plain_message, html_message=None, reply_to=None, headers=None):
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'CASE FACTORY <casefactorycpy@gmail.com>')
        try:
            logger.info(f"[EMAIL] Sending SMTP email to {to_email}")
            msg = EmailMultiAlternatives(
                subject=subject,
                body=plain_message,
                from_email=from_email,
                to=[to_email],
                reply_to=reply_to or [getattr(settings, 'EMAIL_HOST_USER', 'casefactorycpy@gmail.com')],
                headers=headers or {}
            )
            if html_message:
                msg.attach_alternative(html_message, "text/html")
            msg.send(fail_silently=False)
            logger.info(f"[EMAIL] SMTP email sent successfully to {to_email}")
            return True, "Success"
        except Exception as e:
            logger.error(f"[EMAIL] SMTP send failed: {str(e)}")
            return False, str(e)

class ResendEmailProvider(BaseEmailProvider):
    """Resend API provider using standard library urllib."""
    def send_email(self, subject, to_email, plain_message, html_message=None, reply_to=None, headers=None):
        api_key = getattr(settings, 'RESEND_API_KEY', '')
        if not api_key:
            return False, "Resend API Key is not configured."
        
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'CASE FACTORY <onboarding@resend.dev>')
        payload = {
            "from": from_email,
            "to": [to_email],
            "subject": subject,
            "text": plain_message,
        }
        if html_message:
            payload["html"] = html_message
        if reply_to:
            payload["reply_to"] = reply_to[0] if isinstance(reply_to, list) else reply_to
        if headers:
            payload["headers"] = headers

        url = "https://api.resend.com/emails"
        headers_dict = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        try:
            logger.info(f"[EMAIL] Sending Resend email to {to_email}")
            req = urllib.request.Request(
                url, 
                data=json.dumps(payload).encode('utf-8'), 
                headers=headers_dict, 
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=15) as response:
                res_body = response.read().decode('utf-8')
                logger.info(f"[EMAIL] Resend response: {res_body}")
                return True, "Success"
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8')
            logger.error(f"[EMAIL] Resend API error: {err_body}")
            return False, err_body
        except Exception as e:
            logger.error(f"[EMAIL] Resend send failed: {str(e)}")
            return False, str(e)

class SendGridEmailProvider(BaseEmailProvider):
    """SendGrid API provider using standard library urllib."""
    def send_email(self, subject, to_email, plain_message, html_message=None, reply_to=None, headers=None):
        api_key = getattr(settings, 'SENDGRID_API_KEY', '')
        if not api_key:
            return False, "SendGrid API Key is not configured."

        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'CASE FACTORY <casefactorycpy@gmail.com>')
        
        # Parse display name and email address from from_email (e.g. "CASE FACTORY <email>")
        from_name = "CASE FACTORY"
        from_addr = "casefactorycpy@gmail.com"
        if "<" in from_email:
            parts = from_email.split("<")
            from_name = parts[0].strip()
            from_addr = parts[1].replace(">", "").strip()

        personalization = {
            "to": [{"email": to_email}],
            "subject": subject
        }

        payload = {
            "personalizations": [personalization],
            "from": {"email": from_addr, "name": from_name},
            "content": [
                {"type": "text/plain", "value": plain_message}
            ]
        }

        if html_message:
            payload["content"].append({"type": "text/html", "value": html_message})

        if reply_to:
            r_email = reply_to[0] if isinstance(reply_to, list) else reply_to
            payload["reply_to"] = {"email": r_email}

        if headers:
            payload["headers"] = headers

        url = "https://api.sendgrid.com/v3/mail/send"
        headers_dict = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        try:
            logger.info(f"[EMAIL] Sending SendGrid email to {to_email}")
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers=headers_dict,
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=15) as response:
                logger.info("[EMAIL] SendGrid email sent successfully")
                return True, "Success"
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8')
            logger.error(f"[EMAIL] SendGrid API error: {err_body}")
            return False, err_body
        except Exception as e:
            logger.error(f"[EMAIL] SendGrid send failed: {str(e)}")
            return False, str(e)


def send_email_via_provider(subject, to_email, plain_message, html_message=None, reply_to=None, headers=None):
    """
    Convenience function to send emails using the configured provider in settings.py.
    Settings options:
        EMAIL_PROVIDER = 'smtp' | 'resend' | 'sendgrid'
    """
    provider_name = getattr(settings, 'EMAIL_PROVIDER', 'smtp').lower()
    
    if provider_name == 'resend':
        provider = ResendEmailProvider()
    elif provider_name == 'sendgrid':
        provider = SendGridEmailProvider()
    else:
        provider = SMTPEmailProvider()
        
    return provider.send_email(
        subject=subject,
        to_email=to_email,
        plain_message=plain_message,
        html_message=html_message,
        reply_to=reply_to,
        headers=headers
    )
