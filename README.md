# Welcome to Stephen's Django Starter template

This template assumes you are creating a Django project that uses a PostgreSQL database in production and a SQLite database in development. It also includes a basic user authentication system and Cloudinary for image uploads.

If this is your first time using the template (before the initial commit), you may want to update the project's name. By searching for `myapp` and replacing it with your project's name. In this template's case, it is found in:

1. `manage.py`
2. `myapp/asgi.py`
3. `myapp/settings.py`
4. `myapp/urls.py`
5. `myapp/wsgi.py`
6. `Procfile`
7. The folder named `myapp` in the root directory

To get started, please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file for instructions on how to set up the project on your local machine.

## Features

Description of the features of the project.

## Deployment to Heroku

For Heroku deployment, you will need the following environment variables:

```
DATABASE_URL = <your-production-database-url>
SECRET_KEY = <your-secret-key>
CLOUDINARY_URL = <your-production-cloudinary-url>
ALLOWED_HOSTS = <your-deployed-app-url>
CSRF_TRUSTED_ORIGINS = <your-deployed-app-url>
DEBUG_MODE = False // Set to False in production, but can be True for debugging

# Optional
DISABLE_COLLECTSTATIC = 1 // Set to 1 to disable collectstatic (don't make Cloudinary store all your CSS, JS and Image files)

```
