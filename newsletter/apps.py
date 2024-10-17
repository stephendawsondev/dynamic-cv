from django.apps import AppConfig
import os


class NewsletterConfig(AppConfig):
    name = os.path.basename(os.path.dirname(os.path.abspath(__file__)))
