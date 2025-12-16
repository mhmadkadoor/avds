from rest_framework import serializers
from .models import Make, MakeModel, Body, DriveType, VehicleDetail, VehicleImage, VehicleMetadata
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from django.db.models import Q

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get('username')
        
        if username_or_email:
            user = User.objects.filter(
                Q(username=username_or_email) | Q(email=username_or_email)
            ).first()

            if user:
                attrs['username'] = user.username
        
        return super().validate(attrs)

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    uidb64 = serializers.CharField()
    password = serializers.CharField(write_only=True)

class MakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Make
        fields = '__all__'

class MakeModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = MakeModel
        fields = '__all__'

class BodySerializer(serializers.ModelSerializer):
    class Meta:
        model = Body
        fields = '__all__'

class DriveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriveType
        fields = '__all__'

class VehicleDetailSerializer(serializers.ModelSerializer):
    make_name = serializers.CharField(source='make.make_name', read_only=True)
    model_name = serializers.CharField(source='model.model_name', read_only=True)
    body_name = serializers.CharField(source='body.body_name', read_only=True)
    drive_type_name = serializers.CharField(source='drive_type.drive_type_name', read_only=True)
    reviews = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    image_data = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    custom_title = serializers.SerializerMethodField()

    class Meta:
        model = VehicleDetail
        fields = '__all__'

    def get_reviews(self, obj):
        # Import here to avoid circular import if ReviewSerializer is below
        from .serializers import ReviewSerializer
        return ReviewSerializer(obj.reviews.all(), many=True).data

    def get_images(self, obj):
        # Return existing images
        images = obj.images.all().order_by('-is_primary', '-created_at')
        return [image.image.url if image.image else image.image_url for image in images]

    def get_image_data(self, obj):
        # Return existing images data
        images = obj.images.all().order_by('-is_primary', '-created_at')
        return VehicleImageSerializer(images, many=True).data

    def get_description(self, obj):
        if hasattr(obj, 'metadata'):
            return obj.metadata.description
        return None

    def get_custom_title(self, obj):
        if hasattr(obj, 'metadata'):
            return obj.metadata.custom_title
        return None

class VehicleImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleImage
        fields = ('id', 'vehicle', 'image', 'image_url', 'is_primary', 'created_at')

class VehicleMetadataSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleMetadata
        fields = ('vehicle', 'description', 'custom_title')

from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    favorites = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'favorites')

    def get_favorites(self, obj):
        return list(obj.favorites.values_list('vehicle_id', flat=True))

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

from .models import Favorite, Review

class FavoriteSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Favorite
        fields = ('id', 'user', 'vehicle', 'created_at')

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    user_id = serializers.ReadOnlyField(source='user.id')
    
    class Meta:
        model = Review
        fields = ('id', 'user', 'user_id', 'vehicle', 'rating', 'comment', 'created_at')

from .models import SearchAnalytics, HomepageFeature

class SearchAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchAnalytics
        fields = '__all__'

class HomepageFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomepageFeature
        fields = '__all__'
