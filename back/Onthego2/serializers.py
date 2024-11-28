from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile  # Assurez-vous d'importer le modèle UserProfile
from django.contrib.auth.password_validation import validate_password
from .models import Post
from rest_framework import serializers
from .models import Itinerary
import re

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'role']  # Ajout du champ `role`
        extra_kwargs = {'password': {'write_only': True}}

    def validate_password(self, value):
        # Vérifie que le mot de passe contient au moins 8 caractères et un chiffre
        if len(value) < 8:
            raise serializers.ValidationError("Le mot de passe doit comporter au moins 8 caractères.")

        if not re.search(r'\d', value):  # Vérifie qu'il y a au moins un chiffre
            raise serializers.ValidationError("Le mot de passe doit contenir au moins un chiffre.")

        return value


#test
    def create(self, validated_data):
        # Extraire le champ `role` des données validées
        role = validated_data.pop('role')
        # Créer l'utilisateur
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        # Créer le profil utilisateur avec le rôle
        UserProfile.objects.create(user=user, role=role)
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


class TokenSerializer(serializers.ModelSerializer):
    role = serializers.CharField(max_length=20, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']  # Ajoutez le champ role

    def to_representation(self, instance):
        """
        Surcharge de la méthode pour inclure le rôle de l'utilisateur.
        """
        representation = super().to_representation(instance)
        # Accéder au rôle à partir du profil utilisateur
        representation['role'] = instance.profile.role
        return representation


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

class TokenSerializer(serializers.ModelSerializer):
    role = serializers.CharField(max_length=20, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']  # Ajoutez le champ `role`

    def to_representation(self, instance):
        """
        Surcharge de la méthode pour inclure le rôle de l'utilisateur.
        """
        representation = super().to_representation(instance)
        # Accéder au rôle à partir du profil utilisateur
        representation['role'] = instance.profile.role
        return representation
from rest_framework import serializers

class GeneratePromptSerializer(serializers.Serializer):
    client_name = serializers.CharField(max_length=100)
    ville = serializers.CharField(max_length=100, required= True)
    days = serializers.IntegerField(required= True)
    trip_type = serializers.CharField(max_length=50)
    start_date = serializers.DateField(required= True)
    budget = serializers.DecimalField(max_digits=10, decimal_places=2,required= True)
    age = serializers.IntegerField()
    comments = serializers.CharField(max_length=350, required=False, allow_null=True)


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

class ItineraryBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Itinerary
        fields = ['id', 'client_name', 'place', 'trip_type', 'budget', 'start_date', 'created_at']

class PostSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    itinerary = ItinerarySerializer()  # Assuming you have an `ItinerarySerializer`

    class Meta:
        model = Post
        fields = ['id', 'user', 'itinerary', 'text', 'created_at', 'likes']

class ShareItinerarySerializer(serializers.Serializer):
    itinerary_id = serializers.IntegerField()  # ID de l'itinéraire
    text = serializers.CharField(max_length=300, required=False, allow_blank=True)

    def validate_itinerary_id(self, value):
        """
        Valider si l'itinéraire existe et appartient à l'utilisateur.
        """
        user = self.context['request'].user
        if not Itinerary.objects.filter(id=value, user=user).exists():
            raise serializers.ValidationError("L'itinéraire n'existe pas ou ne vous appartient pas.")
        return value

