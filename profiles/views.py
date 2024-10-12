from django.views.generic import TemplateView, CreateView, UpdateView
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
        try:
            context['summary_form'] = SummaryForm(instance=Summary.objects.get(user=self.request.user))
            context['summary'] = Summary.objects.get(user=self.request.user).summary
        except:
            context['summary_form'] = SummaryForm()
        return context


class UpdateSummary(LoginRequiredMixin, UpdateView):  
    model = Summary
    form_class = SummaryForm

    def form_valid(self, form):
        print('Valid form')
        form.instance.summary = form.cleaned_data['summary']
        print(form.instance.summary)
        form.instance.user = self.request.user
        form.save()
        return HttpResponse('<p class="success">Form submitted successfully!</p>')  

    def form_invalid(self, form):
        print('Invalid form')
        return HttpResponse('<p class="error">Please provide a summary. Max 500 chars</p>')
  