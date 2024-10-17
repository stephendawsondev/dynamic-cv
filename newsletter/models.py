from django.db import models


# Create your models here.
class NewsletterSubscriber(models.Model):
    email = models.EmailField(blank=False, null=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.email} received on {self.created_at}"
