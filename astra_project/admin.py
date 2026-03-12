from django.contrib import admin
from .models import Planet, Satellite, Star, StarSystem

@admin.register(Planet)
class PlanetAdmin(admin.ModelAdmin):
    """
    Customizes the display of the Planet model in the Django Admin interface.
    """
    list_display = ('name', 'size', 'distance', 'speed', 'textureUrl', 'pictureUrl')
    search_fields = ('name', 'description')
    list_filter = ('size', 'distance')

@admin.register(Satellite)
class SatelliteAdmin(admin.ModelAdmin):
    """
    Customizes the display of the Satellite model in the Django Admin interface.
    """
    list_display = ('name', 'size', 'distance', 'speed')
    search_fields = ('name', 'description')
    list_filter = ('size',)

@admin.register(Star)
class StarAdmin(admin.ModelAdmin):
    """
    Customizes the display of the Star model in the Django Admin interface.
    """
    list_display = ('name', 'size', 'distance', 'speed')
    search_fields = ('name', 'description')
    list_filter = ('size', 'distance')

@admin.register(StarSystem)
class StarSystemAdmin(admin.ModelAdmin):
    """
    Customizes the display of the StarSystem model in the Django Admin interface.
    """
    list_display = ('name', 'distanceToUse')
    search_fields = ('name', 'description')
    list_filter = ('distanceToUse',)
