from django import forms
from django_ckeditor_5.widgets import CKEditor5Widget
from .models import CVTemplate

from profiles.models import Skill, WorkExperience, Education


class CustomMMCF(forms.ModelMultipleChoiceField):
    def label_from_instance(self, instance):
        return "%s" % instance.__str__()


class CVTemplateForm(forms.ModelForm):
    """Form to create a CV"""

    def __init__(self, *args, **kwargs):
        """Grants access to the request object so that only members of the current user
        are given as options"""

        self.request = kwargs.pop("request")
        super(CVTemplateForm, self).__init__(*args, **kwargs)
        self.fields["skills"].queryset = Skill.objects.filter(user=self.request.user)
        self.fields["work_experience"].queryset = WorkExperience.objects.filter(
            user=self.request.user
        )
        self.fields["education"].queryset = Education.objects.filter(
            user=self.request.user
        )
        self.fields["projects"].queryset = Education.objects.filter(
            user=self.request.user
        )

    class Meta:
        model = CVTemplate
        fields = [
            "cv_name",
            "summary",
            "use_default_summary",
            "skills",
            "work_experience",
            "education",
            "projects",
        ]

        labels = {
            "cv_name": "CV Name",
            "summary": "Summary",
            "use_default_summary": "Use Default Summary",
            "skills": "Relevant Skills",
            "work_experience": "Relevant Work Experience",
            "education": "Relevant Education",
            "projects": "Associated Projects",
        }

        widgets = {
            "summary": CKEditor5Widget(
                attrs={"class": "django_ckeditor_5"}, config_name="default"
            )
        }

    skills = CustomMMCF(queryset=None, widget=forms.CheckboxSelectMultiple)
    work_experience = CustomMMCF(queryset=None, widget=forms.CheckboxSelectMultiple)
    education = CustomMMCF(queryset=None, widget=forms.CheckboxSelectMultiple)
    projects = CustomMMCF(queryset=None, widget=forms.CheckboxSelectMultiple)
