from django.urls import path
from . import views

urlpatterns = [
    path("cv-list/", views.CvList.as_view(), name="cv_list"),
    path("cv-template/", views.CreateCV.as_view(), name="cv_template"),
    path("generated-cv/<uuid:pk>/", views.GeneratedCV.as_view(), name="generated_cv"),
    path("analyze-cv/<uuid:pk>/", views.CVAnalyzerView.as_view(), name="analyze_cv"),
    path("view-analysis/<slug:pk>/", views.CVAnalysisDetail.as_view(), name="view_analysis"),
]
