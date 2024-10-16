from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import CVTemplate, CVAnalysis


@admin.register(CVTemplate)
class CustomCVTemplateClass(ModelAdmin):
    list_display = ("pk", "user", "cv_name", "created_at", "updated_at")


@admin.register(CVAnalysis)
class CVAnalysisAdminClass(ModelAdmin):
    pass