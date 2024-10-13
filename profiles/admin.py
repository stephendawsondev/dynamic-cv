from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Summary, ContactInformation


@admin.register(Summary)
class SummaryAdminClass(ModelAdmin):
    pass


@admin.register(ContactInformation)
class ContactInformationAdminClass(ModelAdmin):
    pass
