from django.views.generic import TemplateView, View
from django.contrib.auth.mixins import UserPassesTestMixin, LoginRequiredMixin
from django.contrib import messages
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from .forms import SummaryForm, ContactInformationForm, \
     WorkExperienceForm, EducationForm, ProjectForm
from .models import Summary, ContactInformation, Skill, \
     WorkExperience, WorkExperienceBullets, \
     Education, EducationBullets, Project

import json


class ProfileView(LoginRequiredMixin, TemplateView):
    """
    View to render user profile
    """
    template_name = 'profiles/profile.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user

        if self.request.GET and 'tab' in self.request.GET:
            context['tab'] = self.request.GET['tab']

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

        context['education_form'] = EducationForm()
        context['education_list'] = user.education.all()

        context['project_form'] = ProjectForm()
        context['project_list'] = user.projects.all()
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


class AddSkill(LoginRequiredMixin, View):

    def post(self, request, skill):
        user = request.user
        try:
            skill = user.user_skills.get(name=skill)
            return HttpResponse("Fail")
        except Skill.DoesNotExist:
            user.user_skills.create(name=skill)
            user.save()
            return HttpResponse("Success")


class RemoveSkill(LoginRequiredMixin, View):

    def post(self, request, skill):
        user = request.user
        try:
            skill = user.user_skills.get(name=skill)
            skill.delete()
            user.save()
            return HttpResponse("Success")
        except Exception as e:
            return HttpResponse("Fail")


class AddWorkExperience(LoginRequiredMixin, View):

    def post(self, request):
        post_data = request.POST.copy()
        work_form = WorkExperienceForm(request.POST)
        user = request.user
        if not work_form.is_valid():
            return HttpResponse("Form is invalid")
        
        # Only add the necessary fields to prevent errors
        required_fields = {
            'user': request.user,
            'organization': post_data['organization'],
            'location': post_data['location'],
            'position': post_data['position'],
            'start_date': post_data['start_date'],
        }
        if 'end_date' in post_data:
            required_fields['end_date'] = post_data['end_date']
        work_experience = WorkExperience(**required_fields)
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
                    name=value.replace(' ', '-')
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


class AddEducation(LoginRequiredMixin, View):

    def post(self, request):
        post_data = request.POST.copy()
        education_form = EducationForm(request.POST)
        user = request.user
        if not education_form.is_valid():
            return HttpResponse("Form is invalid")
        
        # Only add the necessary fields to prevent errors
        required_fields = {
            'user': request.user,
            'school_name': post_data['school_name'],
            'location': post_data['location'],
            'degree': post_data['degree'],
            'start_year': post_data['start_year'],
        }
        if 'end_year' in post_data:
            required_fields['end_year'] = post_data['end_year']
            required_fields['grade'] = post_data['grade']
        education = Education(**required_fields)
        education.save()

        # Extracting the responsibilities and skills
        for key, value in post_data.items():
            list_item = None
            if 'education-modules' in key:
                list_item, created = EducationBullets.objects.get_or_create(
                    user_id=user.id,
                    bullet_point=value
                )
                education.bullet_points.add(list_item)
            elif 'education-skills' in key:
                list_item, created = Skill.objects.get_or_create(
                    user_id=user.id,
                    name=value.replace(' ', '-')
                )
                if len(user.user_skills.filter(name=value)) == 0:
                    user.user_skills.add(list_item)
                    user.save()
                education.applied_skills.add(list_item)
            else:
                continue            
            list_item.save()
        education.save()
        return HttpResponse(json.dumps(post_data))


class AddProject(LoginRequiredMixin, View):

    def post(self, request):
        post_data = request.POST.copy()
        project_form = ProjectForm(request.POST)
        if not project_form.is_valid():
            return HttpResponse("Form is not valid")
        
        project = Project(
            user=request.user,
            name=post_data['name'],
            repository_url=post_data['repository_url'],
            deployed_url=post_data['deployed_url']
        )
        project.save()
        return HttpResponse(json.dumps(post_data))


class EditItem(LoginRequiredMixin, View):

    def get(self, request, item_type, item_id):
        context = {
            'item_type': item_type,
            'cancel_tab': item_type
        }
        try:
            if item_type == 'work':
                context['display_type'] = 'Work Experience'
                work_exp = request.user.work_experience.get(id=item_id)
                context.update({
                    'experience_item': work_exp,
                    'experience_form': WorkExperienceForm(instance=work_exp),
                    'checkbox': {
                        'action': 'working',
                        'disables': 'id_end_date'
                    },
                    'cancel_tab': 'work_experience',
                    'bullet_points': request.user.work_experience.all(),
                    'bullet_point_label': 'Duties/Responsibilities'
                })
            elif item_type == 'education':
                context['display_type'] = 'Education'
                education_exp = request.user.education.get(id=item_id)
                context.update({
                    'experience_item': education_exp,
                    'experience_form': EducationForm(instance=education_exp),
                    'checkbox': {
                        'action': 'studying',
                        'disables': 'id_end_year,grade'
                    },
                    'cancel_tab': 'education',
                    'bullet_points': request.user.education.all(),
                    'bullet_point_label': 'Modules Covered'
                })
            elif item_type == 'project':
                context['display_type'] = 'Project'
                project_exp = request.user.projects.get(id=item_id)
                context['experience_item'] = project_exp
                context['experience_form'] = ProjectForm(instance=project_exp)
            else:
                context['display_type'] = 'Item'
        except (WorkExperience.DoesNotExist,
                Education.DoesNotExist,
                Project.DoesNotExist):
            messages.error(request,
                           f"That {context['display_type']} is not in \
                            your profile")
            return redirect('profile')
        except Exception as e:
            messages.error(request, f"An error occurred. {e}")
            return redirect('profile')

        return render(request, 'profiles/edit_experience_item.html', context)
