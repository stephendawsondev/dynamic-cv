from django.apps import AppConfig
import os


class UserAuthConfig(AppConfig):
    name = os.path.basename(os.path.dirname(os.path.abspath(__file__)))
