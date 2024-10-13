from django import forms
from django_ckeditor_5.widgets import CKEditor5Widget
from .models import CVTemplate


class CVTemplateForm(forms.ModelForm):
    """ Form to create a CV """
    class Meta:
        model = CVTemplate
        fields = [
            'cv_name',
            'use_default_summary',
            'summary',
            'contact_information',
            'skills',
            'work_experience',
            'education'
        ]
    
        widgets = {
                "summary": CKEditor5Widget(
                    attrs={"class": "django_ckeditor_5"}, config_name="default"
                )
            }
