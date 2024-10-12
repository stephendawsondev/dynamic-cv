from django.views.generic import TemplateView
from django.contrib.auth.mixins import UserPassesTestMixin, LoginRequiredMixin
from django.contrib.auth.mixins import UserPassesTestMixin
from django.contrib.messages.views import SuccessMessageMixin


class ProfileView(LoginRequiredMixin, TemplateView):
    """
    View to render user profile
    """
    template_name = 'profiles/profile.html'