from django.views.generic import ListView, CreateView
from django.contrib.auth.mixins import UserPassesTestMixin, LoginRequiredMixin
from django.contrib import messages

from .models import CVTemplate
from .forms import CVTemplateForm

from profiles.models import Summary


class CvList(ListView):
    model = CVTemplate
    template_name = "cv_template/cv_list.html"


class CreateCV(LoginRequiredMixin, CreateView):
    model = CVTemplate
    form_class = CVTemplateForm
    template_name = "cv_template/cv_template.html"
    success_url = "/"

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
        messages.success(self.request, "CV created successfully")
        return super().form_valid(form)
