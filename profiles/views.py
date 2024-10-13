from django.views import View
from django.views.generic import TemplateView, CreateView, UpdateView
from django.contrib.auth.mixins import UserPassesTestMixin, LoginRequiredMixin
from django.contrib.messages.views import SuccessMessageMixin
from django.shortcuts import render  
from django.http import HttpResponse

from .forms import SummaryForm
from .models import Summary, Skills


class ProfileView(LoginRequiredMixin, TemplateView):
    """
    View to render user profile
    """
    template_name = 'profiles/profile.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['summary_form'] = SummaryForm(instance=Summary.objects.get(user=self.request.user))
        context['summary'] = Summary.objects.get(user=self.request.user).summary
        return context


class UpdateSummary(LoginRequiredMixin, UpdateView):  
    model = Summary
    form_class = SummaryForm

    def form_valid(self, form):
        form.instance.user = self.request.user
        form.save()
        return HttpResponse('<p class="success">Form submitted successfully!</p>')  

    def form_invalid(self, form):
        return HttpResponse('<p class="error">Please provide a summary. Max 500 chars</p>')


class AddSkill(View):

    def post(self, request, skill):
        skillset = Skills.objects.get(user=request.user)
        if skillset.add_skill(skill):
            return HttpResponse("Success")
        return HttpResponse("Fail")


class RemoveSkill(View):

    def post(self, request, skill):
        skillset = Skills.objects.get(user=request.user)
        try:
            skillset.remove_skill(skill)
            return HttpResponse("Success")
        except Exception as e:
            return HttpResponse("Fail")
