from django.contrib import admin
from .models import Category, AudioFile


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(AudioFile)
class AudioFileAdmin(admin.ModelAdmin):
    list_display = ("id", "file_name", "owner", "category", "upload_date")
    search_fields = ("file_name", "description")
    list_filter = ("category", "upload_date")
