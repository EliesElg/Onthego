from rest_framework import serializers
from django.contrib.auth.models import User

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email']

    def validate_password(self, value):
        if value:
            validate_password(value)
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email']
        )
        return user

    def update(self, instance, validated_data):
        instance.email = validated_data.get('email', instance.email)
        instance.username = validated_data.get('username', instance.username)
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        instance.save()
        return instance
    

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)


class PutUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_current_password(self, value):
        """Ensure the current password matches the user's password."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Le mot de passe actuel est incorrect.")
        return value

    def validate_new_password(self, value):
        # Utiliser les validateurs de mot de passe de Django
        from django.contrib.auth.password_validation import validate_password
        validate_password(value)
        return value

    
class DeleteUserSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(required=False)
    

####### DTOs  #########

class UserDtoSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField(max_length=100)
    email = serializers.EmailField()


from rest_framework import serializers

class GeneratePromptSerializer(serializers.Serializer):
    client_name = serializers.CharField(max_length=100)
    ville = serializers.CharField(max_length=100)
    days = serializers.IntegerField()
    trip_type = serializers.CharField(max_length=50)
    start_date = serializers.DateField()
    budget = serializers.DecimalField(max_digits=10, decimal_places=2)


from .models import Itinerary, Day, Activity

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'lieu', 'type', 'budget', 'horaires']

class DaySerializer(serializers.ModelSerializer):
    activities = ActivitySerializer(many=True, read_only=True)

    class Meta:
        model = Day
        fields = ['id', 'date', 'day_number', 'activities']

class ItinerarySerializer(serializers.ModelSerializer):
    itinerary_days = DaySerializer( many=True, read_only=True)

    class Meta:
        model = Itinerary
        fields = ['id', 'client_name', 'place', 'trip_type', 'budget', 'start_date', 'created_at', 'itinerary_days']

from rest_framework import serializers
from .models import Itinerary

class ItineraryBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Itinerary
        fields = ['id', 'client_name', 'place', 'trip_type', 'budget', 'start_date', 'created_at']


