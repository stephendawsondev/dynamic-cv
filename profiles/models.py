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
    summary = CKEditor5Field(max_length=500, null=True, blank=True)

    def __str__(self):
        return f"{self.summary}"


class Skills(models.Model):
    """
    Model for the user's skills
    """
    user = models.OneToOneField(User, related_name="user_skills", on_delete=models.CASCADE)
    skillset = models.TextField(blank=True, null=True)

    def __str__(self):
        """
        Returns the list of skills with a space after every comma
        """
        skill_text = self.skillset
        return skill_text.replace(',', ', ')

    def get_as_list(self):
        """
        Converts the string field into a list
        """
        skill_list = self.skillset.split(',')[:-1]
        return [{
            "slug": item,
            "display": item.replace('-', ' ')
        } for item in skill_list]
    
    def add_skill(self, skill):
        """
        Adds a skill to the model. Returns the skill if
        successful, and None if not
        """
        skillset = self.skillset
        print(skill in skillset)
        if skill in skillset:
            return None
        self.skillset += f'{skill},'
        self.save()
        return skill
    
    def remove_skill(self, skill):
        """
        Removes a skill from the model
        """
        self.skillset = self.skillset.replace(f'{skill},', '')
        self.save()     


@receiver(post_save, sender=User)
def create_profile_models(instance, created, **kwargs):
    """
    Automatically create user profile models when a new user is created
    """
    if created:
        Summary.objects.create(user=instance, summary="Add default summary here")
        Skills.objects.create(user=instance, skillset="")
        