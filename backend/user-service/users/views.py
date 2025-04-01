from django.contrib.auth import get_user_model, authenticate
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import EditUserSerializer, UserSerializer
from django.db import transaction
from .permissions import IsSelfOrAdminOrReadOnly
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import requests
import os

User = get_user_model()


class UserListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all().order_by("username")
    serializer_class = UserSerializer


class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSelfOrAdminOrReadOnly]

    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        if not user:
            return Response(
                {"message": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def patch(self, request, pk):

        user = get_object_or_404(User, pk=pk)
        if not user:
            return Response(
                {"message": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = EditUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        if not user:
            return Response(
                {"message": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        audio_service_url = os.getenv("AUDIO_SERVICE_URL")
        auth_header = request.headers.get("Authorization")
        if audio_service_url:
            try:
                audio_response = requests.delete(
                    f"{audio_service_url}/audios/purge/",
                    headers={"Authorization": auth_header},
                    timeout=5,
                )
                if audio_response.status_code >= 400:
                    print(
                        "Warning: audio service responded with",
                        audio_response.status_code,
                    )
                else:
                    print("Audio service responded with", audio_response.status_code)
            except Exception as e:
                print("Audio service error:", str(e))
        user.delete()
        return Response(
            {"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT
        )
