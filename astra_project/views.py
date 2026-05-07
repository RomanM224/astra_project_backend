from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.http import require_POST
from .models import Planet, Satellite, Star, StarSystem, PlanetSatelliteData, StarPlanetData, StarSystemStarData
from .forms import PlanetForm, SatelliteForm, StarForm, StarSystemForm, PlanetSatelliteDataForm, StarPlanetDataForm, StarSystemStarDataForm
import json

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

def planet_satellite_create(request):
    """
    This view handles the creation of a relationship between a planet and a satellite.
    """
    if request.method == 'POST':
        form = PlanetSatelliteDataForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('planet-list')
    else:
        form = PlanetSatelliteDataForm()
    return render(request, 'astra_project/planet_satellite.html', {'form': form})

def get_satellites_by_planet(request):
    """
    View to display satellites belonging to a selected planet.
    """
    planets = Planet.objects.all()
    satellites = []
    selected_planet = None

    if request.method == 'POST':
        planet_id = request.POST.get('planet')
        if planet_id:
            selected_planet = get_object_or_404(Planet, pk=planet_id)
            relations = PlanetSatelliteData.objects.filter(planetId=selected_planet)
            satellites = [relation.satelliteId for relation in relations]

    return render(request, 'astra_project/get_satellite_by_planet.html', {'planets': planets, 'satellites': satellites, 'selected_planet': selected_planet})

def star_planet_create(request):
    """
    This view handles the creation of a relationship between a star and a planet.
    """
    if request.method == 'POST':
        form = StarPlanetDataForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('star-list')
    else:
        form = StarPlanetDataForm()
    return render(request, 'astra_project/star_planet.html', {'form': form})

def get_planets_by_star(request):
    """
    View to display planets belonging to a selected star.
    """
    stars = Star.objects.all()
    planets = []
    selected_star = None

    if request.method == 'POST':
        star_id = request.POST.get('star')
        if star_id:
            selected_star = get_object_or_404(Star, pk=star_id)
            relations = StarPlanetData.objects.filter(starId=selected_star)
            planets = [relation.planetId for relation in relations]

    return render(request, 'astra_project/get_planet_by_star.html', {'stars': stars, 'planets': planets, 'selected_star': selected_star})

def star_system_star_create(request):
    """
    This view handles the creation of a relationship between a star system and a star.
    """
    if request.method == 'POST':
        form = StarSystemStarDataForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('star-system-list')
    else:
        form = StarSystemStarDataForm()
    return render(request, 'astra_project/starsystem_star.html', {'form': form})

def get_stars_by_starsystem(request):
    """
    View to display stars belonging to a selected star system.
    """
    star_systems = StarSystem.objects.all()
    stars = []
    selected_star_system = None

    if request.method == 'POST':
        star_system_id = request.POST.get('star_system')
        if star_system_id:
            selected_star_system = get_object_or_404(StarSystem, pk=star_system_id)
            relations = StarSystemStarData.objects.filter(starSystemId=selected_star_system)
            stars = [relation.starId for relation in relations]

    return render(request, 'astra_project/get_star_by_starsystem.html', {'star_systems': star_systems, 'stars': stars, 'selected_star_system': selected_star_system})

def simulation(request):
    # Check if a specific star system was requested via URL parameters
    system_id = request.GET.get('system_id')
    
    if system_id:
        solar_system = StarSystem.objects.filter(pk=system_id).first()
    else:
        # Fallback: Fetch the default Solar System if no ID is provided
        solar_system = StarSystem.objects.filter(name__icontains="The Solar System").first()

    if solar_system:
        # Get stars related to the Solar System
        star_ids = StarSystemStarData.objects.filter(starSystemId=solar_system).values_list('starId', flat=True)
        stars = Star.objects.filter(id__in=star_ids)

        # Get planets related to these stars
        star_planet_qs = StarPlanetData.objects.filter(starId__in=stars)
        planet_ids = star_planet_qs.values_list('planetId', flat=True)
        planets = Planet.objects.filter(id__in=planet_ids)

        # Get satellites related to these planets
        planet_sat_qs = PlanetSatelliteData.objects.filter(planetId__in=planets)
        satellite_ids = planet_sat_qs.values_list('satelliteId', flat=True)
        satellites = Satellite.objects.filter(id__in=satellite_ids)

        # Get relationship data for filtered objects
        star_planet_rels = list(star_planet_qs.values('starId', 'planetId'))
        planet_sat_rels = list(planet_sat_qs.values('planetId', 'satelliteId'))
    else:
        stars = Star.objects.none()
        planets = Planet.objects.none()
        satellites = Satellite.objects.none()
        star_planet_rels = []
        planet_sat_rels = []

    # Helper to construct image paths (assuming textureUrl stores filename like 'mars.jpg')
    # and mapping model fields to the structure expected by simulation.js
    star_list = [{
        'id': s.id, 'name': s.name, 'description': s.description, 'size': s.size,
        'textureURL': f'/static/images/textures/{s.textureUrl}' if s.textureUrl else '',
        'distance': s.distance, 'speed': s.speed, 'position': s.position
    } for s in stars]

    planet_list = [{
        'id': p.id, 'name': p.name, 'description': p.description, 'size': p.size,
        'textureURL': f'/static/images/textures/{p.textureUrl}' if p.textureUrl else '',
        'distance': p.distance, 'speed': p.speed, 'positionX': p.position 
    } for p in planets]

    satellite_list = [{
        'id': s.id, 'name': s.name, 'description': s.description, 'size': s.size,
        'textureURL': f'/static/images/textures/{s.textureUrl}' if s.textureUrl else '',
        'distance': s.distance, 'speed': s.speed, 'positionX': s.position 
    } for s in satellites]

    context = {
        'star_data_json': json.dumps(star_list),
        'planet_data_json': json.dumps(planet_list),
        'satellite_data_json': json.dumps(satellite_list),
        'star_planet_data_json': json.dumps(star_planet_rels),
        'planet_satellite_data_json': json.dumps(planet_sat_rels),
    }
    return render(request, 'astra_project/simulation.html', context)