from django.urls import path
from . import views

urlpatterns = [
    path("", views.contact_us, name="contact_us"),
    path("success/", views.contact_us_success, name="contact_us_success"),
]
