from django.views.generic import TemplateView, CreateView
from django.contrib.auth.mixins import UserPassesTestMixin, LoginRequiredMixin
from django.contrib.auth.mixins import UserPassesTestMixin
from django.contrib.messages.views import SuccessMessageMixin
from django.shortcuts import render  
from django.http import HttpResponse

from .forms import SummaryForm
from .models import Summary


class ProfileView(LoginRequiredMixin, TemplateView):
    """
    View to render user profile
    """
    template_name = 'profiles/profile.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['summary_form'] = SummaryForm()
        return context


class CreateSummary(LoginRequiredMixin, CreateView):  
    model = Summary
    form_class = SummaryForm

    def form_valid(self, form):
        form.instance.user = self.request.user
        form.save()
        return HttpResponse('<p class="success">Form submitted successfully! ✅</p>')  

    def form_invalid(self, form):
        return HttpResponse('<p class="error">Please provide a summary.</p>')
  