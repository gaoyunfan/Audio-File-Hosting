import os
from django.contrib.auth import get_user_model
from audio.models import Category

User = get_user_model()

username = os.getenv("DJANGO_SUPERUSER_USERNAME", "admin")
email = os.getenv("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
password = os.getenv("DJANGO_SUPERUSER_PASSWORD", "adminpassword")

if not User.objects.filter(username=username).exists():
    print(f"Creating superuser {username}...")
    User.objects.create_superuser(username=username, email=email, password=password)
else:
    print(f"Superuser {username} already exists.")

default_categories = ["News", "Music", "Podcast", "Lecture"]

for cat_name in default_categories:
    obj, created = Category.objects.get_or_create(name=cat_name)
    if created:
        print(f"Created category: {cat_name}")
