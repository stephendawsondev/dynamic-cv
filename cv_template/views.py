import json
from django.views.generic import ListView, CreateView, DetailView, DeleteView, View, UpdateView
from django.contrib.auth.mixins import UserPassesTestMixin, LoginRequiredMixin
from django.contrib import messages
from django.http import HttpResponseRedirect
from django.urls import reverse

from .analysis_utils import CVAnalyzer

from .models import CVTemplate, CVAnalysis
from .forms import CVTemplateForm

from profiles.models import Summary, ContactInformation
from django.shortcuts import redirect


class CvList(ListView):
    model = CVTemplate
    template_name = "cv_template/cv_list.html"
    context_object_name = "cv_list"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['cv_list'] = CVTemplate.objects.filter(user=self.request.user)

        return context


def update_cv_ordering(self):
    """
    Updates the ordering values of the CV
    """
    sort_json = {}
    if 'headings_order' in self.request.POST:
        sort_json['headings'] = self.request.POST['headings_order']
    if 'skills_order' in self.request.POST:
        sort_json['skills'] = self.request.POST['skills_order']
    if 'hobbies_order' in self.request.POST:
        sort_json['hobbies'] = self.request.POST['hobbies_order']
    if 'extra_info_order' in self.request.POST:
        sort_json['extra_info'] = self.request.POST['extra_info_order']
    
    self.object.item_ordering = sort_json
    self.object.save()


class CreateCV(LoginRequiredMixin, CreateView):
    model = CVTemplate
    form_class = CVTemplateForm
    template_name = "cv_template/cv_template.html"

    def get_form_kwargs(self):
        kwargs = super(CreateCV, self).get_form_kwargs()
        kwargs["request"] = self.request
        return kwargs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        try:
            contact_info = ContactInformation.objects.get(
                user=self.request.user)
            context['contact'] = contact_info
        except ContactInformation.DoesNotExist:
            context['contact'] = {}

        try:
            default_summary = Summary.objects.get(
                user=self.request.user).summary
        except Summary.DoesNotExist:
            default_summary = ""

        context['default_summary'] = default_summary

        return context

    def form_valid(self, form):
        user = self.request.user
        form.instance.user = user
        has_summary = 'has_summary' in self.request.POST
        use_default_summary = form.cleaned_data.get("use_default_summary")
        if not has_summary:
            form.instance.summary = ""
        elif use_default_summary:
            try:
                summary = Summary.objects.get(user=self.request.user).summary
            except Summary.DoesNotExist:
                summary = ""
            form.instance.summary = summary

        try:
            contact_information = ContactInformation.objects.get(
                user=self.request.user)
        except ContactInformation.DoesNotExist:
            contact_information = None
        form.instance.contact_information = contact_information

        self.object = form.save()
        update_cv_ordering(self)

        messages.success(self.request, "CV created successfully")
        return HttpResponseRedirect(self.get_success_url())

    def get_success_url(self):
        return reverse("generated_cv", kwargs={"pk": self.object.pk})


class GeneratedCV(LoginRequiredMixin, DetailView):
    model = CVTemplate
    template_name = "cv_template/generated_cv.html"
    context_object_name = "cv"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        cv = self.get_object()
        cv_analysis = CVAnalysis.objects.filter(cv=self.get_object()).first()

        context["analysed"] = False
        if cv_analysis:
            if cv_analysis.created_at > cv.updated_at:
                context["analysed"] = True
        
        context["cv"] = cv
        context["cv_analysis"] = cv_analysis
        return context


class CVAnalyzerView(LoginRequiredMixin, View):
    """
    A view to analyze job position of the CV against top market criteria
    per job position
    """

    def get(self, request, *args, **kwargs):
        saved_cv = CVTemplate.objects.get(pk=self.kwargs.get("pk"))

        try:
            analysis = CVAnalysis.objects.get(cv=saved_cv)
            if saved_cv.updated_at < analysis.created_at:
                return redirect('generated_cv', pk=saved_cv.pk) 
        except CVAnalysis.DoesNotExist:
            pass

        cv = CVAnalyzer(saved_cv)
        try:
            position_top_skills = cv.get_position_skills()
            summary_errors = cv.check_spelling_errors()
            match_per, missing_skills = cv.get_match_on_top_skills(position_top_skills)
            potential_skills = cv.get_potential_missing_skills(missing_skills)
            suggested_roles = cv.get_suggested_roles()
            analysis = self._create_cv_analysis_obj(
                saved_cv, position_top_skills, summary_errors, match_per, potential_skills, suggested_roles
            )
        except json.JSONDecodeError as e:
            messages.error(self.request, "An error occurred while analyzing the CV. Please try again later.")
            return redirect('cv_list')
        return redirect('view_analysis', pk=analysis.id)

    def _create_cv_analysis_obj(
        self,
        saved_cv: CVTemplate,
        position_top_skills: dict,
        summary_errors: list,
        match_per: int,
        potential_skills: list,
        suggested_roles: list,
    ):
        # Check if an analysis already exists for the given CV
        analysis, created = CVAnalysis.objects.update_or_create(
            user=self.request.user,
            cv=saved_cv,
            defaults={
                "potential_skills": potential_skills,
                "spelling_errors": summary_errors,
                "top_tech_skills": position_top_skills.get("technical_skills", []),
                "top_soft_skills": position_top_skills.get("soft_skills", []),
                "top_tech_comp_skills": position_top_skills.get("tech_competencies", []),
                "top_qualifications": position_top_skills.get("qualifications", []),
                "top_methodologies": position_top_skills.get("methodologies", []),
                "suggested_roles": suggested_roles,
                "match_per": match_per,
            },
        )
        return analysis


class CVAnalysisDetail(DetailView):
    model = CVAnalysis
    template_name = "cv_template/cv_analyzer.html"
    context_object_name = "analysis_info"


class DeleteCV(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    """ A view to delete a CV """
    model = CVTemplate
    success_url = "/cv/cv-list/"

    def test_func(self):
        return self.request.user == self.get_object().user


class UpdateCV(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    """ A view to delete a CV """
    model = CVTemplate
    template_name = "cv_template/cv_template.html"
    form_class = CVTemplateForm

    def form_valid(self, form):
        has_summary = 'has_summary' in self.request.POST
        use_default_summary = form.cleaned_data.get("use_default_summary")
        if not has_summary:
            form.instance.summary = ""
        elif use_default_summary:
            try:
                summary = Summary.objects.get(user=self.request.user).summary
            except Summary.DoesNotExist:
                summary = ""
            form.instance.summary = summary

        self.object = form.save()
        update_cv_ordering(self)
        messages.success(self.request, "CV updated successfully")
        return HttpResponseRedirect(self.get_success_url())

    def get_form_kwargs(self):
        kwargs = super(UpdateCV, self).get_form_kwargs()
        kwargs["request"] = self.request
        return kwargs
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        cv = self.get_object()
        context['cv'] = cv
        try:
            context['contact'] = cv.contact_information
        except ContactInformation.DoesNotExist:
            context['contact'] = {}

        try:
            default_summary = Summary.objects.get(
                user=self.request.user).summary
        except Summary.DoesNotExist:
            default_summary = ""
        context['default_summary'] = default_summary
        return context

    def get_success_url(self):
        return reverse("generated_cv", kwargs={"pk": self.object.pk})

    def test_func(self):
        return self.request.user == self.get_object().user