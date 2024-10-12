from django.urls import path
from . import views

urlpatterns = [
    path('', views.ProfileView.as_view(), name="profile"),
    path('update-summary/<slug:pk>/', views.UpdateSummary.as_view(), name='update-summary'),
    path('add-skill/<slug:skill>', views.AddSkill.as_view(), name='add_skill'),
]
