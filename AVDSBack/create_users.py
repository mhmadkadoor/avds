import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'avdsback.settings')
django.setup()

from django.contrib.auth.models import User

def create_users():
    # Create Admin
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
        print("Superuser 'admin' created with password 'admin123'")
    else:
        print("Superuser 'admin' already exists")

    # Create Normal User
    if not User.objects.filter(username='user').exists():
        User.objects.create_user('user', 'user@example.com', 'user123')
        print("User 'user' created with password 'user123'")
    else:
        print("User 'user' already exists")

if __name__ == '__main__':
    create_users()
