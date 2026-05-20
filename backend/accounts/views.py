import re
import random
import secrets
import string
import logging
from datetime import timedelta

from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail, EmailMultiAlternatives
from django.core.mail.message import make_msgid
from django.db import IntegrityError
from django.utils import timezone
from django.conf import settings

from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from .models import OTPVerification, PasswordResetOTP, SavedAddress, UserProfile
from .serializers import SavedAddressSerializer, UserProfileSerializer
from casefactory_backend.email_service import send_email_via_provider

User = get_user_model()
logger = logging.getLogger('accounts')

OTP_EXPIRY_MINUTES = 5
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


# ─────────────────────────────────────────────────────────────────────────────
# Utilities
# ─────────────────────────────────────────────────────────────────────────────

def get_tokens_for_user(user):
    """Generate JWT access + refresh token pair for a user."""
    refresh = RefreshToken.for_user(user)
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}


def generate_otp():
    return ''.join(secrets.choice(string.digits) for _ in range(6))


def send_otp_email(email, otp, action='signup'):
    logger.info(f"[OTP] Preparing email for {email} (action={action})")

    subject = 'CASE FACTORY Verification Code'

    plain_message = (
        f"Hello,\n\n"
        f"Your verification code for CASE FACTORY is:\n\n"
        f"{otp}\n\n"
        f"This code expires in 5 minutes.\n\n"
        f"If you did not request this code, please ignore this email.\n\n"
        f"Thank you,\n"
        f"CASE FACTORY"
    )

    html_message = f'''<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030303; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #030303; padding: 40px 20px;">
    <tr>
      <td align="center" valign="top">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #09090b; border: 1px solid #1f1f23; border-radius: 20px; padding: 40px 30px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          <!-- Logo / Header -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 500; letter-spacing: 6px; color: #ffffff; text-transform: uppercase;">CASE FACTORY</h1>
              <div style="width: 40px; height: 1px; background: linear-gradient(90deg, transparent, #8b5cf6, transparent); margin-top: 12px;"></div>
            </td>
          </tr>
          <!-- Body Text -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <p style="margin: 0; font-size: 14px; color: #a1a1aa; line-height: 1.6; letter-spacing: 0.5px;">
                Your verification code is ready. Use the secure code below to finalize your account verification.
              </p>
            </td>
          </tr>
          <!-- OTP Card -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #121214; border: 1px solid #27272a; border-radius: 12px; padding: 24px; text-align: center;">
                <tr>
                  <td align="center">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: bold; letter-spacing: 12px; color: #ffffff; padding-left: 12px;">{otp}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Expiry Notice -->
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <p style="margin: 0; font-size: 12px; color: #71717a; line-height: 1.5;">
                This code is valid for <strong>5 minutes</strong> and can only be used once. If you did not request this request, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer Divider -->
          <tr>
            <td align="center" style="padding-top: 20px; border-top: 1px solid #1f1f23;">
              <p style="margin: 0; font-size: 11px; color: #52525b; letter-spacing: 1px; text-transform: uppercase;">
                &copy; CASE FACTORY
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
'''

    try:
        logger.info("[OTP] Calling send_email_via_provider()")
        sent, err_msg = send_email_via_provider(
            subject=subject,
            to_email=email,
            plain_message=plain_message,
            html_message=html_message,
            reply_to=['casefactorycpy@gmail.com'],
            headers={'Message-ID': make_msgid(domain='casefactory.com')}
        )
        if sent:
            logger.info("[OTP] Email sent successfully")
            return True, "Success"
        else:
            logger.error(f"[OTP ERROR] {err_msg}")
            return False, err_msg
    except Exception as e:
        logger.error(f"[OTP ERROR] {str(e)}")
        return False, str(e)


# ─────────────────────────────────────────────────────────────────────────────
# Admin Auth Views
# ─────────────────────────────────────────────────────────────────────────────

class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not username or not password:
            return Response({'error': 'required_fields', 'message': 'Username and password are required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if '@' in username:
            try:
                user_obj = User.objects.get(email=username)
                username = user_obj.username
            except User.DoesNotExist:
                return Response({'error': 'account_not_found', 'message': 'No account found with this email.'},
                                status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({'error': 'invalid_password', 'message': 'Invalid credentials.'},
                            status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_active:
            return Response({'error': 'account_disabled', 'message': 'Account is disabled.'},
                            status=status.HTTP_403_FORBIDDEN)
        if not user.is_superuser:
            return Response({'error': 'unauthorized', 'message': 'Admin access requires superuser privileges.'},
                            status=status.HTTP_403_FORBIDDEN)

        tokens = get_tokens_for_user(user)
        logger.info(f"[LOGIN] Admin login successful: {user.username}")
        return Response({
            'access': tokens['access'], 'refresh': tokens['refresh'],
            'user': {'id': user.id, 'username': user.username, 'email': user.email,
                     'first_name': user.first_name, 'last_name': user.last_name, 'is_superuser': user.is_superuser},
        }, status=status.HTTP_200_OK)


class AdminLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except (TokenError, InvalidToken):
            return Response({'error': 'Invalid or already expired token.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


class AdminRefreshView(TokenRefreshView):
    pass

class CustomerRefreshView(TokenRefreshView):
    """POST /api/auth/customer-refresh/ — refresh customer access token."""
    permission_classes = [AllowAny]


class AdminMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.is_superuser:
            return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)
        return Response({'id': user.id, 'username': user.username, 'email': user.email,
                         'first_name': user.first_name, 'last_name': user.last_name, 'is_superuser': user.is_superuser})


class HealthView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({'status': 'ok', 'service': 'Case Factory API'})


# ─────────────────────────────────────────────────────────────────────────────
# OTP — Request & Verify
# ─────────────────────────────────────────────────────────────────────────────

class RequestSignupOTPView(APIView):
    """
    Step 1: Validate signup data + send OTP to email.
    POST /api/auth/request-otp/
    """
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        email = request.data.get('email', '').strip().lower()
        phone = request.data.get('phone_number', '').strip()
        password = request.data.get('password', '')
        confirm_password = request.data.get('confirm_password', '')

        logger.info(f"[OTP] Request received for signup OTP: {email}")

        try:
            # Field-level validation
            if not all([username, email, phone, password, confirm_password]):
                return Response({'error': 'required_fields', 'message': 'All fields are required.'},
                                status=status.HTTP_400_BAD_REQUEST)

            if not re.match(r'^[A-Za-z0-9_]+$', username):
                return Response({'error': 'invalid_username', 'message': 'Username can only contain letters, numbers, and underscores.'},
                                status=status.HTTP_400_BAD_REQUEST)

            if password != confirm_password:
                return Response({'error': 'password_mismatch', 'message': 'Passwords do not match.'},
                                status=status.HTTP_400_BAD_REQUEST)

            if not re.match(r'^\+?1?\d{9,15}$', phone):
                return Response({'error': 'invalid_phone', 'message': 'Enter a valid phone number.'},
                                status=status.HTTP_400_BAD_REQUEST)

            try:
                # Need to use select_related or just simple exists() but catch any db errors
                if User.objects.filter(username=username).exists():
                    return Response({'error': 'username_exists', 'message': 'Username already taken. Try another.'},
                                    status=status.HTTP_400_BAD_REQUEST)

                if User.objects.filter(email=email).exists():
                    return Response({'error': 'email_exists', 'message': 'This email is already registered.'},
                                    status=status.HTTP_400_BAD_REQUEST)

                if UserProfile.objects.filter(phone_number=phone).exists():
                    return Response({'error': 'phone_exists', 'message': 'This phone number is already connected to another account.'},
                                    status=status.HTTP_400_BAD_REQUEST)
            except Exception as db_err:
                logger.error(f"[AUTH] PostgreSQL connected but query failed: {db_err}")
                return Response({'error': 'database_error', 'message': 'Database connection failed.'},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            try:
                validate_password(password)
            except ValidationError:
                return Response({'error': 'weak_password', 'message': 'Password must be at least 4 characters.'},
                                status=status.HTTP_400_BAD_REQUEST)

            # Rate limit: max 1 OTP per 15 seconds per email
            cooldown_period = timezone.now() - timedelta(seconds=15)
            recent = OTPVerification.objects.filter(email=email, created_at__gte=cooldown_period, is_verified=False)
            if recent.exists():
                logger.warning(f"[OTP RATE LIMIT] User cooldown active for {email}")
                return Response({'error': 'rate_limit', 'message': 'Please wait 15 seconds before requesting another OTP.'},
                                status=status.HTTP_429_TOO_MANY_REQUESTS)

            # Invalidate old OTPs for this email
            OTPVerification.objects.filter(email=email, is_verified=False).delete()

            otp = generate_otp()
            logger.debug(f"[OTP] OTP generated: {otp}")
            
            logger.info("[OTP] Saving OTP...")
            OTPVerification.objects.create(
                email=email, otp=otp,
                temp_data={'username': username, 'email': email, 'phone': phone, 'password': password}
            )

            email_sent, error_msg = send_otp_email(email, otp, action='signup')
            if not email_sent:
                # Remove OTP record if we couldn't send the email
                OTPVerification.objects.filter(email=email, otp=otp).delete()
                logger.error(f"[AUTH] SMTP error detailed: {error_msg}")
                return Response({'error': 'smtp_error', 'message': f'Email failed to send. Error: {error_msg}'},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            logger.info(f"[AUTH] OTP request processed for {email}")
            return Response({'message': f'OTP generated successfully. Check your email.', 'email': email},
                            status=status.HTTP_200_OK)
                            
        except Exception as e:
            logger.error(f"[AUTH] Unexpected error during signup: {e}")
            return Response({'error': 'server_error', 'message': f'Server connection failed: {str(e)}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifySignupOTPView(APIView):
    """
    Step 2: Verify OTP and create the user account.
    POST /api/auth/verify-otp/
    """
    permission_classes = [AllowAny]
    MAX_ATTEMPTS = 5

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        otp_input = request.data.get('otp', '').strip()

        if not email or not otp_input:
            return Response({'error': 'required_fields', 'message': 'Email and OTP are required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            record = OTPVerification.objects.filter(
                email=email, is_verified=False
            ).latest('created_at')
        except OTPVerification.DoesNotExist:
            return Response({'error': 'otp_not_found', 'message': 'No OTP request found. Please request a new one.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Brute-force protection
        if record.attempts >= self.MAX_ATTEMPTS:
            record.delete()
            return Response({'error': 'max_attempts', 'message': 'Too many incorrect attempts. Please request a new OTP.'},
                            status=status.HTTP_429_TOO_MANY_REQUESTS)

        # Check expiry
        expiry = record.created_at + timedelta(minutes=OTP_EXPIRY_MINUTES)
        if timezone.now() > expiry:
            record.delete()
            logger.warning(f"[SIGNUP] Expired OTP attempt for {email}")
            return Response({'error': 'otp_expired', 'message': 'OTP has expired. Please request a new one.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if record.otp != otp_input:
            logger.warning(f"[SIGNUP] Incorrect OTP for {email}")
            record.attempts += 1
            record.save(update_fields=['attempts'])
            remaining = self.MAX_ATTEMPTS - record.attempts
            return Response({'error': 'invalid_otp', 'message': f'Incorrect OTP. {remaining} attempt(s) remaining.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # OTP correct — create account
        data = record.temp_data
        try:
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password']
            )
            UserProfile.objects.create(user=user, phone_number=data['phone'])
            record.is_verified = True
            record.save()

            tokens = get_tokens_for_user(user)
            logger.info(f"[SIGNUP] Account created successfully for {email}")
            return Response({
                'message': 'Account created successfully!',
                'access': tokens['access'],
                'refresh': tokens['refresh'],
                'user': {'id': user.id, 'username': user.username, 'email': user.email}
            }, status=status.HTTP_201_CREATED)

        except IntegrityError as e:
            logger.error(f"[SIGNUP] IntegrityError for {email}: {e}")
            return Response({'error': 'server_error', 'message': 'An account with this data already exists.'},
                            status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"[SIGNUP] Unexpected error for {email}: {e}")
            return Response({'error': 'server_error', 'message': 'Server connection failed. Try again later.'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResendOTPView(APIView):
    """
    POST /api/auth/resend-otp/
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'error': 'required_fields', 'message': 'Email is required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Rate limit
        cooldown_period = timezone.now() - timedelta(seconds=15)
        recent = OTPVerification.objects.filter(email=email, created_at__gte=cooldown_period, is_verified=False)
        if recent.exists():
            logger.warning(f"[OTP RATE LIMIT] User cooldown active for {email}")
            return Response({'error': 'rate_limit', 'message': 'Please wait 15 seconds before requesting another OTP.'},
                            status=status.HTTP_429_TOO_MANY_REQUESTS)

        # Get the most recent pending record to preserve temp_data
        try:
            old_record = OTPVerification.objects.filter(email=email, is_verified=False).latest('created_at')
            temp_data = old_record.temp_data
        except OTPVerification.DoesNotExist:
            return Response({'error': 'session_expired', 'message': 'Session expired. Please start signup again.'},
                            status=status.HTTP_400_BAD_REQUEST)

        logger.info(f"[OTP] Request received for resend OTP: {email}")
        
        OTPVerification.objects.filter(email=email, is_verified=False).delete()
        otp = generate_otp()
        logger.debug(f"[OTP] OTP generated: {otp}")
        
        logger.info("[OTP] Saving OTP...")
        OTPVerification.objects.create(email=email, otp=otp, temp_data=temp_data)
        
        email_sent, error_msg = send_otp_email(email, otp, action='resend')
        
        if not email_sent:
            return Response({'error': 'smtp_error', 'message': f'Email failed to send. Error: {error_msg}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        logger.info(f"[OTP] OTP resent to {email}")
        return Response({'message': f'A new OTP has been sent to {email}.'}, status=status.HTTP_200_OK)


class TestSMTPView(APIView):
    """
    GET /api/auth/test-smtp/
    Used for verifying SMTP credentials without creating an account.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        email = request.query_params.get('email', '')
        if not email:
            return Response({'error': 'missing_email', 'message': 'Please provide ?email=... in the URL'}, status=status.HTTP_400_BAD_REQUEST)
        
        logger.info(f"[EMAIL] Testing SMTP connection for {email}...")
        try:
            send_mail(
                subject='CASE FACTORY SMTP Test',
                message='If you received this, your SMTP settings are working perfectly!',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=False,
            )
            logger.info("[EMAIL] SMTP test successful.")
            return Response({'message': 'Test email sent successfully! Your SMTP configuration is working.'})
        except Exception as e:
            logger.error(f"[EMAIL] SMTP Test failed: {e}")
            return Response({'error': 'smtp_error', 'message': f'SMTP Test failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─────────────────────────────────────────────────────────────────────────────
# Customer Login
# ─────────────────────────────────────────────────────────────────────────────

class CustomerLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        identifier = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not identifier or not password:
            return Response({'error': 'required_fields', 'message': 'Username and password required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Resolve email → username
        if '@' in identifier:
            try:
                user_obj = User.objects.get(email=identifier)
                identifier = user_obj.username
            except User.DoesNotExist:
                return Response({'error': 'account_not_found', 'message': 'No account found with this email/username.'},
                                status=status.HTTP_401_UNAUTHORIZED)
        else:
            if not User.objects.filter(username=identifier).exists():
                return Response({'error': 'account_not_found', 'message': 'No account found with this email/username.'},
                                status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(request, username=identifier, password=password)

        if user is None:
            logger.warning(f"[LOGIN] Incorrect password for {identifier}")
            return Response({'error': 'invalid_password', 'message': 'Incorrect password.'},
                            status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            logger.warning(f"[LOGIN] Disabled account login attempt: {identifier}")
            return Response({'error': 'account_disabled', 'message': 'Your account has been disabled.'},
                            status=status.HTTP_403_FORBIDDEN)

        tokens = get_tokens_for_user(user)
        logger.info(f"[LOGIN] Customer login successful: {user.username}")
        return Response({
            'access': tokens['access'], 'refresh': tokens['refresh'],
            'user': {'id': user.id, 'username': user.username, 'email': user.email, 'is_superuser': user.is_superuser}
        }, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
# Profile & Address
# ─────────────────────────────────────────────────────────────────────────────

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            try:
                serializer.save()
                logger.info(f"[PROFILE] Updated profile for {request.user.username}")
                return Response(serializer.data)
            except IntegrityError:
                return Response({'error': 'conflict', 'message': 'Username or email already exists.'},
                                status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if not user.check_password(current_password):
            return Response({'error': 'invalid_password', 'message': 'Incorrect current password.'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({'error': 'weak_password', 'message': list(e.messages)},
                            status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        logger.info(f"[SECURITY] Password changed for {user.username}")
        return Response({'message': 'Password changed successfully.'})


class SavedAddressListCreateView(generics.ListCreateAPIView):
    serializer_class = SavedAddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavedAddress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        is_default = str(self.request.data.get('is_default', 'false')).lower() == 'true'
        if is_default or not SavedAddress.objects.filter(user=self.request.user).exists():
            SavedAddress.objects.filter(user=self.request.user).update(is_default=False)
            is_default = True
        serializer.save(user=self.request.user, is_default=is_default)


class SavedAddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SavedAddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavedAddress.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        is_default = str(self.request.data.get('is_default', 'false')).lower() == 'true'
        if is_default:
            SavedAddress.objects.filter(user=self.request.user).update(is_default=False)
        serializer.save(is_default=is_default)


# ─────────────────────────────────────────────────────────────────────────────
# Forgot Password — Step 1: Request Reset OTP
# POST /api/auth/forgot-password/
# ─────────────────────────────────────────────────────────────────────────────

class ForgotPasswordRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        logger.info(f"[OTP] Request received for forgot password OTP: {email}")
        
        if not email or not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
            return Response({'error': 'invalid_email', 'message': 'Please enter a valid email address.'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'error': 'email_not_found', 'message': 'No account found with this email.'},
                            status=status.HTTP_404_NOT_FOUND)

        # Rate limit: 1 request per 15 seconds
        cooldown_period = timezone.now() - timedelta(seconds=15)
        if PasswordResetOTP.objects.filter(email=email, created_at__gte=cooldown_period).exists():
            logger.warning(f"[OTP RATE LIMIT] User cooldown active for {email}")
            return Response({'error': 'rate_limit', 'message': 'Please wait 15 seconds before requesting another OTP.'},
                            status=status.HTTP_429_TOO_MANY_REQUESTS)

        # Clean up old reset OTPs for this email
        PasswordResetOTP.objects.filter(email=email, is_verified=False).delete()

        otp = generate_otp()
        logger.debug(f"[OTP] OTP generated: {otp}")
        
        logger.info("[OTP] Saving OTP...")
        expires_at = timezone.now() + timedelta(minutes=OTP_EXPIRY_MINUTES)
        PasswordResetOTP.objects.create(email=email, otp=otp, expires_at=expires_at)

        # Send email
        email_sent, error_msg = send_otp_email(email, otp, action='reset')
        
        if not email_sent:
            return Response({'error': 'smtp_error', 'message': f'Email failed to send: {error_msg}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': f'Reset OTP sent to {email}.', 'email': email}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
# Forgot Password — Step 2: Verify Reset OTP
# POST /api/auth/verify-reset-otp/
# ─────────────────────────────────────────────────────────────────────────────

class VerifyResetOTPView(APIView):
    permission_classes = [AllowAny]
    MAX_ATTEMPTS = 5

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        otp   = request.data.get('otp', '').strip()

        if not email or not otp:
            return Response({'error': 'required_fields', 'message': 'Email and OTP are required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            record = PasswordResetOTP.objects.filter(
                email=email, is_verified=False
            ).latest('created_at')
        except PasswordResetOTP.DoesNotExist:
            return Response({'error': 'no_otp', 'message': 'No OTP request found. Please request a new one.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Brute-force protection
        if record.attempts >= self.MAX_ATTEMPTS:
            record.delete()
            return Response({'error': 'max_attempts', 'message': 'Too many incorrect attempts. Please request a new OTP.'},
                            status=status.HTTP_429_TOO_MANY_REQUESTS)

        # Expiry check
        if timezone.now() > record.expires_at:
            record.delete()
            return Response({'error': 'otp_expired', 'message': 'This OTP has expired. Please request a new one.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # OTP check
        if record.otp != otp:
            record.attempts += 1
            record.save(update_fields=['attempts'])
            remaining = self.MAX_ATTEMPTS - record.attempts
            return Response({'error': 'invalid_otp',
                             'message': f'Incorrect OTP. {remaining} attempt(s) remaining.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Mark as verified
        record.is_verified = True
        record.save(update_fields=['is_verified'])
        logger.info(f"[RESET] OTP verified for {email}")
        return Response({'message': 'OTP verified. You may now reset your password.', 'email': email},
                        status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
# Forgot Password — Step 3: Set New Password
# POST /api/auth/reset-password/
# ─────────────────────────────────────────────────────────────────────────────

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email    = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')
        confirm  = request.data.get('confirm_password', '')

        if not email or not password or not confirm:
            return Response({'error': 'required_fields', 'message': 'All fields are required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if password != confirm:
            return Response({'error': 'password_mismatch', 'message': 'Passwords do not match.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Ensure OTP was verified recently (within 15 minutes)
        try:
            record = PasswordResetOTP.objects.filter(
                email=email, is_verified=True,
                created_at__gte=timezone.now() - timedelta(minutes=15)
            ).latest('created_at')
        except PasswordResetOTP.DoesNotExist:
            return Response({'error': 'no_verified_otp',
                             'message': 'OTP not verified. Please restart the reset process.'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'error': 'email_not_found', 'message': 'Account not found.'},
                            status=status.HTTP_404_NOT_FOUND)

        # Validate password strength
        try:
            validate_password(password, user=user)
        except ValidationError as e:
            return Response({'error': 'weak_password', 'message': ' '.join(e.messages)},
                            status=status.HTTP_400_BAD_REQUEST)

        # Set new password and invalidate all old tokens by updating the last_login
        user.set_password(password)
        user.save()

        # Consume the reset OTP so it can't be reused
        record.delete()

        # Reset brute-force counter on profile if it exists
        try:
            profile = user.profile
            profile.failed_login_attempts = 0
            profile.account_locked_until = None
            profile.save(update_fields=['failed_login_attempts', 'account_locked_until'])
        except Exception:
            pass

        logger.info(f"[RESET] Password changed successfully for {email}")
        return Response({'message': 'Password changed successfully. Please log in with your new password.'},
                        status=status.HTTP_200_OK)
