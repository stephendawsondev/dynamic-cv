from django.shortcuts import render
from allauth.account.views import LoginView
import json

# Create your views here.
class CustomLoginView(LoginView):
  
  def get_context_data(self, **kwargs):
    context = super().get_context_data(**kwargs)
    # Adding custom error messages under each input
    email_errors = []
    password_errors = []
    form = context['form']
    if form.errors:
      form_errors = json.loads(form.errors.as_json())
      for field, value in form_errors.items():
        for message in value:
          if field == 'password':
            password_errors.append(message['message'])
          else:
            email_errors.append(message['message'])
    context['email_errors'] = email_errors
    context['password_errors'] = password_errors
    return context

  def get(self, request):
    return super().get(request)