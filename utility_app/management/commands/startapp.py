import os
from django.core.management.commands.startapp import Command as StartAppCommand


class Command(StartAppCommand):
    help = "Extends 'startapp' to use a custom template and replace placeholders."

    def handle(self, **options):
        app_name = options['name']

        if not options.get('template'):
            options['template'] = 'app_name'

        super().handle(**options)

        app_dir = os.path.join(os.getcwd(), app_name)

        with open(os.path.join(app_dir, 'apps.py'), 'r') as file:
            content = file.read()

        app_name_parts = app_name.split('_')
        app_name_camel_case = ''.join(part.capitalize()
                                      for part in app_name_parts)

        content = content.replace(
            'MyAppConfig', f"{app_name_camel_case}Config")

        with open(os.path.join(app_dir, 'apps.py'), 'w') as file:
            file.write(content)
