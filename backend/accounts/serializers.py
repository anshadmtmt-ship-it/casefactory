from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, SavedAddress

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')
    joined_date = serializers.DateTimeField(source='user.date_joined', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'phone_number', 'profile_image', 'joined_date']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user

        if 'username' in user_data:
            user.username = user_data['username']
        if 'email' in user_data:
            user.email = user_data['email']
        user.save()

        if 'phone_number' in validated_data:
            instance.phone_number = validated_data['phone_number']
        if 'profile_image' in validated_data:
            instance.profile_image = validated_data['profile_image']
            
        instance.save()
        return instance

class SavedAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedAddress
        fields = '__all__'
        read_only_fields = ['user']
