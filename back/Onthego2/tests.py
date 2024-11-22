from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.models import User
from .views import login # Assurez-vous que le chemin d'importation est correct

class LoginTestCase(APITestCase):
    def setUp(self):
        # Créez ici un utilisateur pour tester l'authentification
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.client = APIClient()

    def test_login_success(self):
        # Test de connexion avec des données valides
        url = reverse('login') # Assurez-vous que 'login' est le nom correct de votre vue dans urls.py
        data = {'username': 'testuser', 'password': '12345'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.data)

    def test_login_failure(self):
        # Test de connexion avec des données invalides
        url = reverse('login')
        data = {'username': 'wrong', 'password': 'user'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)