from django.db import models
import uuid
from django_ckeditor_5.fields import CKEditor5Field
from django.contrib.auth.models import User


class CVTemplate(models.Model):
    """
    CV Template model
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, related_name="cv_user", on_delete=models.CASCADE)
    cv_name = models.CharField(max_length=100, default="default", null=False, blank=False)
    summary = CKEditor5Field(max_length=10000, null=True, blank=True)
    created_at = models.DateTimeField(auto_now=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.id} - {self.user}"
