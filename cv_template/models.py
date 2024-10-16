from django.db import models
import uuid
from django_ckeditor_5.fields import CKEditor5Field
from django.contrib.auth.models import User

from profiles.models import (
    ContactInformation,
    Skill,
    WorkExperience,
    Education,
    Project,
)


class CVTemplate(models.Model):
    """
    CV Template model
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, related_name="cv_user", on_delete=models.CASCADE)
    cv_name = models.CharField(
        unique=True, max_length=100, default="default", null=False, blank=False
    )
    use_default_summary = models.BooleanField(default=False)
    summary = CKEditor5Field(max_length=10000, null=True, blank=True)
    position_title = models.CharField(max_length=100, null=True, blank=True)
    contact_information = models.ForeignKey(
        ContactInformation,
        related_name="cv_contact_information",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    skills = models.ManyToManyField(Skill, related_name="cv_skills")
    work_experience = models.ManyToManyField(
        WorkExperience, related_name="cv_work_experience"
    )
    education = models.ManyToManyField(Education, related_name="cv_education")
    projects = models.ManyToManyField(
        Project, related_name="cv_projects", blank=True)
    created_at = models.DateTimeField(auto_now=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.cv_name} - {self.user}"


class CVAnalysis(models.Model):
    """
    CV Analysis model
    """
    user = models.ForeignKey(
        User, related_name="cv_analysis_user", on_delete=models.CASCADE)
    cv = models.ForeignKey(
        CVTemplate, related_name="cv_analysis_cv", on_delete=models.CASCADE)
    potential_skills = models.JSONField(default=list, blank=True)
    spelling_errors = models.JSONField(default=list, blank=True)
    top_tech_skills = models.JSONField(default=list, blank=False)
    top_soft_skills = models.JSONField(default=list, blank=False)
    top_tech_comp_skills = models.JSONField(default=list, blank=False)
    top_qualifications = models.JSONField(default=list, blank=False)
    top_methodologies = models.JSONField(default=list, blank=False)
    match_per = models.IntegerField()
    created_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user}"
