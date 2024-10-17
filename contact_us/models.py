from django.core.exceptions import ValidationError
from django.db import models


# Create your models here.
class ContactUs(models.Model):
    """Represents each contact message received and saved on the database"""
    name = models.CharField(max_length=80)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20, blank=True)
    query = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.name} received on {self.created_at}"

    def clean(self):
        """Custom validation to ensure the phone number contains only digits."""
        if self.phone_number and not self.phone_number.isdigit():
            raise ValidationError('Phone number must contain only digits.')
