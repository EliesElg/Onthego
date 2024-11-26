from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse

class LoginViewTestCase(TestCase):
    def setUp(self):
        """Configuration initiale pour les tests"""
        self.client = APIClient()
        self.login_url = reverse('login')  # Assurez-vous que l'URL 'login' est correctement définie dans vos urls.py
        self.username = "testuser"
        self.password = "testpassword"
        # Création d'un utilisateur pour les tests
        self.user = User.objects.create_user(username=self.username, password=self.password)

    def test_login_success(self):
        """Test de connexion réussie"""
        data = {
            "username": self.username,
            "password": self.password
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access_token", response.data)
        self.assertIn("user_id", response.data)

    def test_login_invalid_credentials(self):
        """Test de connexion avec des informations d'identification incorrectes"""
        data = {
            "username": self.username,
            "password": "wrongpassword"
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['Error'], "No user found")

    def test_login_missing_fields(self):
        """Test de connexion avec des champs manquants"""
        data = {
            "username": self.username
            # Le champ 'password' est manquant
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_login_invalid_format(self):
        """Test de connexion avec un format de données non valide"""
        data = "invalid_data_format"
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_non_existent_user(self):
        """Test de connexion avec un utilisateur qui n'existe pas"""
        data = {
            "username": "nonexistentuser",
            "password": "somepassword"
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['Error'], "No user found")
