from django.urls import path
from . import views

urlpatterns = [
    # Home page: List all planets
    path('', views.landing_page, name='landing-page'),
    # Page to list all planets
    path('planets/', views.planet_list, name='planet-list'),
    # Page to create a new planet
    path('create/', views.planet_create, name='planet-create'),
    # URL to delete a planet
    path('planets/<int:pk>/delete/', views.planet_delete, name='planet-delete'),
    # URL to update a planet
    path('planets/<int:pk>/update/', views.planet_update, name='planet-update'),

    # Satellite URLs
    path('satellites/', views.satellite_list, name='satellite-list'),
    path('satellites/create/', views.satellite_create, name='satellite-create'),
    path('satellites/<int:pk>/delete/', views.satellite_delete, name='satellite-delete'),
    path('satellites/<int:pk>/update/', views.satellite_update, name='satellite-update'),

    # Star URLs
    path('stars/', views.star_list, name='star-list'),
    path('stars/create/', views.star_create, name='star-create'),
    path('stars/<int:pk>/delete/', views.star_delete, name='star-delete'),
    path('stars/<int:pk>/update/', views.star_update, name='star-update'),

    # Star System URLs
    path('star-systems/', views.star_system_list, name='star-system-list'),
    path('star-systems/create/', views.star_system_create, name='star-system-create'),
    path('star-systems/<int:pk>/update/', views.star_system_update, name='star-system-update'),
    path('star-systems/<int:pk>/delete/', views.star_system_delete, name='star-system-delete'),
]