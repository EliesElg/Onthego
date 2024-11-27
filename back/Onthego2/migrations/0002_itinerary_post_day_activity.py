# Generated by Django 4.2.5 on 2024-11-27 00:23

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('Onthego2', '0001_initial_userprofile'),
    ]

    operations = [
        migrations.CreateModel(
            name='Itinerary',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('client_name', models.CharField(max_length=100)),
                ('place', models.CharField(max_length=100)),
                ('days', models.IntegerField()),
                ('trip_type', models.CharField(max_length=50)),
                ('start_date', models.DateField()),
                ('budget', models.DecimalField(decimal_places=2, max_digits=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Post',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('itinerary', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='Onthego2.itinerary')),
                ('likes', models.ManyToManyField(blank=True, related_name='post_likes', to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='posts', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Day',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('day_number', models.IntegerField()),
                ('itinerary', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='itinerary_days', to='Onthego2.itinerary')),
            ],
        ),
        migrations.CreateModel(
            name='Activity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('lieu', models.CharField(max_length=100)),
                ('type', models.CharField(max_length=50)),
                ('budget', models.DecimalField(decimal_places=2, max_digits=10)),
                ('horaires', models.CharField(max_length=20)),
                ('day', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='activities', to='Onthego2.day')),
            ],
        ),
    ]
