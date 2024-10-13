from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import CVTemplate


@admin.register(CVTemplate)
class CustomCVTemplateClass(ModelAdmin):
    list_display = ('pk', 'user', 'cv_name', 'created_at', 'updated_at')