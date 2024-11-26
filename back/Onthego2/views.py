import json
from django.shortcuts import get_object_or_404
import pytz
import openai
from datetime import datetime
from django.utils.timezone import make_aware
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import HttpResponse, JsonResponse
import re
import os
from django.db.models.functions import ExtractMonth
from django.db.models import Count
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import AccessToken
from .serializers import *
from .models import *
from drf_yasg.utils import swagger_auto_schema
from .tokens import CustomRefreshToken  # Remplacer l'import RefreshToken par celui-ci
from django.contrib.auth import get_user_model
from .permissions import IsPro  # Importer la permission personnalisée


def parse_date(date_str):
    """
    Tente de convertir une chaîne de caractères en date en utilisant plusieurs formats.
    """
    for fmt in ('%Y-%m-%d', '%d/%m/%Y'):
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    raise ValueError(f"Format de date invalide : {date_str}")

@swagger_auto_schema(method='post', request_body=LoginSerializer)
@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(username=username, password=password)
        if not user:
            content = {'Error': 'No user found'}
            return Response(content, status=status.HTTP_401_UNAUTHORIZED)
        if user:
            refresh = CustomRefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            return Response({"access_token": access_token, "user_id": user.id}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@swagger_auto_schema(method='post', request_body=UserSerializer)
@api_view(['POST'])
def signup(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()

        # Générer un token JWT pour l'utilisateur
        refresh = CustomRefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        user_dto = UserDtoSerializer(user)
        return Response({"access_token": access_token, "user": user_dto.data}, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# Suppression du compte : Utilisez uniquement le jeton JWT sans corps de requête pour supprimer votre propre compte en tant qu'utilisateur.
# Pour les administrateurs souhaitant supprimer un autre utilisateur, utilisez le corps de la requête avec "user_id"
@swagger_auto_schema(method='delete')
@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def deleteuser(request, user_id=None):
    User = get_user_model()

    try:
        # Vérifier si l'utilisateur connecté est admin
        if request.user.is_superuser:
            # Un admin peut supprimer n'importe quel utilisateur
            if not user_id:
                return Response({"message": "user_id manquant dans l'URL"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Un utilisateur non-admin ne peut supprimer que son propre compte
            if request.user.id != user_id:
                return Response(
                    {"message": "Vous ne pouvez supprimer que votre propre compte."},
                    status=status.HTTP_403_FORBIDDEN
                )

        # Supprimer l'utilisateur
        
        user_to_delete = User.objects.get(id=user_id)
        user_to_delete.delete()
        return Response({"message": "Utilisateur supprimé avec succès."}, status=status.HTTP_204_NO_CONTENT)

    except User.DoesNotExist:
        return Response({"message": "Utilisateur non trouvé."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def whoami(request):
    try:
        user = request.user
        serializer = TokenSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except UserProfile.DoesNotExist:
        return Response({"error": "Profil utilisateur non trouvé."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@swagger_auto_schema(method='put', request_body=PutUserSerializer)
@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def user_update(request):
    try:
        user = request.user  # Utilisateur à mettre à jour
        serializer = PutUserSerializer(user, data=request.data, partial=True)

        # Valider les données
        if serializer.is_valid():
            updated = False
            modified_fields = []

            # Mettre à jour les champs fournis dans validated_data
            for field, value in serializer.validated_data.items():
                if getattr(user, field) != value:
                    setattr(user, field, value)
                    modified_fields.append(field)
                    updated = True

            # Si aucun champ n'a été modifié, retourner une réponse appropriée
            if not updated:
                return Response({'message': 'Aucune modification détectée.'}, status=status.HTTP_400_BAD_REQUEST)

            # Sauvegarder les modifications
            user.save()

            # Créer une réponse avec les champs modifiés
            response_data = {'id': user.id}
            for field in modified_fields:
                response_data[field] = getattr(user, field)

            return Response(response_data, status=status.HTTP_200_OK)

        # Si le serializer est invalide
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        # Enregistrer l'exception pour faciliter le debug
        print(f"Erreur lors de la mise à jour de l'utilisateur : {str(e)}")
        return Response({'error': 'Erreur interne du serveur'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Modification de mot de passe

@swagger_auto_schema(method='put', request_body=ChangePasswordSerializer)
@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    serializer = ChangePasswordSerializer(data=request.data)

    if serializer.is_valid():
        current_password = serializer.validated_data['current_password']
        new_password = serializer.validated_data['new_password']
        # Vérifie si le mot de passe actuel est correct
        if not user.check_password(current_password):
            return Response(
                {"error": "L'authentification a échoué. Vérifiez vos informations d'identification."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Si le mot de passe actuel est correct, changer pour le nouveau mot de passe
        user.set_password(new_password)
        user.save()
        
        return Response({"message": "Mot de passe modifié avec succès."}, status=status.HTTP_200_OK)
    
    # Renvoie les erreurs de validation du serializer
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_users(request):
    User = get_user_model()

    if request.user.is_superuser:
        users = User.objects.all()

        # Créez une instance de la classe de pagination avec le nombre d'éléments par page spécifié
        paginator = PageNumberPagination()
        paginator.page_size = 100

        # Paginez les utilisateurs
        result_page = paginator.paginate_queryset(users, request)

        # Sérialisez la page de résultats
        serialized_users = UserDtoSerializer(result_page, many=True).data

        # Renvoyez la page de résultats paginée
        return paginator.get_paginated_response({"users": serialized_users})

    else:
        return Response({"error": "Accès non autorisé"}, status=status.HTTP_403_FORBIDDEN)


# Générer prompt GPT avec Swagger et utiliser le serializer pour le corps de la requête
@swagger_auto_schema(
    method='post',
    request_body=GeneratePromptSerializer,
    responses={
        200: "Plan généré avec succès.",
        400: "Requête invalide.",
        500: "Erreur interne du serveur."
    }
)
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def generate_prompt(request):
    if request.method == 'POST':
        try:
            # Récupérer les informations depuis la requête
            client_name = request.data.get('client_name')
            place = request.data.get('ville')
            days = request.data.get('days')
            trip_type = request.data.get('trip_type')
            start_date = request.data.get('start_date')
            budget = request.data.get('budget')

            # Préparer le prompt pour GPT
            content = f"""
            Sur la base de ce format précis, générez un plan pour un séjour {trip_type} de {days} jours à {place} à partir du {start_date} avec un budget de {budget} euros.
            La journée doit être conséquente avec des activités du matin au soir, et les activités doivent être géographiquement et météorologiquement cohérentes.
            Répondez uniquement avec un JSON structuré.
            """

            openai.api_key = os.getenv("OPENAI_API_KEY")

            # Modifier l'exemple de format pour utiliser le format de date YYYY-MM-DD
            response = openai.ChatCompletion.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "Je souhaite générer un plan de voyage pour mes utilisateurs. Il est essentiel que vous respectiez exactement le format JSON ci-dessous pour la réponse. Les dates doivent être au format YYYY-MM-DD."
                    },
                    {
                        "role": "system",
                        "content": '''{
                            "itinerary": [
                                {
                                    "day": 1,
                                    "date": "2024-11-10",
                                    "activities": [
                                        {
                                            "lieu": "Tour Eiffel",
                                            "type": "Visite",
                                            "budget": 25,
                                            "horaires": "10-12h"
                                        },
                                        {
                                            "lieu": "Musée du Louvre",
                                            "type": "Déjeuner",
                                            "budget": 45,
                                            "horaires": "12-14h"
                                        }
                                    ]
                                }
                            ]
                        }'''
                    },
                    {"role": "system", "content": content}
                ]
            )

            # Log de la réponse pour vérifier
            generated_text = response.choices[0].message.content.strip()
            print("Texte généré:", generated_text)

            # Nettoyer le texte généré pour enlever les balises Markdown
            generated_text = re.sub(r"```json|```", "", generated_text).strip()

            # Validation du JSON généré
            try:
                generated_plan = json.loads(generated_text)
            except json.JSONDecodeError as e:
                print(f"Erreur de décodage JSON : {str(e)}")
                return JsonResponse({"error": f"Le texte généré n'est pas un JSON valide : {str(e)}"}, status=500)

            # Vérification de la structure attendue
            if 'itinerary' not in generated_plan:
                return JsonResponse({"error": "Le JSON ne contient pas de 'itinerary'"}, status=500)

            # Convertir start_date en timezone-aware
            naive_start_date = datetime.strptime(start_date, '%Y-%m-%d')
            aware_start_date = make_aware(naive_start_date, timezone=pytz.timezone('Europe/Paris'))

            # Créer un nouvel Itinerary dans la base de données
            itinerary = Itinerary.objects.create(
                user=request.user,
                client_name=client_name,
                place=place,
                days=days,
                trip_type=trip_type,
                start_date=aware_start_date,
                budget=budget
            )

            # Enregistrer chaque jour et chaque activité
            for day in generated_plan['itinerary']:
                day_number = day.get('day')
                try:
                    # Parser la date au format YYYY-MM-DD
                    day_date = datetime.strptime(day.get('date'), '%Y-%m-%d')
                except ValueError as e:
                    print(f"Erreur de format de date: {str(e)}")
                    # Tentative de correction si la date est au format DD/MM/YYYY
                    try:
                        day_date = datetime.strptime(day.get('date'), '%d/%m/%Y')
                    except ValueError:
                        return JsonResponse({"error": f"Format de date invalide pour le jour {day_number}"}, status=500)

                day_obj = Day.objects.create(itinerary=itinerary, date=day_date, day_number=day_number)

                for activity in day.get('activities', []):
                    Activity.objects.create(
                        day=day_obj,
                        lieu=activity.get('lieu', ''),
                        type=activity.get('type', ''),
                        budget=activity.get('budget', 0),
                        horaires=activity.get('horaires', '')
                    )

            return JsonResponse({"generated_text": generated_text}, status=201)

        except Exception as e:
            print(f"Une erreur s'est produite : {str(e)}")
            return JsonResponse({"error": f"Une erreur s'est produite : {str(e)}"}, status=500)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated, IsPro])  # Ajouter la permission personnalisée ici
def get_dashboard(request):
    """
    Renvoie le nombre d'itinéraires générés par l'utilisateur connecté pour chaque mois de l'année en cours,
    le nombre total d'itinéraires pour l'année, ainsi que les statistiques du mois en cours.
    """
    try:
        user = request.user
        current_year = datetime.now().year
        current_month = datetime.now().month

        # Itinéraires par mois pour l'année en cours
        itineraries_by_month = (
            Itinerary.objects.filter(user=user, created_at__year=current_year)
            .annotate(month=ExtractMonth('created_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

        # Préparer les données pour chaque mois (1 à 12) avec une valeur par défaut de 0
        monthly_data = {month: 0 for month in range(1, 13)}
        for entry in itineraries_by_month:
            monthly_data[entry['month']] = entry['count']

        unique_clients_count = Itinerary.objects.values('client_name').distinct().count()

        # Total des itinéraires pour l'année en cours
        total_itineraries_year = sum(monthly_data.values())

        # Statistiques du mois en cours
        current_month_itineraries = monthly_data[current_month]

        return Response({
            "itineraries_by_month": monthly_data,
            "total_itineraries_year": total_itineraries_year,
            "current_month_itineraries": current_month_itineraries,
            "unique_clients": unique_clients_count
        }, status=200)

    except Exception as e:
        return Response({"error": f"Une erreur s'est produite : {str(e)}"}, status=500)




@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_itineraries(request):
    """
    Renvoie la liste des itinéraires générés par l'utilisateur connecté sans les détails des activités.
    """
    try:
        user = request.user
        itineraries = Itinerary.objects.filter(user=user).order_by('-created_at')
        serializer = ItineraryBasicSerializer(itineraries, many=True)
        return Response(serializer.data, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)





    
# views.py

from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .serializers import ChangePasswordSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

# views.py

@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def share_itinerary(request):
    """
    Endpoint to share an itinerary to the feed.
    """
    user = request.user
    itinerary_id = request.data.get('itinerary_id')
    text = request.data.get('text', '')

    try:
        itinerary = Itinerary.objects.get(id=itinerary_id, user=user)
        post = Post.objects.create(user=user, itinerary=itinerary, text=text)
        return Response({"message": "Itinerary shared successfully."}, status=status.HTTP_201_CREATED)
    except Itinerary.DoesNotExist:
        return Response({"error": "Itinerary not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from .models import Post
from .serializers import PostSerializer
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_feed(request):
    posts = Post.objects.all().order_by('-created_at')
    serializer = PostSerializer(posts, many=True, context={'request': request})  # Ajouter le contexte
    return Response(serializer.data)

@api_view(['POST'])
@authentication_classes([JWTAuthentication]) 
@permission_classes([IsAuthenticated])
def like_post(request):
    user = request.user
    post_id = request.data.get('post_id')

    try:
        post = Post.objects.get(id=post_id)
        if user in post.likes.all():
            post.likes.remove(user)
            message = "Post unliked."
        else:
            post.likes.add(user)
            message = "Post liked."
            
        # Sérialiser le post mis à jour
        serializer = PostSerializer(post, context={'request': request})
        return Response({
            "message": message,
            "post": serializer.data
        }, status=status.HTTP_200_OK)
    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
from datetime import datetime, timedelta
from django.db.models import Count

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_daily_itineraries(request):
    today = datetime.today()
    start_date = today.replace(day=1)
    end_date = (start_date + timedelta(days=32)).replace(day=1) - timedelta(days=1)

    itineraries = Post.objects.filter(created_at__range=[start_date, end_date])
    daily_itineraries = itineraries.extra(select={'day': 'date(created_at)'}).values('day').annotate(count=Count('id')).order_by('day')

    data = {day['day'].day: day['count'] for day in daily_itineraries}
    return Response(data)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_itinerary_detail(request, itinerary_id):
    try:
        # Rechercher d'abord dans le feed pour les itinéraires partagés
        shared_post = Post.objects.filter(itinerary_id=itinerary_id).first()
        
        if shared_post:
            # Si l'itinéraire est partagé, n'importe quel utilisateur peut le voir
            itinerary = Itinerary.objects.get(id=itinerary_id)
        else:
            # Sinon, vérifier que l'utilisateur est le propriétaire
            itinerary = Itinerary.objects.get(id=itinerary_id, user=request.user)
        
        serializer = ItinerarySerializer(itinerary)
        return Response(serializer.data, status=200)
        
    except Itinerary.DoesNotExist:
        return JsonResponse({"error": "Itinéraire non trouvé"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)