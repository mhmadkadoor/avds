import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'avdsback.settings')
django.setup()

from api.models import VehicleImage

def reset_images():
    count = VehicleImage.objects.count()
    print(f"Deleting {count} existing vehicle images...")
    VehicleImage.objects.all().delete()
    print("All vehicle images deleted.")

if __name__ == '__main__':
    reset_images()
