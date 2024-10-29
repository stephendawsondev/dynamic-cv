from django.db import models
from django_ckeditor_5.fields import CKEditor5Field

from django.contrib.auth.models import User


class Summary(models.Model):
    """
    Default Summary model
    """

    user = models.ForeignKey(
        User, related_name="summary_user", on_delete=models.CASCADE
    )
    summary = models.CharField(max_length=1000, null=True, blank=True)

    def __str__(self):
        return f"{self.summary}"


class Skill(models.Model):
    """
    Model for the user's skills
    """

    user = models.ForeignKey(
        User, related_name="user_skills", on_delete=models.CASCADE)
    name = models.CharField(max_length=30, blank=True, null=True)

    def __str__(self):
        """
        Returns the list of skills with a space after every comma
        """
        return self.display_name()

    def display_name(self):
        return self.name.replace("-", " ")


class ContactInformation(models.Model):
    """
    Contact Information model
    """

    user = models.ForeignKey(
        User, related_name="contact_information", on_delete=models.CASCADE
    )
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


class WorkExperienceBullets(models.Model):
    """
    Bullet points for work experience model
    """

    user = models.ForeignKey(
        User, related_name="work_bullets", on_delete=models.CASCADE
    )
    bullet_point = models.CharField(max_length=210, null=False, blank=False)

    def __str__(self):
        return str(self.bullet_point)

    class Meta:
        verbose_name_plural = "Work Experience Bullets"


class WorkExperience(models.Model):
    """
    Work Experience model
    """

    user = models.ForeignKey(
        User, related_name="work_experience", on_delete=models.CASCADE
    )
    start_date = models.DateField(null=False, blank=False)
    end_date = models.DateField(null=True, blank=True)
    position = models.CharField(max_length=150, null=False, blank=False)
    organization = models.CharField(max_length=150, null=False, blank=False)
    location = models.CharField(max_length=150, null=True, blank=True)
    bullet_points = models.ManyToManyField(
        WorkExperienceBullets, related_name="related_experience")
    applied_skills = models.ManyToManyField(
        Skill, related_name="work")

    def __str__(self):
        return f"{self.position} - {self.organization}, {self.start_date.strftime('%m/%y')} - {self.end_date.strftime('%m/%y') if self.end_date else 'Present'}"

    class Meta:
        verbose_name_plural = "Work Experience"


class EducationBullets(models.Model):
    """
    Bullet points for education model
    """

    user = models.ForeignKey(
        User, related_name="education_bullets", on_delete=models.CASCADE
    )
    bullet_point = models.CharField(max_length=150, null=False, blank=False)

    def __str__(self):
        return str(self.bullet_point)

    class Meta:
        verbose_name_plural = "Education Bullets"


class Education(models.Model):
    """
    Education model
    """
    user = models.ForeignKey(
        User, related_name="education", on_delete=models.CASCADE)
    start_year = models.DateField(null=False, blank=False)
    end_year = models.DateField(null=True, blank=True)
    degree = models.CharField(max_length=150, null=False, blank=False)
    school_name = models.CharField(max_length=150, null=False, blank=False)
    location = models.CharField(max_length=150, null=True, blank=True)
    grade = models.CharField(max_length=50, null=True, blank=True)
    bullet_points = models.ManyToManyField(
        EducationBullets, related_name="related_experience")
    applied_skills = models.ManyToManyField(Skill, related_name="education")

    def __str__(self):
        return f"{self.degree} - {self.grade} - {self.school_name}, {self.start_year.strftime('%m/%y')} - {self.end_year.strftime('%m/%y') if self.end_year else 'Present'}"

    class Meta:
        verbose_name_plural = "Education"


class Project(models.Model):
    """
    Projects model
    """
    user = models.ForeignKey(
        User, related_name="projects", on_delete=models.CASCADE)
    name = models.CharField(max_length=150)
    start_date = models.DateField(null=False, blank=False)
    end_date = models.DateField(null=True, blank=True)
    description = models.CharField(max_length=160, null=True, blank=True)
    repository_url = models.URLField(blank=True, null=True)
    deployed_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name
    
class Hobby(models.Model):
    """
    Interests/Hobbies model
    """
    user = models.ForeignKey(
        User, related_name="hobbies", on_delete=models.CASCADE)
    val = models.CharField(max_length=150)

    def __str__(self):
        return self.val


class AdditionalInformation(models.Model):
    """
    Interests/Hobbies model
    """
    user = models.ForeignKey(
        User, related_name="extra_info", on_delete=models.CASCADE)
    val = models.CharField(max_length=150)

    def __str__(self):
        return self.val
