from rest_framework import serializers
from .models import Category, AudioFile


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class AudioFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), write_only=True
    )
    category_data = CategorySerializer(source="category", read_only=True)
    upload_date = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = AudioFile
        fields = [
            "id",
            "file_name",
            "description",
            "category",
            "owner",
            "category_data",
            "upload_date",
            "file_url",
        ]

    def get_file_url(self, obj):
        return obj.file_url
