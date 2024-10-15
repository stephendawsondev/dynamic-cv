# Generated by Django 4.2 on 2024-10-15 16:32

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("profiles", "0012_alter_education_grade"),
        ("cv_template", "0006_cvtemplate_position_title"),
    ]

    operations = [
        migrations.AlterField(
            model_name="cvtemplate",
            name="projects",
            field=models.ManyToManyField(
                blank=True, related_name="cv_projects", to="profiles.project"
            ),
        ),
        migrations.CreateModel(
            name="CVAnalysis",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("potential_skills", models.JSONField(blank=True, default=list)),
                ("spelling_errors", models.JSONField(blank=True, default=list)),
                ("top_tech_skills", models.JSONField(default=list)),
                ("top_soft_skills", models.JSONField(default=list)),
                ("top_tech_comp_skills", models.JSONField(default=list)),
                ("top_qualifications", models.JSONField(default=list)),
                ("top_methodologies", models.JSONField(default=list)),
                ("match_per", models.IntegerField()),
                ("created_at", models.DateTimeField(auto_now=True)),
                (
                    "cv",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="cv_analysis_cv",
                        to="cv_template.cvtemplate",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="cv_analysis_user",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
