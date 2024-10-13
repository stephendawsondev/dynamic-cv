from django import template
import re

register = template.Library()


@register.filter
def clean_url(value):
    """
    Removes 'http://', 'https://', 'http://www.', and 'https://www.' from the beginning of a string.

    Usage in template:
    {{ url_string|clean_url }}
    """
    pattern = r'^(https?://)?(www\.)?'
    return re.sub(pattern, '', value)
