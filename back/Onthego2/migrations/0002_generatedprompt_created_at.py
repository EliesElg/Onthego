# Generated by Django 4.2.6 on 2024-01-05 23:28

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('Onthego2', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='generatedprompt',
            name='created_at',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
