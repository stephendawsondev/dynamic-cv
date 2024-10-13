from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Summary


@admin.register(Summary)
class SummaryAdminClass(ModelAdmin):
    pass