import requests
import json

# We need a token. Since we can't easily get one without login flow, 
# and I previously disabled auth to test, I might need to disable it again 
# OR use the existing session if I can hijack it (hard).
# BUT, I can just use the Django test client or shell to simulate the view response.

# Let's use Django test client in a script.
import os
import django
import sys

sys.path.append(r'c:\Users\amerz\Desktop\avds--ag\AVDSBack')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'avdsback.settings')
django.setup()

from django.test import RequestFactory
from api.views import HomepageFeatureView
from api.models import HomepageFeature

# Create a request
factory = RequestFactory()
request = factory.get('/api/admin/features/')

# Force user to be staff
from django.contrib.auth.models import User
user = User.objects.filter(is_staff=True).first()
if not user:
    print("No staff user found!")
    sys.exit(1)
request.user = user

# Get response
view = HomepageFeatureView.as_view()
response = view(request)

print(f"Status Code: {response.status_code}")
print("Response Content:")
# Decode manually to see if it works
try:
    content = response.render().content.decode('utf-8')
    print(content)
except Exception as e:
    print(f"Error decoding: {e}")
    print(response.render().content)
