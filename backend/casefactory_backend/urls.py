from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({"message": "Case Factory Backend API is running. Please use the React frontend at port 5173."})

urlpatterns = [
    # Root path to avoid 404
    path('', api_root),

    # Default Django admin (kept internal, not exposed publicly in production)
    path('django-internal-admin/', admin.site.urls),

    # All custom API routes
    path('api/', include('accounts.urls')),
    path('api/', include('api.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
