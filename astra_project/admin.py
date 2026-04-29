from django.contrib import admin
from django.utils.safestring import mark_safe
from .models import (
    Planet, Satellite, Star, StarSystem, 
    PlanetSatelliteData, StarPlanetData, StarSystemStarData
)

# Inlines allow you to manage related objects directly on the parent's admin page
class PlanetSatelliteInline(admin.TabularInline):
    model = PlanetSatelliteData
    extra = 1

class StarPlanetInline(admin.TabularInline):
    model = StarPlanetData
    extra = 1

class StarSystemStarInline(admin.TabularInline):
    model = StarSystemStarData
    extra = 1

@admin.register(Planet)
class PlanetAdmin(admin.ModelAdmin):
    """
    Customizes the display of the Planet model in the Django Admin interface.
    """
    list_display = ('name', 'picture_preview', 'size', 'distance', 'speed')
    search_fields = ('name', 'description')
    list_filter = ('size', 'distance')
    inlines = [PlanetSatelliteInline]

    def picture_preview(self, obj):
        if obj.pictureUrl:
            # Displaying a small thumbnail in the list view
            return mark_safe(f'<img src="/static/images/planets/{obj.pictureUrl}" width="50" height="50" style="border-radius: 5px; object-fit: cover;" />')
        return "No Image"
    picture_preview.short_description = 'Preview'

@admin.register(Satellite)
class SatelliteAdmin(admin.ModelAdmin):
    """
    Customizes the display of the Satellite model in the Django Admin interface.
    """
    list_display = ('name', 'size', 'distance', 'speed')
    search_fields = ('name', 'description')
    list_filter = ('size',)

    def picture_preview(self, obj):
        if obj.pictureUrl:
            return mark_safe(f'<img src="/static/images/satellites/{obj.pictureUrl}" width="50" height="50" style="border-radius: 5px; object-fit: cover;" />')
        return "No Image"

@admin.register(Star)
class StarAdmin(admin.ModelAdmin):
    """
    Customizes the display of the Star model in the Django Admin interface.
    """
    list_display = ('name', 'picture_preview', 'size', 'distance', 'speed')
    search_fields = ('name', 'description')
    list_filter = ('size', 'distance')
    inlines = [StarPlanetInline]

    def picture_preview(self, obj):
        if obj.pictureUrl:
            return mark_safe(f'<img src="/static/images/stars/{obj.pictureUrl}" width="50" height="50" style="border-radius: 5px; object-fit: cover;" />')
        return "No Image"

@admin.register(StarSystem)
class StarSystemAdmin(admin.ModelAdmin):
    """
    Customizes the display of the StarSystem model in the Django Admin interface.
    """
    list_display = ('name', 'picture_preview', 'distanceToUse')
    search_fields = ('name', 'description')
    list_filter = ('distanceToUse',)
    inlines = [StarSystemStarInline]

    def picture_preview(self, obj):
        if obj.pictureUrl:
            return mark_safe(f'<img src="{obj.pictureUrl}" width="50" height="50" style="border-radius: 5px; object-fit: cover;" />')
        return "No Image"

@admin.register(PlanetSatelliteData)
class PlanetSatelliteDataAdmin(admin.ModelAdmin):
    """
    Customizes the display of the PlanetSatelliteData model.
    """
    list_display = ('planetId', 'satelliteId')
    list_filter = ('planetId',)

@admin.register(StarPlanetData)
class StarPlanetDataAdmin(admin.ModelAdmin):
    """
    Customizes the display of the StarPlanetData model.
    """
    list_display = ('starId', 'planetId')
    list_filter = ('starId',)

@admin.register(StarSystemStarData)
class StarSystemStarDataAdmin(admin.ModelAdmin):
    """
    Customizes the display of the StarSystemStarData model.
    """
    list_display = ('starSystemId', 'starId')
    list_filter = ('starSystemId',)
