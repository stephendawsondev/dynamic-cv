from django.contrib import admin
from .models import Summary


@admin.register(Summary)
class SummaryAdminClass(admin.ModelAdmin):
    pass
