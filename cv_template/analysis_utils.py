from langchain_openai import ChatOpenAI
from spellchecker import SpellChecker
import json

from .data.exclusion_list import exclusion_list

from .models import CVTemplate
from bs4 import BeautifulSoup


class CVAnalyzer:

    def __init__(self, cv: CVTemplate):
        self.cv = cv
        self.chat = ChatOpenAI()

    def get_position_skills(self) -> dict:
        job_title = self.cv.position_title
        prompt_text = f"""
            For the position of {job_title}, ensure there can be no decoding errors in python format, provide the following details in JSON format:
            {{
                "technical_skills": ["List the top 5 technical skills"],
                "soft_skills": ["List the top 5 soft skills"],
                "tech_competencies": ["List the top 5 tech competencies"],
                "qualifications": ["List the most common 3 qualifications"],
                "methodologies": ["List the most common methodologies e.g. Agile, Behaviour Driven Development"]
            }}
        """
        response = self.chat.invoke(prompt_text)
        json_resp = json.loads(response.content)
        return json_resp

    def get_potential_missing_skills(self, missing_skills: list) -> dict:
        """
        Analyzes the CV against the missing skills from a job posting and returns potential skills that the user may have.
        """
        job_titles = self.cv.work_experience.all().values_list("position", flat=True)
        prompt_text = f"""
            From the list of {missing_skills} from a job posting, could you list skills that I might of picked 
            up in my previous roles {job_titles}, also include what the skill means provide the following details in list format. 
            Please ensure each list item is enclosed in double quotes and that only single quotes are used in the string to avoid parsing errors in python:
            [
                "Agile: You may have agile experience from your role as a Scrum Master, which would greatly increase your organisational skills",
                "UX Design: You may have UX Design experience from your role as a front end dev, creating or updating designs in figma",
            ]
        """
        response = self.chat.invoke(prompt_text)
        json_resp = json.loads(response.content)
        return json_resp

    def get_suggested_roles(self) -> list:
        skills = self.cv.skills.all().values_list("name", flat=True)
        experience_skills = self.cv.work_experience.all().values_list("applied_skills", flat=True)
        school_skills = self.cv.education.all().values_list("applied_skills", flat=True)
        prompt_text = f"""
            Using the following skills {skills}, {experience_skills}, {school_skills}. Please suggest tech roles that might skills would be a good match for, 
            doesn't have to be a developer, could be scrum master Ux Designer ect. Provide 5 roles
            Provide the following details in list format.:
            [
                "UX Designer: Due to the skills on your profile: skill_1, skill_2 ect., explaination of why the match",
                "Backend Developer: Due to the skills on your profile: skill_1, skill_2 ect., explaination of why the match",
            ]
        """
        response = self.chat.invoke(prompt_text)
        json_resp = json.loads(response.content)
        return json_resp

    def check_spelling_errors(self) -> list:
        """
        Checks the summary for spelling errors and returns potential mistakes and suggestions
        """
        spell = SpellChecker()
        # Convert HTML to plain text
        soup = BeautifulSoup(self.cv.summary, "html.parser")
        plain_text_summary = soup.get_text()

        words = plain_text_summary.split()
        mistakes = spell.unknown(words)

        results = []
        for mistake in mistakes:
            if mistake.strip(".,").lower() in exclusion_list:
                continue
            correction = spell.correction(mistake)

            results.append(f"Error: {mistake} - Suggestion: {correction}")
        return results

    def get_match_on_top_skills(self, position_skills: dict) -> tuple:
        """
        Analyzes the CV against the top skills for the job position and returns a match percentage.

        Args:
            position_skills (dict): A dictionary containing the top skills for the job position.

        Returns:
            int: The percentage match out of 100 for job match on skills.
            list: A list of missing skills from the job position.
        """
        # Extract the relevant fields from the CV
        summary = self.cv.summary
        work_ex_applied_skills = [
            skill
            for experience in self.cv.work_experience.all()
            for skill in experience.applied_skills.all()
        ]
        work_ex_bullet_points = [
            bullet
            for experience in self.cv.work_experience.all()
            for bullet in experience.bullet_points.all()
        ]
        ed_applied_skills = [
            skill
            for education in self.cv.education.all()
            for skill in education.applied_skills.all()
        ]
        ed_bullet_points = [
            bullet
            for education in self.cv.education.all()
            for bullet in education.bullet_points.all()
        ]

        # Combine all CV fields into a single text
        cv_text = f"{summary} {work_ex_applied_skills} {work_ex_bullet_points} {ed_applied_skills} {ed_bullet_points}".lower()

        # Initialize match count
        match_count = 0

        missing_skills = []

        # Count the number of position skills found in the CV text
        for _, skills in position_skills.items():
            for skill in skills:
                if skill.lower() in cv_text:
                    match_count += 1
                else:
                    missing_skills.append(skill)

        # Calculate the percentage match
        total_skills = sum(len(skills) for skills in position_skills.values())
        if total_skills == 0:
            return 0  # Avoid division by zero

        match_percentage = (match_count / total_skills) * 100

        return int(match_percentage), missing_skills
