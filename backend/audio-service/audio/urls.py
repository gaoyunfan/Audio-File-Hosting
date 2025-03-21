from django.urls import path
from . import views

urlpatterns = [
    path("hello/", views.TestView.as_view(), name="hello"),
    path("upload/", views.PreUploadView.as_view(), name="presign_upload"),
    path("audios/", views.AudioListView.as_view(), name="audio_list"),
    path("categories/", views.CategoryListView.as_view(), name="category-list"),
    path(
        "categories/<int:category_id>/",
        views.CategoryDetailView.as_view(),
        name="category-detail",
    ),
    path(
        "audios/<int:audio_id>/", views.AudioDetailView.as_view(), name="audio-detail"
    ),
    path(
        "audios/purge/",
        views.UserAudioPurgeView.as_view(),
        name="user-audio-delete-all",
    ),
]
