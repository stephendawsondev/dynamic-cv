# Contributing

## Getting started

## Setting up the Virtual Environment

If you are using Gitpod, CodeAnywhere or another Cloud IDE, you can skip this step as the virtual environment is already set up for you. If you are using VSCode or another local IDE, you will need to set up a virtual environment to run the project.

1. Open a terminal in the root directory of the project.

2. If on Windows, run the following command to create a virtual environment:

```
python -m venv venv
```

If on MacOS or Linux, run the following command:

```
python3 -m venv venv
```

3. Activate the virtual environment. If on Windows, run the following command:

```
venv\Scripts\activate
```

If on MacOS or Linux, run the following command:

```
source venv/bin/activate
```

4. You may need to close and reopen the terminal for the changes to take effect.

## Running the project

If you want to contribute to this project, you can follow the steps below:

1. Fork the project repository by clicking on the 'Fork' button near the top of this page. This creates a copy of the project in your GitHub account.

2. Clone your fork of the project to your local machine. Copy the URL of the 'Clone or download' button near the top of the page. Open a terminal and run the following git command:

```
git clone <git-clone-link>
```

3. Change into the project's root directory:

```
cd <project-name>
```

3.5 Add an `env.py` file to the project's root directory with the following content:

```python
import os

os.environ["DATABASE_URL"] = "<your-production-database-url>"
os.environ["SECRET_KEY"] = "<your-secret-key>"
os.environ["CLOUDINARY_URL"] = "<your-production-cloudinary-url>"
os.environ["ALLOWED_HOSTS"] = "*"
os.environ["CSRF_TRUSTED_ORIGINS"] = "http://* https://*"
os.environ["DEBUG_MODE"] = "True"
```

4. If you are using a local IDE, activate the virtual environment. If you are using Gitpod, CodeAnywhere or another Cloud IDE, you can skip this step - install your dependencies with the following command:

```
pip install -r requirements.txt
```

5. Run the project with the following command:

```
python manage.py runserver
```

6. Create a new branch for your feature:

```
git checkout -b <branch-name>
```

7. Make your changes to the project. You can open the project in your code editor of choice and edit the files there.

8. Add your changes to the staging area:

```
git add .
```

9. Commit your changes with a descriptive commit message:

```
git commit -m "Your commit message"
```

10. Push your changes to the new branch on your fork of the repository:

```
git push origin <your-branch-name>
```

11. Open a pull request on the original repository. To do this, navigate to the 'Pull Requests' tab of the original repository and click on the 'New Pull Request' button. You can then select your forked repository and the branch with your changes.

A maintainer of the project will review your pull request and merge it if it is approved. If not, they may provide feedback on your contribution and ask you to make further changes.

12. After your pull request is merged, you can pull the changes from 'upstream' (the original repository) to your local machine and delete the extra branch(es) you created.

```
git checkout main
git pull upstream main
git branch -d <your-branch-name> // optional
```

You will now have the latest version of the code and can repeat the process from step 3 if you want to contribute further.
