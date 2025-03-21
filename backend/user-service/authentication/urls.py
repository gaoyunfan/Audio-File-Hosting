from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .views import LogoutView, RegisterView, LoginView, CustomTokenRefreshView

urlpatterns = [
    path("login/", LoginView.as_view(), name="login "),
    path("register/", RegisterView.as_view(), name="register"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("refresh/", CustomTokenRefreshView.as_view(), name="token_refresh"),
    path("verify/", TokenVerifyView.as_view(), name="token_verify"),
]
