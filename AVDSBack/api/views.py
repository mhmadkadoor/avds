
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import requests
import os
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Make, MakeModel, Body, DriveType, VehicleDetail, Favorite, Review
from .serializers import (
    MakeSerializer, MakeModelSerializer, BodySerializer,
    DriveTypeSerializer, VehicleDetailSerializer,
    RegisterSerializer, UserSerializer, FavoriteSerializer, ReviewSerializer,
    SearchAnalyticsSerializer, HomepageFeatureSerializer,
    CustomTokenObtainPairSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer
)
from .models import SearchAnalytics, HomepageFeature
import csv
import io
from django.http import HttpResponse
from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Sum

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class PasswordResetRequestView(APIView):
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.filter(email=email).first()
            if user:
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                # In a real app, send this via email
                reset_link = f"http://localhost:5173/reset-password/{uid}/{token}"
                print("\n" + "="*50)
                print(f"PASSWORD RESET LINK:\n{reset_link}")
                print("="*50 + "\n")
                return Response({'message': 'Password reset email sent (check server console).', 'uid': uid, 'token': token}, status=status.HTTP_200_OK)
            return Response({'error': 'User with this email not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            uid = serializer.validated_data['uidb64']
            token = serializer.validated_data['token']
            password = serializer.validated_data['password']
            
            try:
                uid = force_str(urlsafe_base64_decode(uid))
                user = User.objects.get(pk=uid)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                user = None

            if user is not None and default_token_generator.check_token(user, token):
                user.set_password(password)
                user.save()
                return Response({'message': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid token or user.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MakeList(generics.ListAPIView):
    queryset = Make.objects.all()
    serializer_class = MakeSerializer

class MakeModelList(generics.ListAPIView):
    serializer_class = MakeModelSerializer

    def get_queryset(self):
        queryset = MakeModel.objects.all()
        make_id = self.request.query_params.get('make_id')
        if make_id is not None:
            queryset = queryset.filter(make_id=make_id)
        return queryset

class BodyList(generics.ListAPIView):
    queryset = Body.objects.all()
    serializer_class = BodySerializer

class DriveTypeList(generics.ListAPIView):
    queryset = DriveType.objects.all()
    serializer_class = DriveTypeSerializer

class VehicleDetailList(generics.ListAPIView):
    serializer_class = VehicleDetailSerializer

    def get_queryset(self):
        queryset = VehicleDetail.objects.all()
        
        # Exact matches
        make_id = self.request.query_params.get('make_id')
        model_id = self.request.query_params.get('model_id')
        year = self.request.query_params.get('year')
        
        # Name matches
        make_name = self.request.query_params.get('make_name')
        engine = self.request.query_params.get('engine')

        # Ranges
        min_year = self.request.query_params.get('min_year')
        max_year = self.request.query_params.get('max_year')
        
        # Text search
        q = self.request.query_params.get('q')
        
        # Price filtering (Annotate first)
        from django.db.models import F, Case, When, Value, IntegerField
        
        # Formula: 20000 + (year - 1990) * 500 + (engine_cc || 2000) * 5
        # Handle nulls for year and engine_cc
        queryset = queryset.annotate(
            year_val=Case(
                When(year__isnull=False, then=F('year')),
                default=Value(2000),
                output_field=IntegerField()
            ),
            engine_cc_val=Case(
                When(engine_cc__isnull=False, then=F('engine_cc')),
                default=Value(2000),
                output_field=IntegerField()
            )
        ).annotate(
            price=Value(20000) + (F('year_val') - 1990) * 500 + F('engine_cc_val') * 5
        )

        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')

        if make_id:
            queryset = queryset.filter(make_id=make_id)
        if make_name:
            queryset = queryset.filter(make__make_name__iexact=make_name)
        if model_id:
            queryset = queryset.filter(model_id=model_id)
        if year:
            queryset = queryset.filter(year=year)
        if engine:
            queryset = queryset.filter(engine__icontains=engine)
            
        if min_year:
            queryset = queryset.filter(year__gte=min_year)
        if max_year:
            queryset = queryset.filter(year__lte=max_year)
            
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
            
        if q:
            # Log search query
            # Simple debounce/spam check could be added here, but for now just log
            if len(q.strip()) > 2:
                analytics, created = SearchAnalytics.objects.get_or_create(query=q.lower())
                if not created:
                    analytics.count = F('count') + 1
                    analytics.save()

            from django.db.models import Q
            queryset = queryset.filter(
                Q(vehicle_display_name__icontains=q) |
                Q(make__make_name__icontains=q) |
                Q(model__model_name__icontains=q)
            )
        
        # Sorting
        sort_by = self.request.query_params.get('sort_by')
        if sort_by == 'views':
            queryset = queryset.order_by('-metadata__views_count')
        elif sort_by == 'year_desc':
            queryset = queryset.order_by('-year')
        elif sort_by == 'price_asc':
            queryset = queryset.order_by('price')
        elif sort_by == 'price_desc':
            queryset = queryset.order_by('-price')
            
        return queryset

class ChatView(APIView):
    def post(self, request):
        user_message = request.data.get('message')
        context = request.data.get('context', {})
        history = request.data.get('history', [])
        
        if not user_message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Read system prompt
        try:
            with open(os.path.join(settings.BASE_DIR, 'ai_system_prompt.txt'), 'r') as f:
                system_prompt_text = f.read()
        except FileNotFoundError:
            system_prompt_text = "You are a helpful assistant."

        # Construct messages list for Ollama /api/chat
        messages = [{'role': 'system', 'content': system_prompt_text}]
        
        # Add history
        for msg in history:
            messages.append({
                'role': msg.get('role', 'user'),
                'content': msg.get('content', '')
            })
            
        # Add current message with context
        context_str = f"\nContext: {context}" if context else ""
        messages.append({
            'role': 'user',
            'content': f"{user_message}{context_str}"
        })

        # Call Ollama Chat API
        try:
            ollama_response = requests.post('http://localhost:11434/api/chat', json={
                'model': 'gpt-oss:20b-cloud',
                'messages': messages,
                'stream': False
            })
            
            if ollama_response.status_code == 200:
                response_data = ollama_response.json()
                # Ollama /api/chat returns 'message': {'role': 'assistant', 'content': '...'}
                ai_content = response_data.get('message', {}).get('content', '')
                return Response({'response': ai_content})
            else:
                # Fallback to generate if chat fails (older ollama or model issues)
                return self.fallback_generate(system_prompt_text, history, user_message, context)
                
        except requests.exceptions.RequestException as e:
            return Response({'error': f'AI Service Unavailable: {str(e)}'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    def fallback_generate(self, system_prompt, history, user_message, context):
        # Construct full prompt from history
        full_prompt = f"{system_prompt}\n\n"
        for msg in history:
            role = "User" if msg.get('role') == 'user' else "Assistant"
            full_prompt += f"{role}: {msg.get('content')}\n"
        
        full_prompt += f"Context: {context}\nUser: {user_message}\nAssistant:"
        
        try:
            ollama_response = requests.post('http://localhost:11434/api/generate', json={
                'model': 'gpt-oss:20b-cloud',
                'prompt': full_prompt,
                'stream': False
            })
            if ollama_response.status_code == 200:
                return Response({'response': ollama_response.json().get('response', '')})
        except:
            pass
        return Response({'error': 'Failed to communicate with AI'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

class FavoriteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        favorites = Favorite.objects.filter(user=request.user)
        vehicles = [f.vehicle for f in favorites]
        return Response(VehicleDetailSerializer(vehicles, many=True).data)

    def post(self, request):
        vehicle_id = request.data.get('vehicle_id')
        if not vehicle_id:
            return Response({'error': 'Vehicle ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            vehicle = VehicleDetail.objects.get(id=vehicle_id)
        except VehicleDetail.DoesNotExist:
            return Response({'error': 'Vehicle not found'}, status=status.HTTP_404_NOT_FOUND)
            
        favorite, created = Favorite.objects.get_or_create(user=request.user, vehicle=vehicle)
        
        if not created:
            favorite.delete()
            return Response({'status': 'removed'})
        
        return Response({'status': 'added'})

class ReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        vehicle_id = request.data.get('vehicle_id')
        rating = request.data.get('rating')
        comment = request.data.get('comment')
        
        if not all([vehicle_id, rating, comment]):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            vehicle = VehicleDetail.objects.get(id=vehicle_id)
        except VehicleDetail.DoesNotExist:
            return Response({'error': 'Vehicle not found'}, status=status.HTTP_404_NOT_FOUND)
            
        review = Review.objects.create(
            user=request.user,
            vehicle=vehicle,
            rating=rating,
            comment=comment
        )
        
        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def delete(self, request):
        user = request.user
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ReviewDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            review = Review.objects.get(pk=pk)
        except Review.DoesNotExist:
            return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.user == review.user or request.user.is_staff:
            review.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

from .models import VehicleMetadata, VehicleImage
from .serializers import VehicleMetadataSerializer, VehicleImageSerializer

class VehicleUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        if not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            vehicle = VehicleDetail.objects.get(pk=pk)
        except VehicleDetail.DoesNotExist:
            return Response({'error': 'Vehicle not found'}, status=status.HTTP_404_NOT_FOUND)

        # Get or create metadata
        metadata, created = VehicleMetadata.objects.get_or_create(vehicle=vehicle)
        
        serializer = VehicleMetadataSerializer(metadata, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # Return updated vehicle details
            return Response(VehicleDetailSerializer(vehicle).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VehicleImageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            vehicle = VehicleDetail.objects.get(pk=pk)
        except VehicleDetail.DoesNotExist:
            return Response({'error': 'Vehicle not found'}, status=status.HTTP_404_NOT_FOUND)

        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Create image
        image = VehicleImage.objects.create(vehicle=vehicle, image=image_file)
        
        return Response(VehicleImageSerializer(image).data, status=status.HTTP_201_CREATED)

class VehicleImageDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        if not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            image = VehicleImage.objects.get(pk=pk)
        except VehicleImage.DoesNotExist:
            return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)

        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # General Stats
        total_vehicles = VehicleDetail.objects.count()
        total_users = User.objects.count()
        total_reviews = Review.objects.count()
        
        # Search Analytics
        daily_searches = SearchAnalytics.objects.filter(
            last_searched__gte=timezone.now() - timedelta(days=1)
        ).order_by('-count')[:5]
        
        monthly_searches = SearchAnalytics.objects.filter(
            last_searched__gte=timezone.now() - timedelta(days=30)
        ).order_by('-count')[:10]

        return Response({
            'total_vehicles': total_vehicles,
            'total_users': total_users,
            'total_reviews': total_reviews,
            'daily_searches': SearchAnalyticsSerializer(daily_searches, many=True).data,
            'monthly_searches': SearchAnalyticsSerializer(monthly_searches, many=True).data
        })

class VehicleUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        if not file.name.endswith('.csv'):
             return Response({'error': 'Only CSV files are supported currently'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            decoded_file = file.read().decode('utf-8').splitlines()
            reader = csv.DictReader(decoded_file)
            
            # Check required columns
            required_columns = ['make', 'model', 'year', 'price', 'engine']
            if not all(col in reader.fieldnames for col in required_columns):
                 return Response({'error': f'Missing required columns: {required_columns}'}, status=status.HTTP_400_BAD_REQUEST)

            success_count = 0
            errors = []

            for index, row in enumerate(reader):
                try:
                    # Find or create Make
                    make, _ = Make.objects.get_or_create(
                        make_name=row['make'],
                        defaults={'make_id': Make.objects.count() + 1000 + index}
                    )
                    
                    # Find or create Model
                    model, _ = MakeModel.objects.get_or_create(
                        model_name=row['model'],
                        make=make,
                        defaults={'model_id': MakeModel.objects.count() + 1000 + index}
                    )

                    # Create Vehicle
                    new_id = VehicleDetail.objects.order_by('-id').first().id + 1 if VehicleDetail.objects.exists() else 1
                    
                    vehicle = VehicleDetail.objects.create(
                        id=new_id,
                        make=make,
                        model=model,
                        year=row.get('year'),
                        engine=row.get('engine'),
                        vehicle_display_name=f"{make.make_name} {model.model_name} {row.get('year')}"
                    )
                    
                    # Handle Image URL
                    if 'image_url' in row and row['image_url']:
                        VehicleImage.objects.create(vehicle=vehicle, image_url=row['image_url'], is_primary=True)

                    success_count += 1
                except Exception as e:
                    errors.append(f"Row {index}: {str(e)}")

            return Response({
                'status': 'success',
                'imported_count': success_count,
                'errors': errors
            })

        except Exception as e:
            return Response({'error': f'Error processing file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

class VehicleUploadTemplateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename=vehicle_upload_template.csv'
        
        writer = csv.writer(response)
        writer.writerow(['make', 'model', 'year', 'price', 'engine', 'image_url'])
        writer.writerow(['Toyota', 'Camry', '2022', '25000', '2.5L 4-Cylinder', 'https://example.com/camry.jpg'])
        writer.writerow(['BMW', 'X5', '2023', '60000', '3.0L 6-Cylinder', 'https://example.com/x5.jpg'])
            
        return response

class HomepageFeatureView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        features = HomepageFeature.objects.all()
        response = Response(HomepageFeatureSerializer(features, many=True).data)
        response['Content-Type'] = 'application/json; charset=utf-8'
        return response

    def post(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        # Expecting a list of features to replace existing ones or update
        # For simplicity, let's say we replace all features or update specific ones.
        # The frontend sends the full list.
        
        features_data = request.data
        if not isinstance(features_data, list):
            return Response({'error': 'Expected a list of features'}, status=status.HTTP_400_BAD_REQUEST)

        # Clear existing features (optional, depending on requirement. Let's replace for now to keep sync simple)
        HomepageFeature.objects.all().delete()
        
        created_features = []
        for feature_data in features_data:
            serializer = HomepageFeatureSerializer(data=feature_data)
            if serializer.is_valid():
                serializer.save()
                created_features.append(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        return Response(created_features, status=status.HTTP_201_CREATED)

class VehicleRetrieveView(generics.RetrieveAPIView):
    queryset = VehicleDetail.objects.all()
    serializer_class = VehicleDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        metadata, created = VehicleMetadata.objects.get_or_create(vehicle=instance)
        metadata.views_count += 1
        metadata.save()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

