from django.utils.cache import add_never_cache_headers

class DisableApiCacheMiddleware:
    """
    Middleware to ensure API responses (especially admin-related) are never cached by the browser,
    preventing stale data or sensitive information from being stored in local caches.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.path.startswith('/api/'):
            add_never_cache_headers(response)
        return response
