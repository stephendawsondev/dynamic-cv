from django.views.generic import TemplateView, View
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
        summary_info, created = Summary.objects.get_or_create(
            user=self.request.user)
        context['summary_form'] = SummaryForm(instance=summary_info)
        context['summary'] = Summary.objects.get(user=self.request.user).summary
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
  