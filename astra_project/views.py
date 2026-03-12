from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.http import require_POST
from .models import Planet, Satellite, Star, StarSystem
from .forms import PlanetForm, SatelliteForm, StarForm, StarSystemForm

def landing_page(request):
    """
    Renders the main landing page.
    """
    # Fetch up to 4 planets to display in the "Popular" section
    planets = Planet.objects.all()[:4]
    context = {
        'planets': planets
    }
    return render(request, 'astra_project/index.html', context)

# Create your views here.
def planet_list(request):
    """
    This view fetches all planets from the database and renders them in a list.
    """
    planets = Planet.objects.all()
    return render(request, 'astra_project/planet_list.html', {'planets': planets})

def planet_create(request):
    """
    This view handles the creation of a new planet via a form.
    """
    if request.method == 'POST':
        form = PlanetForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('planet-list') # Redirect to the list page after saving
    else:
        form = PlanetForm()
    return render(request, 'astra_project/create_planet.html', {'form_create_planet': form})

@require_POST
def planet_delete(request, pk):
    """
    Deletes a planet object based on its primary key.
    """
    planet = get_object_or_404(Planet, pk=pk)
    planet.delete()
    return redirect('planet-list')

def planet_update(request, pk):
    """
    This view handles updating an existing planet.
    It fetches the planet by its primary key and uses the PlanetForm.
    """
    planet = get_object_or_404(Planet, pk=pk)
    if request.method == 'POST':
        # Bind form with POST data and the instance to update
        form = PlanetForm(request.POST, instance=planet)
        if form.is_valid():
            form.save()
            return redirect('planet-list')
    else:
        # Pre-populate the form with the existing planet's data
        form = PlanetForm(instance=planet)
    return render(request, 'astra_project/planet_update.html', {'form_update_planet': form, 'planet': planet})

def satellite_list(request):
    """
    This view fetches all satellites from the database and renders them in a list.
    """
    satellites = Satellite.objects.all()
    return render(request, 'astra_project/satellite_list.html', {'satellites': satellites})

def satellite_create(request):
    """
    This view handles the creation of a new satellite via a form.
    """
    if request.method == 'POST':
        form = SatelliteForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('satellite-list')
    else:
        form = SatelliteForm()
    return render(request, 'astra_project/create_satellite.html', {'form_create_satellite': form})

@require_POST
def satellite_delete(request, pk):
    """
    Deletes a satellite object based on its primary key.
    This view only accepts POST requests.
    """
    satellite = get_object_or_404(Satellite, pk=pk)
    satellite.delete()
    return redirect('satellite-list')

def satellite_update(request, pk):
    """
    This view handles updating an existing satellite.
    It fetches the satellite by its primary key and uses the SatelliteForm.
    """
    satellite = get_object_or_404(Satellite, pk=pk)
    if request.method == 'POST':
        form = SatelliteForm(request.POST, instance=satellite)
        if form.is_valid():
            form.save()
            return redirect('satellite-list')
    else:
        form = SatelliteForm(instance=satellite)
    return render(request, 'astra_project/satellite_update.html', {'form_update_satellite': form, 'satellite': satellite})

def star_list(request):
    """
    This view fetches all stars from the database and renders them in a list.
    """
    stars = Star.objects.all()
    return render(request, 'astra_project/star_list.html', {'stars': stars})

def star_create(request):
    """
    This view handles the creation of a new star via a form.
    """
    if request.method == 'POST':
        form = StarForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('star-list')
    else:
        form = StarForm()
    return render(request, 'astra_project/create_star.html', {'form_create_star': form})

@require_POST
def star_delete(request, pk):
    """
    Deletes a star object based on its primary key.
    """
    star = get_object_or_404(Star, pk=pk)
    star.delete()
    return redirect('star-list')

def star_update(request, pk):
    """
    This view handles updating an existing star.
    It fetches the star by its primary key and uses the StarForm.
    """
    star = get_object_or_404(Star, pk=pk)
    if request.method == 'POST':
        form = StarForm(request.POST, instance=star)
        if form.is_valid():
            form.save()
            return redirect('star-list')
    else:
        form = StarForm(instance=star)
    return render(request, 'astra_project/star_update.html', {'form_update_star': form, 'star': star})

def star_system_list(request):
    """
    This view fetches all star systems from the database and renders them in a list.
    """
    star_systems = StarSystem.objects.all()
    return render(request, 'astra_project/star_system_list.html', {'star_systems': star_systems})

def star_system_create(request):
    """
    This view handles the creation of a new star system via a form.
    """
    if request.method == 'POST':
        form = StarSystemForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('star-system-list')
    else:
        form = StarSystemForm()
    return render(request, 'astra_project/create_star_system.html', {'form_create_star_system': form})

@require_POST
def star_system_delete(request, pk):
    """
    Deletes a star system object based on its primary key.
    """
    star_system = get_object_or_404(StarSystem, pk=pk)
    star_system.delete()
    return redirect('star-system-list')

def star_system_update(request, pk):
    """
    This view handles updating an existing star system.
    """
    star_system = get_object_or_404(StarSystem, pk=pk)
    if request.method == 'POST':
        form = StarSystemForm(request.POST, instance=star_system)
        if form.is_valid():
            form.save()
            return redirect('star-system-list')
    else:
        form = StarSystemForm(instance=star_system)
    return render(request, 'astra_project/star_system_update.html', {'form_update_star_system': form, 'star_system': star_system})