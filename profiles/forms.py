from django import forms
from django_ckeditor_5.widgets import CKEditor5Widget
from .models import Summary, ContactInformation


class SummaryForm(forms.ModelForm):
    """
    Form to create a profile
    """

    class Meta:
        model = Summary
        fields = ['summary']
        # specify fields
        labels = {
            'summary': 'Default Summary'
        }

        widgets = {
            "summary": CKEditor5Widget(
                attrs={"class": "django_ckeditor_5"}, config_name="default"
            )
        }


class ContactInformationForm(forms.ModelForm):
    """
    Form to create contact information.
    """
    class Meta:
        model = ContactInformation
        fields = [
            'first_name', 'last_name', 'email', 'phone_number',
            'address1', 'address2', 'city', 'zip_code', 'country',
            'linkedin', 'github'
        ]
        labels = {
            "address1": "Address Line 1",
            "address2": "Address Line 2",
            "github": "GitHub URL",
            "linkedin": "LinkedIn URL"
        }
