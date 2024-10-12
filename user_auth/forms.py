from allauth.account.forms import LoginForm, SignupForm


class CustomLoginForm(LoginForm):
  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)