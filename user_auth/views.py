from django.shortcuts import render
from allauth.account.views import LoginView, SignupView
import json


"""
Converts the allauth form errors into object format
"""
def get_errors_as_object(form):
  error_obj = {}

  if form.errors:
    form_errors = json.loads(form.errors.as_json())
    for field, value in form_errors.items():
      if field not in error_obj:
        error_obj[field] = []

      for message in value:
        error_obj[field].append(message['message'])
  return error_obj


# Create your views here.
class CustomLoginView(LoginView):
  
  def get_context_data(self, **kwargs):
    context = super().get_context_data(**kwargs)
    # Adding custom error messages under each input
    email_errors = []
    password_errors = []
    form_errors = get_errors_as_object(context['form'])
    for field, value in form_errors.items():
      if field == 'password':
        password_errors = value
      else:
        email_errors = value
    context['email_errors'] = email_errors
    context['password_errors'] = password_errors
    return context

  def get(self, request):
    return super().get(request)


class CustomSignupView(SignupView):
  
  def get_context_data(self, **kwargs):
    context = super().get_context_data(**kwargs)
    form_errors = get_errors_as_object(context['form'])
    for field, value in form_errors.items():
      input_key = f'{field}_errors'
      context[input_key] = value
    return context

  def get(self, request):
    return super().get(request)
