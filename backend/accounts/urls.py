from django.urls import path
from . import views

urlpatterns = [
    path('auth/login/',   views.AdminLoginView.as_view(),   name='admin-login'),
    path('auth/logout/',  views.AdminLogoutView.as_view(),  name='admin-logout'),
    path('auth/refresh/', views.AdminRefreshView.as_view(), name='admin-refresh'),
    path('auth/me/',      views.AdminMeView.as_view(),      name='admin-me'),
    
    # Customer Auth
    path('auth/request-otp/',     views.RequestSignupOTPView.as_view(),    name='request-otp'),
    path('auth/verify-otp/',      views.VerifySignupOTPView.as_view(),     name='verify-otp'),
    path('auth/resend-otp/',      views.ResendOTPView.as_view(),           name='resend-otp'),
    path('auth/test-smtp/',       views.TestSMTPView.as_view(),            name='test-smtp'),
    path('auth/customer-login/',  views.CustomerLoginView.as_view(),       name='customer-login'),
    path('auth/customer-refresh/', views.CustomerRefreshView.as_view(),    name='customer-refresh'),
    path('auth/forgot-password/', views.ForgotPasswordRequestView.as_view(), name='forgot-password'),
    path('auth/verify-reset-otp/',views.VerifyResetOTPView.as_view(),     name='verify-reset-otp'),
    path('auth/reset-password/',  views.ResetPasswordView.as_view(),       name='reset-password'),
    
    path('health/',       views.HealthView.as_view(),       name='health'),
    
    # Customer Profile & Addresses
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('change_password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('addresses/', views.SavedAddressListCreateView.as_view(), name='address-list-create'),
    path('addresses/<int:pk>/', views.SavedAddressDetailView.as_view(), name='address-detail'),
]
