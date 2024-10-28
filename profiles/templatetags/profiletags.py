from django import template
from profiles.models import WorkExperience, Education

from itertools import chain


register = template.Library()
@register.simple_tag
def order_work_by_end_date(user):
  """
  Returns a list of work experiences owned by the user, and
  orders them by their end date
  """
  work_exp = WorkExperience.objects.filter(user=user)

  # Experience which has no end date will be put first, and sorted by the start date
  current_exp = work_exp.filter(end_date=None).order_by('-start_date')
  past_exp = work_exp.exclude(end_date=None).order_by('-end_date')

  ordered_exp = list(chain(current_exp, past_exp))
  return ordered_exp


@register.simple_tag
def order_education_by_end_date(user):
  """
  Returns a list of education owned by the user, and
  orders them by their end date
  """
  education_exp = Education.objects.filter(user=user)

  # Experience which has no end date will be put first, and sorted by the start date
  current_exp = education_exp.filter(end_date=None).order_by('-start_year')
  past_exp = education_exp.exclude(end_date=None).order_by('-end_year')

  ordered_exp = list(chain(current_exp, past_exp))
  return ordered_exp
