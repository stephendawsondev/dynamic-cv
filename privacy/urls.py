from django.urls import path
from . import views

urlpatterns = [
    path("policy/", views.PrivacyPolicy.as_view(), name="privacy_policy"),
]
