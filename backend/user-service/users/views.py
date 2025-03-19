from django.contrib.auth import get_user_model, authenticate
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer
from django.db import transaction

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


class LogoutView(APIView):

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out."}, status=200)
        except Exception as e:
            return Response(
                {"message": "Invalid token or token already expired."}, status=400
            )


class RegisterView(APIView):
    @transaction.atomic
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        password2 = request.data.get("password2")

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
                "User": UserSerializer(user).data,
                "refresh_token": str(refresh),
                "access_token": str(access),
            },
            status=201,
        )


class UserListView(generics.ListAPIView):

    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
