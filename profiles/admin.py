from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Summary, ContactInformation, Skill, WorkExperience, Education, WorkExperienceBullets, EducationBullets


@admin.register(Summary)
class SummaryAdminClass(ModelAdmin):
    pass


@admin.register(ContactInformation)
class ContactInformationAdminClass(ModelAdmin):
    pass

@admin.register(Skill)
class SkillAdminClass(ModelAdmin):
    pass

@admin.register(WorkExperience)
class WorkExperienceAdminClass(ModelAdmin):
    pass

@admin.register(Education)
class EducationAdminClass(ModelAdmin):
    pass

@admin.register(WorkExperienceBullets)
class WorkExperienceBulletsAdminClass(ModelAdmin):
    pass

@admin.register(EducationBullets)
class EducationBulletsAdminClass(ModelAdmin):
    pass