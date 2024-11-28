from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.db import models

#TEST
class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('pro', 'Professionnel'),
        ('particulier', 'Particulier'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='particulier')

    def __str__(self):
        return f"Profile of {self.user.username}"


class Itinerary(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    client_name = models.CharField(max_length=100)
    place = models.CharField(max_length=100)
    days = models.IntegerField()
    trip_type = models.CharField(max_length=50)
    start_date = models.DateField()
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Itinerary for {self.client_name} to {self.place}"

class Day(models.Model):
    itinerary = models.ForeignKey(Itinerary, related_name='itinerary_days', on_delete=models.CASCADE)
    date = models.DateField()
    day_number = models.IntegerField()

    def __str__(self):
        return f"Day {self.day_number} of Itinerary {self.itinerary.client_name}"


class Activity(models.Model):
    day = models.ForeignKey(Day, related_name='activities', on_delete=models.CASCADE)
    lieu = models.CharField(max_length=100)
    type = models.CharField(max_length=50)
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    horaires = models.CharField(max_length=20)

    def __str__(self):
        return f"Activity at {self.lieu} on {self.day.date}"


User = get_user_model()

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    itinerary = models.ForeignKey(Itinerary, on_delete=models.CASCADE)
    text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name='post_likes', blank=True)

    def __str__(self):
        return f"Post by {self.user.username} on {self.created_at}"
