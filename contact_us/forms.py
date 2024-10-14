from django import forms
from django_ckeditor_5.widgets import CKEditor5Widget
from .models import ContactUs


class ContactUsForm(forms.ModelForm):
    """
    Form to create a contact message
    """

    class Meta:
        model = ContactUs
        fields = ["name", "email", "phone_number", "query"]
        labels = {
            "name": "Name",
            "email": "Email",
            "phone_number": "Phone Number",
            "query": "Query",
        }
        widgets = {
            "query": forms.Textarea(attrs={"rows": 10, "cols": 15}),
        }
