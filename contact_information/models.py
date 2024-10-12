from django.db import models
from django.contrib.auth.models import User
from cv_template.models import CVTemplate


class ContactInformation(models.Model):
    """
    Contact Information model
    """
    user = models.ForeignKey(
        User, related_name="contactinformation", on_delete=models.CASCADE)
    cv = models.ForeignKey(
        CVTemplate, related_name="contact_cv", on_delete=models.CASCADE, null=True, blank=True)
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
