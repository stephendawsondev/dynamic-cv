from django import forms
from django_ckeditor_5.widgets import CKEditor5Widget
from .models import Summary


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
