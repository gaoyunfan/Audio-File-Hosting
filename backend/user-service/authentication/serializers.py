from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)
from rest_framework import serializers
from users.models import User
from rest_framework_simplejwt.tokens import RefreshToken


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["isAdmin"] = user.is_staff or user.is_superuser

        return token


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        refresh = RefreshToken(attrs["refresh"])
        user_id = refresh.payload.get("user_id")

        if not User.objects.filter(id=user_id).exists():
            raise serializers.ValidationError("User no longer exists.")

        return data
