from django.urls import path
from . import views

urlpatterns = [
    path('', views.ProfileView.as_view(), name="profile"),
    path('create-summary/', views.CreateSummary.as_view(), name='create-summary')
]
