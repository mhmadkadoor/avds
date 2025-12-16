from django.contrib.auth.models import User
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'avdsback.settings')
django.setup()

users = User.objects.all()
print(f"Total users: {users.count()}")
for user in users:
    print(f"User: {user.username}, Is Staff: {user.is_staff}, Is Superuser: {user.is_superuser}")
