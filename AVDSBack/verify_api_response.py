from rest_framework.test import APIClient
from django.contrib.auth.models import User
from api.models import HomepageFeature

# Setup client
client = APIClient()
user = User.objects.filter(is_staff=True).first()
if user:
    client.force_authenticate(user=user)
    response = client.get('/api/admin/features/')
    print(f"Status: {response.status_code}")
    print(f"Content-Type: {response['Content-Type']}")
    print(f"Charset: {response.charset}")
    
    # Print raw bytes of the first feature's title_tr
    data = response.json()
    if data:
        print(f"First feature title_tr: {data[0]['title_tr']}")
        print(f"Hex: {data[0]['title_tr'].encode('utf-8').hex(' ')}")
    else:
        print("No data returned")
else:
    print("No staff user found")
