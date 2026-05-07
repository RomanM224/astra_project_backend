from django.test import TestCase, Client
from django.urls import reverse
from .models import Planet, Star, StarSystem, StarSystemStarData, StarPlanetData, Satellite
from .forms import PlanetForm
import json

class AstraModelTests(TestCase):
    """Tests for the Models."""

    def setUp(self):
        self.planet = Planet.objects.create(
            name="Earth",
            description="The third planet from the Sun.",
            size=12742,
            distance=149.6,
            speed=29.78,
            position=1.0
        )

    def test_planet_creation(self):
        """Verify planet string representation and storage."""
        self.assertEqual(str(self.planet), "Earth")
        self.assertEqual(self.planet.size, 12742)

class AstraFormTests(TestCase):
    """Tests for the forms used in the application."""

    def test_planet_form_valid(self):
        """Test PlanetForm with valid data."""
        form_data = {
            'name': 'Mars',
            'description': 'The Red Planet',
            'size': 6779,
            'distance': 227.9,
            'speed': 24.07,
            'position': 2.0
        }
        form = PlanetForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_planet_form_invalid(self):
        """Test PlanetForm with missing required fields."""
        form = PlanetForm(data={'name': ''})
        self.assertFalse(form.is_valid())

class AstraViewTests(TestCase):
    """Tests for the views and template rendering."""

    def setUp(self):
        self.client = Client()
        self.planet = Planet.objects.create(
            name="Jupiter",
            description="Largest planet.",
            size=139820,
            distance=778.5,
            speed=13.07,
            position=5.0
        )

    def test_planet_list_view(self):
        """Test that the planet list page loads and displays content."""
        response = self.client.get(reverse('planet-list'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'astra_project/planet_list.html')
        self.assertContains(response, "Jupiter")

    def test_simulation_view_filtering(self):
        """Test the simulation logic for filtering data by StarSystem."""
        # 1. Create a Star System
        system = StarSystem.objects.create(
            name="Solar System", 
            description="Our home", 
            distanceToUse=0
        )
        # 2. Create a Star
        sun = Star.objects.create(
            name="Sun", 
            description="G-type star", 
            size=1392700, 
            distance=0, 
            speed=0, 
            position=0
        )
        # 3. Establish relationships
        StarSystemStarData.objects.create(starSystemId=system, starId=sun)
        StarPlanetData.objects.create(starId=sun, planetId=self.planet)

        # 4. Request the simulation for this system
        response = self.client.get(reverse('simulation'), {'system_id': system.id})
        self.assertEqual(response.status_code, 200)

        # 5. Parse JSON data sent to the context
        stars_json = json.loads(response.context['star_data_json'])
        planets_json = json.loads(response.context['planet_data_json'])

        # 6. Verify the correct objects are included
        self.assertEqual(len(stars_json), 1)
        self.assertEqual(stars_json[0]['name'], "Sun")
        self.assertEqual(len(planets_json), 1)
        self.assertEqual(planets_json[0]['name'], "Jupiter")

class AstraIntegrationTests(TestCase):
    """Integration tests covering multi-step workflows and DB interactions."""

    def setUp(self):
        self.client = Client()

    def test_create_planet_flow(self):
        """Test the end-to-end flow of creating a planet via the UI."""
        # 1. Post data to the create view
        planet_data = {
            'name': 'Venus',
            'description': 'The second planet.',
            'size': 12104,
            'distance': 108.2,
            'speed': 35.02,
            'position': 2.0
        }
        response = self.client.post(reverse('planet-create'), data=planet_data)

        # 2. Check for redirect to the list page
        self.assertRedirects(response, reverse('planet-list'))

        # 3. Verify the object exists in the database
        self.assertTrue(Planet.objects.filter(name='Venus').exists())

        # 4. Verify it appears on the list page
        list_response = self.client.get(reverse('planet-list'))
        self.assertContains(list_response, 'Venus')

    def test_link_star_and_planet_flow(self):
        """Test creating a relationship between a Star and a Planet via the form."""
        # 1. Setup existing objects
        star = Star.objects.create(name="Alpha Centauri", description="...", size=1, distance=4.3, speed=1, position=1)
        planet = Planet.objects.create(name="Proxima b", description="...", size=1, distance=0.04, speed=1, position=1)

        # 2. Link them via the StarPlanetData view
        response = self.client.post(reverse('star-planet-create'), data={
            'starId': star.id,
            'planetId': planet.id
        })

        # 3. Check for redirect (the view redirects to 'star-list')
        self.assertRedirects(response, reverse('star-list'))

        # 4. Verify the relationship exists in the join table
        self.assertTrue(StarPlanetData.objects.filter(starId=star, planetId=planet).exists())

    def test_cascade_behavior_on_delete(self):
        """Ensure deleting a star system cleans up relationships but preserves objects."""
        system = StarSystem.objects.create(name="Binary System", description="...", distanceToUse=10)
        star = Star.objects.create(name="Star A", description="...", size=1, distance=1, speed=1, position=1)
        StarSystemStarData.objects.create(starSystemId=system, starId=star)
        # Delete the system
        system.delete()
        # The link should be gone, but the star should remain
        self.assertFalse(StarSystemStarData.objects.filter(starId=star).exists())
        self.assertTrue(Star.objects.filter(id=star.id).exists())