from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import ContactUs

# Register your models here.
@admin.register(ContactUs)
class ContactUsAdminClass(ModelAdmin):
    list_display = (
        'name',
        'email',
        'phone_number',
        'query',
        'created_at'
        )

    search_fields = (
        'name',
        'email',
        'phone_number',
        'query'
        )

    list_filter = ('created_at',)

    date_hierarchy = 'created_at'
