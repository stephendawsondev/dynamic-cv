from django.urls import path
from . import views

urlpatterns = [
    path('', views.ProfileView.as_view(), name="profile"),
    path('update-summary/<slug:pk>/', views.UpdateSummary.as_view(), name='update-summary')
]
