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
    path("add-bullet-item/<str:bullet_type>/", views.AddBulletItem.as_view(),
         name="add_bullet_item"),
    path(
        "remove-<str:bullet_type>/<int:bullet_id>/", views.RemoveBulletItem.as_view(),
        name="remove_bullet_item"
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
    path(
      "edit-item/<str:item_type>/<int:item_id>/",
      views.EditItem.as_view(),
      name="edit_item",
    ),
    path(
      "delete-item/<str:item_type>/<int:item_id>/",
      views.DeleteItem.as_view(),
      name="delete_item",
    ),
]
