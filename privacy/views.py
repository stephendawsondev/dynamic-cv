from django.views.generic import TemplateView


class PrivacyPolicy(TemplateView):
    """
    A view that renders the privacy policy page.
    """
    template_name = "privacy/privacy_policy.html"