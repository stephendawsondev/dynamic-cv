from django.views.generic import TemplateView, View
from django.contrib.auth.mixins import UserPassesTestMixin, LoginRequiredMixin
from django.contrib import messages
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from .templatetags.profiletags import order_work_by_end_date, \
                                      order_education_by_end_date

from .forms import SummaryForm, ContactInformationForm, \
    WorkExperienceForm, EducationForm, ProjectForm
from .models import Summary, ContactInformation, Skill, \
    WorkExperience, WorkExperienceBullets, \
    Education, EducationBullets, Project, \
    Hobby, AdditionalInformation

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
        context['work_experience_list'] = order_work_by_end_date(user)

        context['education_form'] = EducationForm()
        context['education_list'] = order_education_by_end_date(user)

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


class AddBulletItem(LoginRequiredMixin, View):

    def post(self, request, bullet_type):
        bullet_val = request.POST['val']
        user = request.user
        try:
            if bullet_type == 'skill':
                user.user_skills.get(name=bullet_val)
            elif bullet_type == 'hobby':
                user.hobbies.get(val=bullet_val)
            elif bullet_type == 'extra-info':
                user.extra_info.get(val=bullet_val)
            user.user_skills.get(name=bullet_val)
            return HttpResponse("Fail")
        except (Skill.DoesNotExist,
                Hobby.DoesNotExist,
                AdditionalInformation.DoesNotExist):
            bullet_obj = None
            if bullet_type == 'skill':
                bullet_obj = user.user_skills.create(name=bullet_val)
            elif bullet_type == 'hobby':
                bullet_obj = user.hobbies.create(val=bullet_val)
            elif bullet_type == 'extra-info':
                bullet_obj = user.extra_info.create(val=bullet_val)
            bullet_obj.save()
            return HttpResponse(bullet_obj.id)


class RemoveBulletItem(LoginRequiredMixin, View):

    def post(self, request, bullet_type, bullet_id):
        user = request.user
        try:
            if bullet_type == 'skill':
                bullet_obj = user.user_skills.get(id=bullet_id)
            elif bullet_type == 'hobby':
                bullet_obj = user.hobbies.get(id=bullet_id)
            elif bullet_type == 'extra-info':
                bullet_obj = user.extra_info.get(id=bullet_id)
            bullet_obj.delete()
            user.save()
            return HttpResponse("Success")
        except Exception as e:
            return HttpResponse("Fail")


class AddWorkExperience(LoginRequiredMixin, View):

    def post(self, request):
        post_data = request.POST.copy()
        work_form = WorkExperienceForm(request.POST)
        added_bullets = []
        added_skills = []
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
                    user=user,
                    bullet_point=value
                )
                work_experience.bullet_points.add(list_item)
                if created:
                    added_bullets.append(value)
            elif 'work-skills' in key:
                list_item, created = Skill.objects.get_or_create(
                    user=user,
                    name=value
                )
                if created:
                    user.user_skills.add(list_item)
                    user.save()
                    list_item.save()
                    added_skills.append({'id': list_item.id, 'value': value})
                work_experience.applied_skills.add(list_item)
            else:
                continue
            list_item.save()
        work_experience.save()
        post_data['item_id'] = work_experience.id
        if added_bullets:
            post_data['added_bullets'] = added_bullets
        if added_skills:
            post_data['added_skills'] = added_skills
        return HttpResponse(json.dumps(post_data))


class AddEducation(LoginRequiredMixin, View):

    def post(self, request):
        post_data = request.POST.copy()
        education_form = EducationForm(request.POST)
        added_bullets = []
        added_skills = []
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
                    user=user,
                    bullet_point=value
                )
                education.bullet_points.add(list_item)
                if created:
                    added_bullets.append(value)
            elif 'education-skills' in key:
                list_item, created = Skill.objects.get_or_create(
                    user=user,
                    name=value
                )
                if created:
                    user.user_skills.add(list_item)
                    user.save()
                    list_item.save()
                    added_skills.append({'id': list_item.id, 'value': value})
                education.applied_skills.add(list_item)
            else:
                continue
            list_item.save()
        education.save()
        post_data['item_id'] = education.id
        if added_bullets:
            post_data['added_bullets'] = added_bullets
        if added_skills:
            post_data['added_skills'] = added_skills
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
            description=post_data['description'],
            repository_url=post_data['repository_url'],
            deployed_url=post_data['deployed_url']
        )
        project.save()
        post_data['item_id'] = project.id
        return HttpResponse(json.dumps(post_data))


def find_experience(request, item_type, item_id):
    try:
        if item_type == 'work':
            return request.user.work_experience.get(id=item_id)
        elif item_type == 'education':
            return request.user.education.get(id=item_id)
        elif item_type == 'project':
            return request.user.projects.get(id=item_id)
        else:
            messages.error(request, "Item not found")
            return None
    except (WorkExperience.DoesNotExist,
            Education.DoesNotExist,
            Project.DoesNotExist):
        messages.error(request, "That item is not in \
                       your profile")
        return None
    except Exception as e:
        messages.error(request, f"An error occurred. {e}")
        return None


class EditItem(LoginRequiredMixin, View):

    def get(self, request, item_type, item_id):
        item_exp = find_experience(request, item_type, item_id)
        if item_exp:
            context = {
                'item_type': item_type,
                'cancel_tab': item_type,
                'experience_item': item_exp
            }
            if item_type == 'work':
                context.update({
                    'display_type': 'Work Experience',
                    'experience_form': WorkExperienceForm(instance=item_exp),
                    'checkbox': {
                        'action': 'working',
                        'disables': 'id_end_date'
                    },
                    'cancel_tab': 'work_experience',
                    'bullet_points': request.user.work_bullets.all(),
                    'bullet_point_label': 'Duties/Responsibilities'
                })
            elif item_type == 'education':
                context.update({
                    'display_type': 'Education',
                    'experience_item': item_exp,
                    'experience_form': EducationForm(instance=item_exp),
                    'checkbox': {
                        'action': 'studying',
                        'disables': 'id_end_year,id_grade'
                    },
                    'cancel_tab': 'education',
                    'bullet_points': request.user.education_bullets.all(),
                    'bullet_point_label': 'Modules Covered'
                })
            elif item_type == 'project':
                context['display_type'] = 'Project'
                context['experience_form'] = ProjectForm(instance=item_exp)
            else:
                context['display_type'] = 'Item'

            return render(request, 'profiles/edit-experience-item.html', context)
        else:
            return redirect('profile')

    def post(self, request, item_type, item_id):
        item = find_experience(request, item_type, item_id)
        form = None
        if item_type == 'work':
            form = WorkExperienceForm(request.POST, instance=item)
        elif item_type == 'education':
            form = EducationForm(request.POST, instance=item)
        elif item_type == 'project':
            form = ProjectForm(request.POST, instance=item)

        if form and form.is_valid():
            item = form.save()

            # For projects, we can end the function here
            if item_type == 'project':
                item.save()
                return redirect('profile')

            # Updating the bullet points
            bullet_names = []
            skill_names = []

            # Extract the bullet points from the form
            for field, value in request.POST.items():
                if 'bullet-inputs' in field:
                    bullet_names.append(value)
                elif 'skill-inputs' in field:
                    skill_names.append(value)

            # Remove the old bullets that are not in the new list
            for bullet in item.bullet_points.all():
                if bullet.bullet_point in bullet_names:
                    bullet_names.remove(bullet.bullet_point)
                else:
                    item.bullet_points.remove(bullet)
                    # Removing the bullet point if it has no references
                    if bullet.related_experience.count() == 0:
                        bullet.delete()
                    else:
                        bullet.save()
            for skill in item.applied_skills.all():
                if skill.name in skill_names:
                    skill_names.remove(skill.name)
                else:
                    item.applied_skills.remove(skill)
                    # We don't need to delete skills without references
                    # as they can be accessed through the skills tab
                    skill.save()

            # Adding new bullets
            for new_bullet in bullet_names:
                bullet_class = None
                if item_type == 'work':
                    bullet_class = WorkExperienceBullets
                elif item_type == 'education':
                    bullet_class = EducationBullets
                bullet_obj, created = bullet_class.objects.get_or_create(
                    user=request.user,
                    bullet_point=new_bullet
                )
                bullet_obj.save()
                item.bullet_points.add(bullet_obj)
            for new_skill in skill_names:
                skill_obj, created = Skill.objects.get_or_create(
                    user=request.user,
                    name=new_skill
                )
                skill_obj.save()
                item.applied_skills.add(skill_obj)
            item.save()

        return redirect('profile')


class DeleteItem(LoginRequiredMixin, View):

    def post(self, request, item_type, item_id):
        item = find_experience(request, item_type, item_id)
        item_display = item_type.capitalize()
        if not item:
            return redirect('profile')
        if item_type != 'project':
            # Clearing any bullet points not attached to an object
            for bullet in item.bullet_points.all():
                item.bullet_points.remove(bullet)
                if bullet.related_experience.count() == 0:
                    bullet.delete()
                else:
                    bullet.save()
        item.delete()
        messages.success(request,
                         f"{item_display} item deleted successfully")
        return redirect('profile')
