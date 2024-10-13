from django import forms
from django_ckeditor_5.widgets import CKEditor5Widget
from .models import Summary, ContactInformation, WorkExperience


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
          'summary': forms.Textarea(attrs={'rows':10, 'cols':15}),
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


class WorkExperienceForm(forms.ModelForm):
    """
    Form to add work experience
    """
    class Meta:
        model = WorkExperience
        fields = [
            'organization', 'position', 'start_date', 'end_date',
        ]
        labels = {
            'organization': 'Company Name',
            'position': 'Job Title',
            'start_date': 'Start',
            'end_date': 'End',
        }
