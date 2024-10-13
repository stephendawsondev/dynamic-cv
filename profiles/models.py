from django.db import models
from django_ckeditor_5.fields import CKEditor5Field

from django.contrib.auth.models import User



class Summary(models.Model):
    """
    Default Summary model
    """

    user = models.ForeignKey(User, related_name="summary_user", on_delete=models.CASCADE)
    summary = models.CharField(max_length=500, null=True, blank=True)

    def __str__(self):
        return f"{self.summary}"


class ContactInformation(models.Model):
    """
    Contact Information model
    """
    user = models.ForeignKey(
        User, related_name="contact_information", on_delete=models.CASCADE)
    first_name = models.CharField(max_length=50, null=False, blank=False)
    last_name = models.CharField(max_length=50, null=False, blank=False)
    email = models.EmailField(max_length=100, null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    address1 = models.CharField(max_length=100, null=True, blank=True)
    address2 = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=50, null=True, blank=True)
    zip_code = models.CharField(max_length=10, null=True, blank=True)
    country = models.CharField(max_length=50, null=True, blank=True)
    linkedin = models.URLField(max_length=200, null=True, blank=True)
    github = models.URLField(max_length=200, null=True, blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


    class Meta:
        verbose_name_plural = "Contact Information"