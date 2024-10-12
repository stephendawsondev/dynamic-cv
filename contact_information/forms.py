# contact_info/forms.py
from django import forms
from .models import ContactInformation


class ContactInformationForm(forms.ModelForm):
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
