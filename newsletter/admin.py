from unfold.admin import ModelAdmin
from django.contrib import admin
from .models import NewsletterSubscriber


# Register your models here.
@admin.register(NewsletterSubscriber)
class NewsletterAdminClass(ModelAdmin):
    list_display = (
        'email',
        'created_at'
        )

    search_fields = (
        'email',
        )

    list_filter = ('created_at',)

    date_hierarchy = 'created_at'
