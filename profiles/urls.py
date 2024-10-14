from django.urls import path
from . import views

urlpatterns = [
    path("", views.ProfileView.as_view(), name="profile"),
    path(
        "contact-information/",
        views.CreateUpdateContactInformation.as_view(),
        name="contact-information",
    ),
    path("update-summary/", views.UpdateSummary.as_view(), name="update-summary"),
    path("add-skill/<slug:skill>/", views.AddSkill.as_view(), name="add_skill"),
    path(
        "remove-skill/<slug:skill>/", views.RemoveSkill.as_view(), name="remove_skill"
    ),
    path(
        "add-work-experience/",
        views.AddWorkExperience.as_view(),
        name="add_work_experience",
    ),
    path(
        "add-education/",
        views.AddEducation.as_view(),
        name="add_education",
    ),
    path(
        "add-project/", views.AddProject.as_view(), name="add_project",
    ),
]
