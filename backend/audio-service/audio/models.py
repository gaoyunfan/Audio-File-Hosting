from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class AudioFile(models.Model):
    file_name = models.CharField(max_length=255)
    file_key = models.CharField(max_length=512)
    owner = models.IntegerField()
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True
    )
    description = models.TextField(blank=True)
    upload_date = models.DateTimeField(auto_now_add=True)

    @property
    def file_url(self):
        import os, boto3

        s3 = boto3.client(
            "s3",
            endpoint_url=os.getenv("MINIO_ENDPOINT"),
            aws_access_key_id=os.getenv("MINIO_ACCESS_KEY"),
            aws_secret_access_key=os.getenv("MINIO_SECRET_KEY"),
            region_name=os.getenv("AWS_S3_REGION_NAME", "us-east-1"),
        )
        try:
            generated_url = s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": os.getenv("MINIO_BUCKET"), "Key": self.file_key},
                ExpiresIn=60 * 60 * 24 * 30,
            )
            generated_url = generated_url.replace("http://minio", "http://localhost")
            print(f"Generated URL: {generated_url}", flush=True)
            return generated_url
        except Exception:
            return None

    def __str__(self):
        return self.file_name
