from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator, FileExtensionValidator, RegexValidator

# Strict alphanumeric regex for standard names
name_validator = RegexValidator(regex=r'^[a-zA-Z0-9\s\-&.,()]+$', message="Only alphanumeric characters, spaces, and safe punctuation are allowed.")

class Category(models.Model):
    name = models.CharField(max_length=100, validators=[name_validator])
    subtitle = models.CharField(max_length=200, blank=True, validators=[name_validator])
    description = models.TextField(blank=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    image = models.ImageField(blank=True, null=True, upload_to='categories/', validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp'])])
    theme_color = models.CharField(max_length=20, default="#ffffff")
    display_order = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order']
        verbose_name_plural = 'Categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Product(models.Model):


    title = models.CharField(max_length=200, validators=[name_validator])
    slug = models.SlugField(max_length=250, unique=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products', null=True, blank=True)
    
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, validators=[MinValueValidator(0)])
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(0)])
    stock = models.IntegerField(default=10, validators=[MinValueValidator(0)])
    is_hot = models.BooleanField(default=False)
    is_new = models.BooleanField(default=False)
    new_badge_date = models.DateTimeField(blank=True, null=True)
    is_limited = models.BooleanField(default=False)
    is_sold_out = models.BooleanField(default=False)
    is_booking_enabled = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    theme_color = models.CharField(max_length=20, default="#7B2EFF")
    enquiry_count = models.PositiveIntegerField(default=0)

    short_description = models.TextField(blank=True)
    full_description = models.TextField(blank=True)
    features = models.TextField(blank=True, help_text="One feature per line")
    material = models.CharField(max_length=200, blank=True)
    compatibility = models.CharField(max_length=200, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', '-created_at']

    @property
    def badge_text(self):
        from django.utils import timezone
        import datetime
        
        # Auto expire NEW badge
        if self.is_new and self.new_badge_date:
            if timezone.now() > self.new_badge_date + datetime.timedelta(days=2):
                # Update DB safely
                Product.objects.filter(id=self.id).update(is_new=False, new_badge_date=None)
                self.is_new = False
                self.new_badge_date = None

        if self.is_sold_out:
            return "SOLD OUT"
        if self.is_limited:
            return "LIMITED"
        if self.is_hot:
            return "HOT"
        if self.is_new:
            return "NEW"
        return ""

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
            # Ensure unique slug
            original_slug = self.slug
            counter = 1
            while Product.objects.filter(slug=self.slug).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        
        # Mutually exclusive badges: NEW, LIMITED, SOLD OUT
        if self.is_sold_out:
            self.is_new = False
            self.is_limited = False
        elif self.is_limited:
            self.is_new = False
            self.is_sold_out = False
        elif self.is_new:
            self.is_limited = False
            self.is_sold_out = False

        # Set new_badge_date if marked as NEW and date not set
        if self.is_new and not self.new_badge_date:
            from django.utils import timezone
            self.new_badge_date = timezone.now()
        elif not self.is_new:
            self.new_badge_date = None

        super().save(*args, **kwargs)

        if self.is_hot:
            # Enforce max 4 hot picks, FIFO
            hot_products = Product.objects.filter(is_hot=True).order_by('-updated_at', 'id')
            if hot_products.count() > 4:
                # keep the latest 4, un-hot the rest
                keep_ids = list(hot_products.values_list('id', flat=True)[:4])
                Product.objects.filter(is_hot=True).exclude(id__in=keep_ids).update(is_hot=False)

    def __str__(self):
        return self.title

class ProductColor(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='colors')
    name = models.CharField(max_length=50, validators=[RegexValidator(regex=r'^[a-zA-Z\s]+$', message="Only letters and spaces are allowed.")])
    hex_code = models.CharField(max_length=10, validators=[RegexValidator(regex=r'^#[a-fA-F0-9]{3,6}$', message="Must be a valid hex code.")])
    
    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.name} ({self.hex_code})"

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/', validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp'])])
    is_main = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)

    class Meta:
        ordering = ['-is_main', 'display_order', 'id']

    def __str__(self):
        return f"{self.product.title} Image"

class Reel(models.Model):
    video = models.FileField(upload_to='reels/', validators=[FileExtensionValidator(allowed_extensions=['mp4', 'webm', 'mov'])])
    thumbnail = models.ImageField(upload_to='reels/thumbnails/', blank=True, null=True, validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp'])])
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', '-created_at']

    def __str__(self):
        return f"Reel {self.id} (Active: {self.is_active})"

class StoreSettings(models.Model):
    """Singleton model for global contact info and settings"""
    store_name = models.CharField(max_length=255, default="Case Factory", blank=True)
    email = models.EmailField(blank=True, default="casefactorycpy@gmail.com")
    phone = models.CharField(max_length=50, blank=True, default="+91 9876543210")
    whatsapp = models.CharField(max_length=50, blank=True, default="+91 9876543210")
    instagram = models.URLField(blank=True, default="https://instagram.com")
    facebook = models.URLField(blank=True, default="https://facebook.com")
    address = models.TextField(blank=True, default="123 Luxury Street, Fashion City")
    business_hours = models.TextField(blank=True, default="Mon - Sat, 10:00 AM - 8:00 PM")
    google_maps_embed = models.TextField(blank=True, default="")
    whatsapp_enquiry_template = models.TextField(blank=True, default="Hello, I'm interested in:\nProduct: {product_name}\nPrice: {product_price}\nCan you provide more details?")
    
    def save(self, *args, **kwargs):
        self.pk = 1
        super(StoreSettings, self).save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "Store Settings"

class ProductEnquiry(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='enquiries')
    timestamp = models.DateTimeField(auto_now_add=True)
    device = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Enquiry for {self.product.title} at {self.timestamp}"

# ── ECOMMERCE ORDER & PAYMENT MODELS ──────────────────────────────────────────

class ManualPaymentMethod(models.Model):
    upi_id = models.CharField(max_length=200, blank=True)
    qr_code = models.ImageField(upload_to='payments/qrcodes/', blank=True, null=True)
    bank_name = models.CharField(max_length=200, blank=True)
    account_number = models.CharField(max_length=200, blank=True)
    ifsc_code = models.CharField(max_length=50, blank=True)
    account_holder_name = models.CharField(max_length=200, blank=True)
    instructions = models.TextField(blank=True, default="Please share the exact amount. Upload the screenshot after payment.")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Payment Method: {self.bank_name or self.upi_id}"

class Order(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    )
    
    REFUND_STATUS_CHOICES = (
        ('not_applicable', 'Not Applicable'),
        ('pending', 'Refund Pending'),
        ('processing', 'Refund Processing'),
        ('completed', 'Refund Completed'),
    )
    
    order_id = models.CharField(max_length=50, unique=True, blank=True)
    user = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    
    # Customer Details
    full_name = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20)
    alternate_phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Address
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='India')
    landmark = models.CharField(max_length=200, blank=True, null=True)
    
    # Status & Tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    tracking_number = models.CharField(max_length=200, blank=True, null=True)
    admin_notes = models.TextField(blank=True, null=True)
    
    # Totals
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    is_archived = models.BooleanField(default=False)

    # Cancellation tracking
    cancel_reason   = models.TextField(blank=True, null=True)
    cancelled_at    = models.DateTimeField(blank=True, null=True)
    cancelled_by    = models.CharField(max_length=20, blank=True, null=True)  # 'user' or 'admin'
    refund_status   = models.CharField(max_length=20, choices=[
        ('not_applicable', 'Not Applicable'),
        ('pending', 'Refund Pending'),
        ('processing', 'Refund Processing'),
        ('completed', 'Refund Completed'),
    ], default='not_applicable')

    # Payment details tracking
    payment_app      = models.ForeignKey('UPIPaymentApp', on_delete=models.SET_NULL, null=True, blank=True)
    payment_app_name = models.CharField(max_length=100, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.order_id:
            import uuid
            self.order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.order_id} - {self.full_name}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=250)
    selected_color = models.CharField(max_length=50, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.quantity}x {self.product_name} in {self.order.order_id}"

class PaymentProof(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment_proof')
    screenshot = models.ImageField(upload_to='payments/proofs/', validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp'])])
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Proof for {self.order.order_id}"

# ── DYNAMIC UPI PAYMENT APPS ──────────────────────────────────────────────────

class UPIPaymentApp(models.Model):
    APP_CHOICES = [
        ('gpay', 'Google Pay'),
        ('paytm', 'Paytm'),
        ('phonepe', 'PhonePe'),
        ('bhim', 'BHIM UPI'),
        ('other', 'Other')
    ]
    app_type = models.CharField(max_length=20, choices=APP_CHOICES)
    display_name = models.CharField(max_length=100)  # e.g. "Pay with Google Pay"
    upi_id = models.CharField(max_length=200)
    merchant_name = models.CharField(max_length=200, default='Case Factory')
    is_enabled = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    instructions = models.TextField(blank=True)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return f"{self.display_name} ({self.upi_id})"

# ── CART MODELS ───────────────────────────────────────────────────────────────

class Cart(models.Model):
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart for {self.user.username}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    selected_color = models.CharField(max_length=50, blank=True)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('cart', 'product', 'selected_color')

    def __str__(self):
        return f"{self.quantity}x {self.product.title}"


class BookingRequest(models.Model):
    STATUS_CHOICES = (
        ('Enquired', 'Enquired'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
    )

    user = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='booking_requests')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='booking_requests')
    selected_color = models.CharField(max_length=50, blank=True)
    
    full_name = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20)
    
    customer_note = models.TextField(blank=True)
    admin_note = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Enquired')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking #{self.id} - {self.full_name} for {self.product.title}"
