from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .auth import get_user_id_from_token
from rest_framework.exceptions import AuthenticationFailed


class JWTProtectedAPIView(APIView):
    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        self.user_id = get_user_id_from_token(request)
        if not self.user_id:
            raise AuthenticationFailed("Invalid or missing token")
