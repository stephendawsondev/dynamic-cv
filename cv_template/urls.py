from django.urls import path
from . import views

urlpatterns = [
    path('cv-list/', views.CvList.as_view(), name='cv_list'),
    path('cv-template/', views.CreateCV.as_view(), name='cv_template'),
]
