from django.urls import path
from .views import CustomLoginView, CustomSignupView

urlpatterns = [
    path('accounts/login', CustomLoginView.as_view(), name='account_login'),
    path('accounts/signup', CustomSignupView.as_view(), name='account_signup'),
]
