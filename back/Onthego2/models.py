from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


    
class Itinerary(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
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
