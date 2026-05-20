import json
import logging
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .permissions import IsAdminOrReadOnly
from rest_framework.decorators import action
from .models import Category, Product, ProductColor, ProductImage, Reel, StoreSettings
from .serializers import CategorySerializer, ProductSerializer, ProductColorSerializer, ProductImageSerializer, ReelSerializer, StoreSettingsSerializer
from casefactory_backend.email_service import send_email_via_provider

logger = logging.getLogger('api')


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'

    def get_queryset(self):
        queryset = Product.objects.all()
        category_slug = self.request.query_params.get('category', None)
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
            
        search_query = self.request.query_params.get('search', None)
        if search_query:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(title__icontains=search_query) | 
                Q(short_description__icontains=search_query) |
                Q(category__name__icontains=search_query)
            )

        return queryset

    def create(self, request, *args, **kwargs):
        return self._handle_save(request, None)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        return self._handle_save(request, instance)

    def _handle_save(self, request, instance):
        data = request.data
        
        # Extract product data
        product_data = {
            'title': data.get('title'),
            'price': data.get('price', 0),
            'discount_price': data.get('discount_price') or None,
            'stock': data.get('stock', 10),
            'is_hot': str(data.get('is_hot')).lower() == 'true',
            'is_new': str(data.get('is_new')).lower() == 'true',
            'is_limited': str(data.get('is_limited')).lower() == 'true',
            'is_sold_out': str(data.get('is_sold_out')).lower() == 'true',
            'is_booking_enabled': str(data.get('is_booking_enabled')).lower() == 'true',
            'is_active': str(data.get('is_active', 'true')).lower() == 'true',
            'short_description': data.get('short_description', ''),
            'full_description': data.get('full_description', ''),
            'features': data.get('features', ''),
            'material': data.get('material', ''),
            'compatibility': data.get('compatibility', ''),
            'display_order': data.get('display_order', 0),
            'theme_color': data.get('theme_color', '#7B2EFF'),
        }
        
        category_slug = data.get('category_slug')
        if category_slug:
            try:
                cat = Category.objects.get(slug=category_slug)
                product_data['category'] = cat
            except Category.DoesNotExist:
                pass

        if instance:
            for k, v in product_data.items():
                setattr(instance, k, v)
            instance.save()
            product = instance
        else:
            product = Product.objects.create(**product_data)

        # Handle colors (expects JSON string)
        colors_json = data.get('colors', '[]')
        if isinstance(colors_json, str):
            try:
                colors_list = json.loads(colors_json)
                if instance:
                    instance.colors.all().delete()
                for c in colors_list:
                    ProductColor.objects.create(
                        product=product,
                        name=c.get('name', ''),
                        hex_code=c.get('hex_code', '')
                    )
            except:
                pass

        # Handle images
        # Expecting main_image and related_image_0, related_image_1, etc.
        # Or just images as a list of files if not multipart?
        # Typically multipart/form-data:
        # main_image: File
        # related_images: [File, File]
        
        # If updating, might keep existing or delete. Let's do a simple approach: if files are uploaded, we append.
        # To replace, the frontend should send a flag or delete via separate endpoint.
        
        main_img = request.FILES.get('main_image')
        if main_img:
            # Remove old main image if any
            if instance:
                ProductImage.objects.filter(product=product, is_main=True).delete()
            ProductImage.objects.create(product=product, image=main_img, is_main=True, display_order=0)

        for i in range(3):
            rel_img = request.FILES.get(f'related_image_{i}')
            if rel_img:
                ProductImage.objects.create(product=product, image=rel_img, is_main=False, display_order=i+1)

        # If a delete_images list is provided
        delete_images = data.get('delete_image_ids', '[]')
        if isinstance(delete_images, str):
            try:
                to_delete = json.loads(delete_images)
                ProductImage.objects.filter(id__in=to_delete, product=product).delete()
            except:
                pass

        serializer = self.get_serializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK if instance else status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], permission_classes=[IsAdminOrReadOnly])
    def validate_wishlist(self, request):
        product_ids = request.data.get('ids', [])
        validated_items = []
        
        for product_id in product_ids:
            try:
                product = Product.objects.get(id=product_id)
                
                if not product.is_active:
                    continue # Removed from wishlist if inactive
                
                # We do not validate stock or sold out state for wishlist, 
                # users can wishlist sold out items.
                        
                validated_items.append(ProductSerializer(product, context={'request': request}).data)
                
            except Product.DoesNotExist:
                continue # Removed from wishlist if deleted
                
        return Response({'products': validated_items}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[])
    def track_enquiry(self, request, pk=None):
        try:
            product = self.get_object()
            product.enquiry_count += 1
            product.save(update_fields=['enquiry_count'])
            
            # Record the exact enquiry
            device_info = request.META.get('HTTP_USER_AGENT', '')
            # Try importing inline to avoid circular issues if any
            from .models import ProductEnquiry
            ProductEnquiry.objects.create(
                product=product,
                device=device_info[:200]
            )
            
            return Response({'status': 'tracked'})
        except Exception as e:
            logger.error(f"[ENQUIRY] Error tracking enquiry: {e}")
            return Response({'status': 'failed'}, status=status.HTTP_400_BAD_REQUEST)

class ReelViewSet(viewsets.ModelViewSet):
    queryset = Reel.objects.all()
    serializer_class = ReelSerializer
    permission_classes = [IsAdminOrReadOnly]

class StoreSettingsViewSet(viewsets.ModelViewSet):
    serializer_class = StoreSettingsSerializer
    permission_classes = [IsAdminOrReadOnly]
    http_method_names = ['get', 'patch'] # Only allow reading and patching

    def get_object(self):
        return StoreSettings.load()

    def get_queryset(self):
        return StoreSettings.objects.filter(pk=1)

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        return Response(serializer.data)

from .models import Order, OrderItem, ManualPaymentMethod, PaymentProof
from .serializers import OrderSerializer, ManualPaymentMethodSerializer
from rest_framework.permissions import IsAuthenticated

class ManualPaymentMethodViewSet(viewsets.ModelViewSet):
    queryset = ManualPaymentMethod.objects.all()
    serializer_class = ManualPaymentMethodSerializer
    permission_classes = [IsAdminOrReadOnly]

from .models import UPIPaymentApp
from .serializers import UPIPaymentAppSerializer

class UPIPaymentAppViewSet(viewsets.ModelViewSet):
    queryset = UPIPaymentApp.objects.all()
    serializer_class = UPIPaymentAppSerializer
    permission_classes = [IsAdminOrReadOnly]

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated] # User must be logged in to order (or check orders)
    
    def get_queryset(self):
        if self.request.user.is_superuser:
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user, is_archived=False)
        
    def create(self, request, *args, **kwargs):
        # Create an order with items and payment proof in one multipart request
        data = request.data
        
        # 1. Create Order
        order = Order.objects.create(
            user=request.user,
            full_name=data.get('full_name', ''),
            email=data.get('email', ''),
            phone=data.get('phone', ''),
            alternate_phone=data.get('alternate_phone', ''),
            address=data.get('address', ''),
            city=data.get('city', ''),
            state=data.get('state', ''),
            pincode=data.get('pincode', ''),
            country=data.get('country', 'India'),
            landmark=data.get('landmark', ''),
            total_amount=data.get('total_amount', 0.00),
            payment_app_id=data.get('payment_app_id')
        )
        
        if order.payment_app:
            order.payment_app_name = order.payment_app.display_name
            order.save(update_fields=['payment_app_name'])
        
        # 2. Add Items
        items_json = data.get('items', '[]')
        if isinstance(items_json, str):
            try:
                items = json.loads(items_json)
                # First pass: Validate all items for stock availability
                for item in items:
                    try:
                        product = Product.objects.get(id=item.get('product_id'))
                        qty = int(item.get('quantity', 1))
                        if product.is_sold_out:
                            order.delete()
                            return Response({'error': f'Product "{product.title}" is sold out'}, status=status.HTTP_400_BAD_REQUEST)
                        if qty > product.stock:
                            order.delete()
                            return Response({'error': f'Only {product.stock} left for "{product.title}"'}, status=status.HTTP_400_BAD_REQUEST)
                    except Product.DoesNotExist:
                        pass
                
                # Second pass: Create items and deduct stock
                for item in items:
                    product_id = item.get('product_id')
                    try:
                        product = Product.objects.get(id=product_id)
                        qty = int(item.get('quantity', 1))
                        
                        OrderItem.objects.create(
                            order=order,
                            product=product,
                            product_name=product.title,
                            selected_color=item.get('selected_color', ''),
                            quantity=qty,
                            price=item.get('price', 0)
                        )
                        
                        # Deduct stock
                        product.stock -= qty
                        if product.stock <= 0:
                            product.is_sold_out = True
                            product.stock = 0
                        product.save(update_fields=['stock', 'is_sold_out'])
                    except Product.DoesNotExist:
                        pass
            except Exception as e:
                pass

        # Auto-compute and persist total_amount from items if not passed or is 0
        computed_total = sum(
            float(i.price) * i.quantity for i in order.items.all()
        )
        if computed_total > 0:
            order.total_amount = computed_total
            order.save(update_fields=['total_amount'])
            
        logger.info(f"[ORDER SAVED] Order {order.order_id} created for user {request.user.username} — total ₹{order.total_amount}")
                
        # 3. Add Payment Proof
        screenshot = request.FILES.get('screenshot')
        if screenshot:
            PaymentProof.objects.create(
                order=order,
                screenshot=screenshot
            )
            logger.info(f"[PAYMENT PROOF] Screenshot saved for order {order.order_id}")
            
        return Response(OrderSerializer(order, context={'request': request}).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminOrReadOnly])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        tracking_number = request.data.get('tracking_number')
        admin_notes = request.data.get('admin_notes')

        if new_status and new_status not in dict(Order.STATUS_CHOICES):
            return Response({'error': 'invalid_status'}, status=status.HTTP_400_BAD_REQUEST)

        if new_status:
            order.status = new_status
        if tracking_number is not None:
            order.tracking_number = tracking_number
        if admin_notes is not None:
            order.admin_notes = admin_notes
        order.save()

        # Send notification email if user has an email
        user_email = order.email or (order.user.email if order.user else '')
        status_messages = {
            'Approved': ('Your order has been approved! ✓', 'We have reviewed your payment and approved your order. We will begin processing it shortly.'),
            'Shipped':  ('Your order is on the way! 🚚',    'Great news! Your order has been shipped and is on its way to you.'),
            'Delivered':('Order Delivered! 🎉',              'Your order has been delivered successfully. Thank you for shopping with Case Factory!'),
            'Rejected': ('Order Update from Case Factory',   'Unfortunately we could not process your order. Please contact support for assistance.'),
        }
        if user_email and new_status in status_messages:
            subj, body = status_messages[new_status]
            
            email_body = f"Hello {order.full_name},\n\nUpdate on your order {order.order_id} from CASE FACTORY:\n\n{body}\n"
            if order.tracking_number:
                email_body += f"\nTracking Number: {order.tracking_number}"
            if order.admin_notes:
                email_body += f"\nNote from Admin: {order.admin_notes}"
            email_body += "\n\nThank you for shopping with CASE FACTORY!"
            
            try:
                send_email_via_provider(
                    subject=f'CASE FACTORY — {subj}',
                    to_email=user_email,
                    plain_message=email_body
                )
            except Exception:
                pass

        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def archive(self, request, pk=None):
        order = self.get_object()
        # Ensure only the owner can archive
        if order.user != request.user and not request.user.is_superuser:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            
        if order.status != 'Delivered':
            return Response({'error': 'Only delivered orders can be archived.'}, status=status.HTTP_400_BAD_REQUEST)
            
        order.is_archived = True
        order.save(update_fields=['is_archived'])
        return Response({'status': 'archived'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancel(self, request, pk=None):
        """User-initiated order cancellation. Only allowed before shipping."""
        from django.utils import timezone
        order = self.get_object()

        # Only the order owner can cancel
        if order.user != request.user and not request.user.is_superuser:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        # Can only cancel if Pending or Approved
        if order.status not in ('Pending', 'Approved'):
            return Response(
                {'error': f'Orders with status "{order.status}" cannot be cancelled. Only Pending or Approved orders can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cancel_reason = request.data.get('cancel_reason', '').strip()
        if not cancel_reason:
            return Response({'error': 'A cancellation reason is required.'}, status=status.HTTP_400_BAD_REQUEST)

        order.status       = 'Cancelled'
        order.cancel_reason = cancel_reason
        order.cancelled_at  = timezone.now()
        order.cancelled_by  = 'user'
        order.refund_status = 'pending'
        order.save(update_fields=['status', 'cancel_reason', 'cancelled_at', 'cancelled_by', 'refund_status'])

        logger.info(f"[ORDER CANCELLED] {order.order_id} cancelled by user {request.user.username}. Reason: {cancel_reason}")

        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminOrReadOnly])
    def update_refund_status(self, request, pk=None):
        """Admin updates refund status on a cancelled order."""
        order = self.get_object()
        refund_status = request.data.get('refund_status')
        admin_notes   = request.data.get('admin_notes')

        valid = ('not_applicable', 'pending', 'processing', 'completed')
        if refund_status and refund_status not in valid:
            return Response({'error': 'Invalid refund status'}, status=status.HTTP_400_BAD_REQUEST)

        if refund_status:
            order.refund_status = refund_status
        if admin_notes is not None:
            order.admin_notes = admin_notes
        order.save()

        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data)

from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer

class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def my_cart(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        selected_color = request.data.get('selected_color', '')

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        if product.is_sold_out:
            return Response({'error': 'Product is sold out'}, status=status.HTTP_400_BAD_REQUEST)

        cart_item, item_created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            selected_color=selected_color,
            defaults={'quantity': quantity}
        )

        new_quantity = quantity if item_created else cart_item.quantity + quantity
        if new_quantity > product.stock:
            if item_created:
                cart_item.delete()
            return Response({'error': f'Only {product.stock} items left in stock'}, status=status.HTTP_400_BAD_REQUEST)

        if not item_created:
            cart_item.quantity = new_quantity
            cart_item.save()

        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        item_id = request.data.get('item_id')
        try:
            item = CartItem.objects.get(id=item_id, cart=cart)
            item.delete()
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def update_quantity(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))
        
        try:
            item = CartItem.objects.get(id=item_id, cart=cart)
            if item.product.is_sold_out:
                return Response({'error': 'Product is sold out'}, status=status.HTTP_400_BAD_REQUEST)
            if quantity > item.product.stock:
                return Response({'error': f'Only {item.product.stock} items left in stock'}, status=status.HTTP_400_BAD_REQUEST)

            if quantity > 0:
                item.quantity = quantity
                item.save()
            else:
                item.delete()
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def clear(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)


from .models import BookingRequest
from .serializers import BookingRequestSerializer

class BookingRequestViewSet(viewsets.ModelViewSet):
    serializer_class = BookingRequestSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_staff:
            return BookingRequest.objects.all()
        if self.request.user.is_authenticated:
            return BookingRequest.objects.filter(user=self.request.user)
        return BookingRequest.objects.none()

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrReadOnly])
    def update_status(self, request, pk=None):
        booking = self.get_object()
        status_val = request.data.get('status')
        admin_note = request.data.get('admin_note')
        rejection_reason = request.data.get('rejection_reason')
        
        if status_val in ['Enquired', 'Accepted', 'Rejected']:
            booking.status = status_val
        
        if admin_note is not None:
            booking.admin_note = admin_note
            
        if rejection_reason is not None:
            booking.rejection_reason = rejection_reason
            
        booking.save()
        return Response(self.get_serializer(booking).data)

    def destroy(self, request, *args, **kwargs):
        # Allow user to delete their own booking if it is 'Enquired'
        booking = self.get_object()
        if not request.user.is_staff:
            if booking.user != request.user or booking.status != 'Enquired':
                return Response({'error': 'Cannot cancel this booking.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)
