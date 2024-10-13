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