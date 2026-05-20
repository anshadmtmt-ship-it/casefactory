from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, ReelViewSet, StoreSettingsViewSet, OrderViewSet, ManualPaymentMethodViewSet, CartViewSet, UPIPaymentAppViewSet, BookingRequestViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'reels', ReelViewSet)
router.register(r'settings', StoreSettingsViewSet, basename='settings')
router.register(r'orders', OrderViewSet, basename='orders')
router.register(r'payment-methods', ManualPaymentMethodViewSet, basename='payment-methods')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'upi-apps', UPIPaymentAppViewSet, basename='upi-apps')
router.register(r'bookings', BookingRequestViewSet, basename='bookings')

urlpatterns = [
    path('', include(router.urls)),
]
