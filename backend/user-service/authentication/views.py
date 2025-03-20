from django.contrib.auth import get_user_model, authenticate
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db import transaction
from users.serializers import RegisterSerializer, UserSerializer
from authentication.serializers import CustomTokenObtainPairSerializer

import logging

logger = logging.getLogger("custom_logger")


User = get_user_model()


class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            tokens = serializer.validated_data
            user = serializer.user

            user_data = UserSerializer(user).data

            return Response(
                {
                    "refresh": tokens["refresh"],
                    "access": tokens["access"],
                    "user": user_data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {"message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
        )


class RegisterView(APIView):
    @transaction.atomic
    def post(self, request):
        print("register request", request.data)
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            refresh = RefreshToken.for_user(user)
            access = refresh.access_token

            return Response(
                {
                    "message": "User created successfully",
                    "user": UserSerializer(user).data,
                    "refresh": str(refresh),
                    "access": str(access),
                },
                status=status.HTTP_201_CREATED,
            )
        print("register errors", serializer.errors)
        return Response(
            {"message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
        )


class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out."}, status=200)
        except Exception as e:
            return Response(
                {"message": "Invalid token or token already expired."}, status=200
            )
