from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .views import (
    MakeList, MakeModelList, BodyList, DriveTypeList, VehicleDetailList, ChatView,
    RegisterView, UserDetailView, FavoriteView, ReviewView, ReviewDetailView,
    VehicleUpdateView, VehicleImageView, VehicleImageDetailView,
    AdminStatsView, VehicleUploadView, VehicleUploadTemplateView, HomepageFeatureView,
    VehicleRetrieveView, CustomTokenObtainPairView, PasswordResetRequestView, PasswordResetConfirmView
)

urlpatterns = [
    path('makes/', MakeList.as_view(), name='make-list'),
    path('models/', MakeModelList.as_view(), name='model-list'),
    path('bodies/', BodyList.as_view(), name='body-list'),
    path('drivetypes/', DriveTypeList.as_view(), name='drivetype-list'),
    path('vehicles/', VehicleDetailList.as_view(), name='vehicle-list'),
    path('vehicles/<int:pk>/', VehicleRetrieveView.as_view(), name='vehicle-detail'),
    path('chat/', ChatView.as_view(), name='chat'),
    
    # Auth endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('favorites/', FavoriteView.as_view(), name='favorite-toggle'),
    path('reviews/', ReviewView.as_view(), name='review-create'),
    path('reviews/<int:pk>/', ReviewDetailView.as_view(), name='review-detail'),
    path('vehicles/<int:pk>/update/', VehicleUpdateView.as_view(), name='vehicle-update'),
    path('vehicles/<int:pk>/images/', VehicleImageView.as_view(), name='vehicle-image-upload'),
    path('images/<int:pk>/', VehicleImageDetailView.as_view(), name='image-detail'),
    
    # Admin endpoints
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/upload-vehicles/', VehicleUploadView.as_view(), name='admin-upload-vehicles'),
    path('admin/upload-template/', VehicleUploadTemplateView.as_view(), name='admin-upload-template'),
    path('admin/features/', HomepageFeatureView.as_view(), name='admin-features'),
]
