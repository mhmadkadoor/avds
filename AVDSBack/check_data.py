import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'avdsback.settings')
django.setup()

from api.models import VehicleDetail

def check_data():
    count = VehicleDetail.objects.count()
    print(f"VehicleDetail count: {count}")
    if count > 0:
        print("First 5 vehicles:")
        for v in VehicleDetail.objects.all()[:5]:
            print(f"- {v.vehicle_display_name} (ID: {v.id})")

if __name__ == "__main__":
    check_data()
