from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import NewsletterSubscriber


# Create your views here.
def subscribe_newsletter(request):
    """
    View to collect newsletter subscribers
    """
    if request.method == 'POST':
        email = request.POST.get('email')

        if NewsletterSubscriber.objects.filter(email=email).exists():
            return HttpResponse('<p class="error text-violet-800">This email is already subscribed.</p>')
        else:
            NewsletterSubscriber.objects.create(email=email)
            return HttpResponse('<p class="success text-violet-800">Thank you for subscribing to our Newsletter!</p>')

    return HttpResponse('<p class="error text-violet-800">Your subscription failed.</p>')
