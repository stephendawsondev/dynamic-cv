from django.db import models
from django_ckeditor_5.fields import CKEditor5Field

from django.dispatch import receiver
from django.db.models.signals import post_save
from django.contrib.auth.models import User


class Summary(models.Model):
    """
    Default Summary model
    """

    user = models.ForeignKey(User, related_name="summary_user", on_delete=models.CASCADE)
    summary = models.CharField(max_length=500, null=True, blank=True)

    def __str__(self):
        return f"{self.summary}"
