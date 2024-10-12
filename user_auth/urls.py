from django.urls import path
from .views import CustomLoginView

urlpatterns = [
    path('accounts/login', CustomLoginView.as_view(), name='account_login'),
]
