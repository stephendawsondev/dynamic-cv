from django.views.generic import TemplateView, CreateView, View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from .forms import SummaryForm
from .models import Summary
from contact_information.forms import ContactInformationForm
from contact_information.models import ContactInformation


class ProfileView(LoginRequiredMixin, TemplateView):
    """
    View to render user profile
    """
    template_name = 'profiles/profile.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['summary_form'] = SummaryForm()

        contact_information, created = ContactInformation.objects.get_or_create(
            user=self.request.user)
        context['contact_information_form'] = ContactInformationForm(
            instance=contact_information)

        return context


class CreateSummary(LoginRequiredMixin, CreateView):
    model = Summary
    form_class = SummaryForm

    def form_valid(self, form):
        form.instance.user = self.request.user
        form.save()
        return HttpResponse('<p class="success">Form submitted successfully!</p>')

    def form_invalid(self, form):
        return HttpResponse('<p class="error">Please provide a summary.</p>')


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
