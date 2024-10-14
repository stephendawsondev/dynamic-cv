from django.views.generic import TemplateView, View
from django.contrib.auth.mixins import UserPassesTestMixin, LoginRequiredMixin
from django.contrib.messages.views import SuccessMessageMixin
from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from .forms import SummaryForm, ContactInformationForm, WorkExperienceForm
from .models import Summary, ContactInformation, Skill, \
     WorkExperience, WorkExperienceBullets

import json


class ProfileView(LoginRequiredMixin, TemplateView):
    """
    View to render user profile
    """
    template_name = 'profiles/profile.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user

        contact_information, created = ContactInformation.objects.get_or_create(
            user=user)
        context['contact_information_form'] = ContactInformationForm(
            instance=contact_information)

        summary_info, created = Summary.objects.get_or_create(
            user=user)
        context['summary_form'] = SummaryForm(instance=summary_info)
        context['summary'] = Summary.objects.get(user=user).summary

        context['work_experience_form'] = WorkExperienceForm()
        context['work_experience_list'] = user.work_experience.all()
        return context


class UpdateSummary(LoginRequiredMixin, View):
    form_class = SummaryForm
    template_name = 'profiles/profile.html'

    def get_object(self):
        obj, created = Summary.objects.get_or_create(
            user=self.request.user)
        return obj

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        form = self.form_class(request.POST, instance=self.object)

        if form.is_valid():
            form.save()
            return HttpResponse('<p class="success">Summary updated successfully!</p>')
        else:
            return HttpResponse('<p class="error">Please provide a valid summary.</p>')

class CreateUpdateContactInformation(LoginRequiredMixin, View):
    """
    Handles Contact Information form logic for both creation and update
    """
    form_class = ContactInformationForm
    template_name = 'profiles/profile.html'

    def get_object(self):
        obj, created = ContactInformation.objects.get_or_create(
            user=self.request.user)
        return obj

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        form = self.form_class(request.POST, instance=self.object)

        if form.is_valid():
            form.save()
            return HttpResponse('<p class="success">Contact information updated successfully!</p>')
        else:
            return HttpResponse('<p class="error">Please provide valid contact information.</p>')


class AddSkill(View):

    def post(self, request, skill):
        user = request.user
        try:
            skill = user.user_skills.get(name=skill)
            return HttpResponse("Fail")
        except Skill.DoesNotExist:
            user.user_skills.create(name=skill)
            user.save()
            return HttpResponse("Success")


class RemoveSkill(View):

    def post(self, request, skill):
        user = request.user
        try:
            skill = user.user_skills.get(name=skill)
            skill.delete()
            user.save()
            return HttpResponse("Success")
        except Exception as e:
            return HttpResponse("Fail")


def create_list_item_html(list_type, id, display):
    return f"""
    <li id="{list_type}-{id}" class="{list_type}-item list-disc">
    <span class="flex justify-between">
        <span>{display}</span>
        <button type="button" class="delete-skill" data-skill="{id}">
            <span class="text-2xl">&times;</span>
        </button>
        </span>
    </li>
    """


class AddResponsibility(View):

    def post(self, request):
        rsp = request.POST['responsibility']
        user = request.user
        rsp_object = user.work_bullets.get_or_create(bullet_point=rsp)
        return HttpResponse(create_list_item_html(
            'responsibility',
            rsp_object[0].id,
            rsp
        ))


class AddWorkExperience(View):

    def post(self, request):
        post_data = request.POST.copy()
        work_form = WorkExperienceForm(request.POST)
        user = request.user
        if not work_form.is_valid():
            return HttpResponse("Form is invalid")

        work_experience = WorkExperience(
            user=request.user,
            organization=request.POST['organization'],
            location=request.POST['location'],
            position=request.POST['position'],
            start_date=request.POST['start_date'],
            end_date=request.POST['end_date']
        )
        work_experience.save()

        # Extracting the responsibilities and skills
        for key, value in post_data.items():
            list_item = None
            if 'work-responsibilities' in key:
                list_item, created = WorkExperienceBullets.objects.get_or_create(
                    user_id=user.id,
                    bullet_point=value
                )
                work_experience.bullet_points.add(list_item)
            elif 'work-skills' in key:
                list_item, created = Skill.objects.get_or_create(
                    user_id=user.id,
                    name=value
                )
                if len(user.user_skills.filter(name=value)) == 0:
                    user.user_skills.add(list_item)
                    user.save()
                work_experience.applied_skills.add(list_item)
            else:
                continue            
            list_item.save()
        work_experience.save()
        return HttpResponse(json.dumps(post_data))
