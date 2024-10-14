from django.shortcuts import render, redirect
from .models import ContactUs
from .forms import ContactUsForm

# Create your views here.
def contact_us(request):
    """
    View to render the contact us page
    """
    if request.method == 'POST':
        form = ContactUsForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('contact_us_success')
    else:
        form = ContactUsForm()
        
    return render(request, 'contact_us/contact_us.html', {'form': form})


def contact_us_success(request):
    """
    View to render the contact us success page
    """
    return render(request, 'contact_us/contact_us_success.html')
