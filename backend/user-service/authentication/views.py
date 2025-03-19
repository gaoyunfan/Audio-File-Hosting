import datetime
from django.contrib.auth import get_user_model, authenticate
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction
from users.serializers import UserSerializer


User = get_user_model()


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(request, username=username, password=password)

        if user is not None:
            token = RefreshToken.for_user(user)

            return Response(
                {
                    "refresh": str(token),
                    "access": str(token.access_token),
                    "user": UserSerializer(user).data,
                }
            )
        return Response({"message": "Invalid credentials"}, status=401)


class RegisterView(APIView):
    @transaction.atomic
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        password2 = request.data.get("password2")
        print(f"username: {username}, password: {password}, password2: {password2}")
        if not username or not password or not password2:
            return Response(
                {"message": "Username, password and confirmed password are required"},
                status=400,
            )

        if password != password2 or len(password) < 8:
            return Response({"message": "Invalid username or password"}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"message": "User already exists"}, status=400)

        user = User(username=username)
        user.set_password(password)
        user.save()

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        return Response(
            {
                "message": "User created",
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(access),
            },
            status=201,
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


class CustomTokenRefreshView(APIView):

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"error": "Refresh token is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            old_expiration = token["exp"]
            new_refresh_token = RefreshToken.for_user(token.user)
            new_refresh_token.set_exp(
                from_time=datetime.utcfromtimestamp(old_expiration)
            )
            new_access_token = new_refresh_token.access_token

            return Response(
                {"access": str(new_access_token), "refresh": str(new_refresh_token)}
            )

        except Exception as e:
            return Response(
                {"error": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED
            )
