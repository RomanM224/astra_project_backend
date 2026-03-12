from django import forms
from .models import Planet, Satellite, Star, StarSystem

class PlanetForm(forms.ModelForm):
    """
    Form class for creating and updating Planet model instances.
    """
    class Meta:
        model = Planet
        fields = ['name', 'description', 'size', 'textureUrl', 'pictureUrl', 'distance', 'speed', 'position']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
            'size': forms.NumberInput(attrs={'class': 'form-control'}),
            'textureUrl': forms.TextInput(attrs={'class': 'form-control'}),
            'pictureUrl': forms.TextInput(attrs={'class': 'form-control'}),
            'distance': forms.NumberInput(attrs={'class': 'form-control'}),
            'speed': forms.NumberInput(attrs={'class': 'form-control'}),
            'position': forms.NumberInput(attrs={'class': 'form-control'}),
        }

class StarForm(forms.ModelForm):
    """
    Form class for creating and updating Star model instances.
    """
    class Meta:
        model = Star
        fields = ['name', 'description', 'size', 'distance', 'textureUrl', 'pictureUrl', 'speed', 'position']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
            'size': forms.NumberInput(attrs={'class': 'form-control'}),
            'distance': forms.NumberInput(attrs={'class': 'form-control'}),
            'textureUrl': forms.TextInput(attrs={'class': 'form-control'}),
            'pictureUrl': forms.TextInput(attrs={'class': 'form-control'}),
            'speed': forms.NumberInput(attrs={'class': 'form-control'}),
            'position': forms.NumberInput(attrs={'class': 'form-control'}),
        }

class StarSystemForm(forms.ModelForm):
    """
    Form class for creating and updating StarSystem model instances.
    """
    class Meta:
        model = StarSystem
        fields = ['name', 'description', 'pictureUrl', 'distanceToUse']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
            'pictureUrl': forms.TextInput(attrs={'class': 'form-control'}),
            'distanceToUse': forms.NumberInput(attrs={'class': 'form-control'}),
        }

class SatelliteForm(forms.ModelForm):
    """
    Form class for creating and updating Satellite model instances.
    """
    class Meta:
        model = Satellite
        fields = ['name', 'description', 'size', 'distance', 'textureUrl', 'pictureUrl', 'speed', 'position']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
            'size': forms.NumberInput(attrs={'class': 'form-control'}),
            'distance': forms.NumberInput(attrs={'class': 'form-control'}),
            'textureUrl': forms.TextInput(attrs={'class': 'form-control'}),
            'pictureUrl': forms.TextInput(attrs={'class': 'form-control'}),
            'speed': forms.NumberInput(attrs={'class': 'form-control'}),
            'position': forms.NumberInput(attrs={'class': 'form-control'}),
        }