from django.urls import path
from . import views

urlpatterns = [
    path('', views.ProfileView.as_view(), name="profile"),
    path('contact-information/', views.CreateUpdateContactInformation.as_view(),
         name='contact-information'),
    path('update-summary/<slug:pk>/', views.UpdateSummary.as_view(), name='update-summary')
]
