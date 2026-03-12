from django.db import models

class Planet(models.Model):
    """
    Represents a celestial body (Planet) with its physical properties and texture.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    size = models.FloatField(help_text="Diameter in kilometers")
    textureUrl = models.TextField(help_text="URL to the planet's texture image", blank=True, null=True)
    pictureUrl = models.TextField(help_text="URL to the planet's picture", blank=True, null=True)
    distance = models.FloatField(help_text="Distance from its star in million km")
    speed = models.FloatField(help_text="Orbital speed in km/s")
    position = models.FloatField(help_text="A single value representing position. Consider expanding if this is for 3D space.")

    def __str__(self):
        return self.name

class Satellite(models.Model):
    """
    Represents a satellite (moon) orbiting a planet.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    size = models.FloatField(help_text="Diameter in kilometers")
    distance = models.FloatField(help_text="Distance from its planet in km")
    textureUrl = models.TextField(help_text="URL to the satellite's texture image", blank=True, null=True)
    pictureUrl = models.TextField(help_text="URL to the satellite's picture", blank=True, null=True)
    speed = models.FloatField(help_text="Orbital speed in km/s")
    position = models.FloatField(help_text="A single value representing position. Consider expanding if this is for 3D space.")

    def __str__(self):
        return self.name

class StarSystem(models.Model):
    """
    Represents a star system, a collection of celestial bodies.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    pictureUrl = models.TextField(help_text="URL to the star system's picture", blank=True, null=True)
    distanceToUse = models.FloatField(help_text="Distance from Earth in light-years")

    def __str__(self):
        return self.name

class Star(models.Model):
    """
    Represents a star, the central body of a star system.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    size = models.FloatField(help_text="Diameter in kilometers")
    distance = models.FloatField(help_text="Distance from Earth in light-years")
    textureUrl = models.TextField(help_text="URL to the star's texture image", blank=True, null=True)
    pictureUrl = models.TextField(help_text="URL to the star's picture", blank=True, null=True)
    speed = models.FloatField(help_text="Relative speed in km/s")
    position = models.FloatField(help_text="A single value representing position.")

    def __str__(self):
        return self.name