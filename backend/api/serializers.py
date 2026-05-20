from rest_framework import serializers
from .models import Category, Product, ProductColor, ProductImage, Reel, StoreSettings

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductColor
        fields = ['id', 'name', 'hex_code']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_main', 'display_order']

class ProductSerializer(serializers.ModelSerializer):
    colors = ProductColorSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    badge_text = serializers.CharField(read_only=True)
    is_new = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_is_new(self, obj):
        # Trigger the auto-expiration logic inside badge_text if needed
        _ = obj.badge_text
        return obj.is_new

class ReelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reel
        fields = '__all__'

class StoreSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreSettings
        fields = '__all__'

from .models import Order, OrderItem, ManualPaymentMethod, PaymentProof, UPIPaymentApp

class UPIPaymentAppSerializer(serializers.ModelSerializer):
    class Meta:
        model = UPIPaymentApp
        fields = '__all__'

class ManualPaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = ManualPaymentMethod
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = '__all__'
        read_only_fields = ['order']

    def get_product_image(self, obj):
        if obj.product:
            img = obj.product.images.filter(is_main=True).first() or obj.product.images.first()
            if img:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(img.image.url)
                return img.image.url
        return None

class PaymentProofSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentProof
        fields = '__all__'
        read_only_fields = ['order']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    payment_proof = PaymentProofSerializer(read_only=True)
    customer_email = serializers.CharField(source='user.email', read_only=True, default='')
    customer_username = serializers.CharField(source='user.username', read_only=True, default='')

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['order_id', 'user']

from .models import Cart, CartItem

class CartItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'cart', 'product', 'selected_color', 'quantity', 'product_details']
        read_only_fields = ['cart']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Cart
        fields = ['id', 'user', 'created_at', 'updated_at', 'items']
        read_only_fields = ['user']


from .models import BookingRequest

class BookingRequestSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    customer_email = serializers.CharField(source='user.email', read_only=True, default='')
    customer_username = serializers.CharField(source='user.username', read_only=True, default='')

    class Meta:
        model = BookingRequest
        fields = '__all__'
        read_only_fields = ['user', 'status', 'admin_note', 'rejection_reason']
