from django import forms
from django_ckeditor_5.widgets import CKEditor5Widget
from .models import Summary, ContactInformation, WorkExperience, \
     Education, Project


class SummaryForm(forms.ModelForm):
    """
    Form to create a profile
    """

    class Meta:
        model = Summary
        fields = ["summary"]
        # specify fields
        labels = {"summary": "Default Summary"}
        widgets = {
            "summary": forms.Textarea(attrs={"rows": 10, "cols": 15}),
        }


class ContactInformationForm(forms.ModelForm):
    """
    Form to create contact information.
    """

    class Meta:
        model = ContactInformation
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "address1",
            "address2",
            "city",
            "zip_code",
            "country",
            "linkedin",
            "github",
        ]
        labels = {
            "address1": "Address Line 1",
            "address2": "Address Line 2",
            "github": "GitHub URL",
            "linkedin": "LinkedIn URL",
        }


class WorkExperienceForm(forms.ModelForm):
    """
    Form to add work experience
    """
    class Meta:
        model = WorkExperience
        fields = [
            "organization",
            "location",
            "position",
            "start_date",
            "end_date",
        ]
        labels = {
            "organization": "Company Name",
            "location": "Location",
            "position": "Job Title",
            "start_date": "Start",
            "end_date": "End",
        }
        widgets = {
            'start_date': forms.DateInput(attrs={'type': 'date'}),
            'end_date': forms.DateInput(attrs={'type': 'date'}),
        }

class EducationForm(forms.ModelForm):
    """
    Form to add education
    """
    class Meta:
        model = Education
        fields = [
            "school_name",
            "location",
            "degree",
            "start_year",
            "end_year",
            "grade"
        ]
        labels = {
            "organization": "Institution Name",
            "location": "Location",
            "degree": "Degree",
            "start_date": "Start",
            "end_date": "End",
            "grade": "Grade"
        }
        widgets = {
            'start_year': forms.DateInput(attrs={'type': 'date'}),
            'end_year': forms.DateInput(attrs={'type': 'date'}),
        }


class ProjectForm(forms.ModelForm):
    """
    Form to add project
    """
    class Meta:
        model = Project
        fields = [
            "name",
            "repository_url",
            "deployed_url"
        ]
        labels = {
            "name": "Project Name",
            "repository_url": "Repository URL",
            "deployed_url": "Deployed URL"
        }
