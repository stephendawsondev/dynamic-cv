from django.views.generic import ListView, CreateView
from django.contrib.auth.mixins import (UserPassesTestMixin, LoginRequiredMixin)
from django.contrib.messages.views import SuccessMessageMixin

from .models import CVTemplate
from .forms import CVTemplateForm


class CvList(ListView):
    model = CVTemplate
    template_name = 'cv_template/cv_list.html'


class CreateCV(CreateView):
    model = CVTemplate
    form_class = CVTemplateForm
    template_name = 'cv_template/cv_template.html'
    success_message = "CV created successfully"
    success_url = 'cv/cv_list/'