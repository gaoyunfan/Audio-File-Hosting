# audio/views.py
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
import boto3
import os
import uuid
from .models import AudioFile, Category
from .base import JWTProtectedAPIView
from .serializers import AudioFileSerializer, CategorySerializer
from django.db import transaction


class TestView(JWTProtectedAPIView):
    def get(self, request):
        return Response({"user_id": self.user_id})


class PreUploadView(JWTProtectedAPIView):

    @transaction.atomic
    def post(self, request):
        user_id = self.user_id
        filename = request.data.get("filename")
        description = request.data.get("description", "")
        category_id = request.data.get("category_id")
        print(f"request data: {request.data}", flush=True)
        if not filename or not category_id:
            return Response({"message": "Missing required fields"}, status=400)

        if "." in filename:
            file_ext = filename.split(".")[-1]
        else:
            file_ext = "mp3"
        key = f"audio/{uuid.uuid4()}.{file_ext}"

        category = get_object_or_404(Category, pk=category_id)
        try:
            audio = AudioFile.objects.create(
                file_name=filename,
                file_key=key,
                description=description,
                category=category,
                owner=user_id,
            )
            print(f"Created audio: {audio.file_name}", flush=True)
            print(
                "ENV:",
                {
                    "MINIO_ENDPOINT": os.getenv("MINIO_ENDPOINT"),
                    "MINIO_ACCESS_KEY": os.getenv("MINIO_ACCESS_KEY"),
                    "MINIO_SECRET_KEY": os.getenv("MINIO_SECRET_KEY"),
                    "MINIO_BUCKET": os.getenv("MINIO_BUCKET"),
                },
                flush=True,
            )

            s3 = boto3.client(
                "s3",
                endpoint_url=os.getenv("MINIO_ENDPOINT"),
                aws_access_key_id=os.getenv("MINIO_ACCESS_KEY"),
                aws_secret_access_key=os.getenv("MINIO_SECRET_KEY"),
                region_name=os.getenv("AWS_S3_REGION_NAME", "us-east-1"),
            )
            bucket = os.getenv("MINIO_BUCKET", "audio-files")

            existing_buckets = s3.list_buckets().get("Buckets", [])
            if bucket not in [b["Name"] for b in existing_buckets]:
                print(f"Creating bucket: {bucket}", flush=True)
                s3.create_bucket(Bucket=bucket)
            upload_url = s3.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": bucket,
                    "Key": key,
                    "ContentType": "audio/mpeg",
                },
                ExpiresIn=300,
            )

            return Response(
                {"id": audio.id, "upload_url": upload_url, "file_key": key}, status=201
            )
        except Exception as e:
            print(e, flush=True)
            return Response({"message": "Internal server error"}, status=500)


class AudioDetailView(JWTProtectedAPIView):
    @transaction.atomic
    def put(self, request, audio_id):
        audio = get_object_or_404(AudioFile, id=audio_id)
        if audio.owner != self.user_id:
            return Response({"message": "Unauthorized"}, status(403))
        description = request.data.get("description")
        category_id = request.data.get("category_id")
        filename = request.data.get("filename")

        if not description or not category_id:
            return Response(
                {"message": "Both description and category_id are required."},
                status=400,
            )

        try:
            audio.description = description
            audio.category_id = category_id
            audio.file_name = filename
            audio.save()
            return Response(AudioFileSerializer(audio).data)
        except Exception as e:
            print("Update failed:", e, flush=True)
            return Response({"message": "Update failed"}, status=500)

    @transaction.atomic
    def delete(self, request, audio_id):
        print(f"Deleting audio: {audio_id} with userid, {self.user_id}", flush=True)
        audio = get_object_or_404(AudioFile, id=audio_id)

        if audio.owner != self.user_id:
            return Response({"message": "Unauthorized"}, status=403)
        s3 = boto3.client(
            "s3",
            endpoint_url=os.getenv("MINIO_ENDPOINT"),
            aws_access_key_id=os.getenv("MINIO_ACCESS_KEY"),
            aws_secret_access_key=os.getenv("MINIO_SECRET_KEY"),
            region_name=os.getenv("AWS_S3_REGION_NAME", "us-east-1"),
        )
        bucket = os.getenv("MINIO_BUCKET", "audio-files")

        try:
            s3.delete_object(Bucket=bucket, Key=audio.file_key)
            print(f"Deleted file {audio.file_key} from S3", flush=True)
        except Exception as e:
            print(f"Warning: Failed to delete from S3: {e}", flush=True)

        try:
            audio.delete()
            return Response(status=204)
        except Exception as e:
            print("Delete failed:", e, flush=True)
            return Response({"message": "Delete failed"}, status=500)


class AudioListView(JWTProtectedAPIView):
    def get(self, request):
        audio_qs = AudioFile.objects.filter(owner=self.user_id).order_by("-upload_date")
        data = AudioFileSerializer(
            audio_qs, many=True, context={"request": request}
        ).data
        return Response(data)


# class CategoryListView(JWTProtectedAPIView):
class CategoryListView(APIView):
    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    @transaction.atomic
    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        serializer.save()
        return Response(serializer.data, status=201)


class CategoryDetailView(JWTProtectedAPIView):
    def get(self, request, category_id):
        category = Category.objects.get(pk=category_id)
        return Response(
            {
                "id": category.id,
                "name": category.name,
            }
        )

    def delete(self, request, category_id):
        category = get_object_or_404(Category, pk=category_id)
        try:
            category.delete()
            return Response(status=204)
        except Exception as e:
            return Response({"message": "Internal server error"}, status=500)

    @transaction.atomic
    def put(self, request, category_id):
        category = Category.objects.get(pk=category_id)
        category.name = request.data.get("name")
        if not category.name:
            return Response({"message": "Name is required"}, status=400)
        category.save()
        return Response(
            {
                "id": category.id,
                "name": category.name,
            }
        )


class UserAudioPurgeView(JWTProtectedAPIView):
    @transaction.atomic
    def delete(self, request):
        user_id = self.user_id
        audio_files = AudioFile.objects.filter(owner=user_id)

        s3 = boto3.client(
            "s3",
            endpoint_url=os.getenv("MINIO_ENDPOINT"),
            aws_access_key_id=os.getenv("MINIO_ACCESS_KEY"),
            aws_secret_access_key=os.getenv("MINIO_SECRET_KEY"),
            region_name=os.getenv("AWS_S3_REGION_NAME", "us-east-1"),
        )
        bucket = os.getenv("MINIO_BUCKET", "audio-files")

        errors = []

        for audio in audio_files:
            try:
                s3.delete_object(Bucket=bucket, Key=audio.file_key)
                print(f"Deleted from S3: {audio.file_key}", flush=True)
            except Exception as e:
                print(f"Failed to delete from S3: {audio.file_key}", flush=True)
                errors.append(str(e))

        deleted_count, _ = audio_files.delete()

        return Response(
            {
                "message": f"Deleted {deleted_count} audio file(s)",
                "s3_errors": errors,
            },
            status=200,
        )
