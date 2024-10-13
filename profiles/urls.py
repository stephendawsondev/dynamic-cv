from django.urls import path
from . import views

urlpatterns = [
    path('', views.ProfileView.as_view(), name="profile"),
    path('contact-information/', views.CreateUpdateContactInformation.as_view(),
         name='contact-information'),
    path('update-summary/', views.UpdateSummary.as_view(), name='update-summary'),
    path('add-skill/<slug:skill>/', views.AddSkill.as_view(), name='add_skill'),
    path('remove-skill/<slug:skill>/', views.RemoveSkill.as_view(), name="remove_skill"),
    path('add-responsibility/', views.AddResponsibility.as_view(), name="add_responsibility")
]
