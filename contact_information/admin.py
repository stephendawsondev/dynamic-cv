from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import ContactInformation


@admin.register(ContactInformation)
class ContactInformationAdminClass(ModelAdmin):
    pass
