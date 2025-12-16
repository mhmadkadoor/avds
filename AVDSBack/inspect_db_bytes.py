import os
import django
import sys

# Add the project directory to the sys.path
sys.path.append(r'c:\Users\amerz\Desktop\avds--ag\AVDSBack')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'avdsback.settings')
django.setup()

from api.models import HomepageFeature

features = HomepageFeature.objects.all()
print(f"Total features: {features.count()}")

def print_hex(s):
    if not s: return "None"
    return " ".join("{:02x}".format(c) for c in s.encode('utf-8'))

for feature in features:
    print(f"ID: {feature.id}")
    print(f"Title (TR): {feature.title_tr}")
    print(f"Hex (TR): {print_hex(feature.title_tr)}")
    print(f"Title (AR): {feature.title_ar}")
    print(f"Hex (AR): {print_hex(feature.title_ar)}")
    print("-" * 20)
