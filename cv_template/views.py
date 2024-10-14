from django.views.generic import ListView, CreateView, DetailView
from django.contrib.auth.mixins import UserPassesTestMixin, LoginRequiredMixin
from django.contrib import messages
from django.http import HttpResponseRedirect
from django.urls import reverse

from .models import CVTemplate
from .forms import CVTemplateForm

from profiles.models import Summary, ContactInformation


class CvList(ListView):
    model = CVTemplate
    template_name = "cv_template/cv_list.html"


class CreateCV(LoginRequiredMixin, CreateView):
    model = CVTemplate
    form_class = CVTemplateForm
    template_name = "cv_template/cv_template.html"

    def get_form_kwargs(self):
        """Passes the request object to the form class.
        This is necessary to only display members that belong to a given user"""

        kwargs = super(CreateCV, self).get_form_kwargs()
        kwargs["request"] = self.request
        return kwargs

    def form_valid(self, form):
        form.instance.user = self.request.user
        use_default_summary = form.cleaned_data.get("use_default_summary")
        if use_default_summary:
            try:
                summary = Summary.objects.get(user=self.request.user).summary
            except Summary.DoesNotExist:
                summary = ""
            form.instance.summary = summary
        
        try:
            contact_information = ContactInformation.objects.get(user=self.request.user)
        except ContactInformation.DoesNotExist:
            contact_information = None
        form.instance.contact_information = contact_information

        self.object = form.save()
        messages.success(self.request, "CV created successfully")
        return HttpResponseRedirect(self.get_success_url())

    def get_success_url(self):
        return reverse('generated_cv', kwargs={'pk': self.object.pk})


class GeneratedCV(LoginRequiredMixin, DetailView):
    model = CVTemplate
    template_name = 'cv_template/generated_cv.html'
    context_object_name = 'cv'

    def get_object(self, queryset=None):
        pk = self.kwargs.get('pk')
        return CVTemplate.objects.get(pk=pk)
