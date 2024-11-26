from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from rest_framework.test import APITestCase


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

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse

class UserEndpointsTestCase(TestCase):
    def setUp(self):
        """Configuration initiale pour les tests"""
        self.client = APIClient()
        self.signup_url = reverse('signup')  # URL pour l'inscription
        self.admin_user = get_user_model().objects.create_superuser(
            username="adminuser",
            password="adminpassword",
            email="admin@test.com"
        )
        self.regular_user = get_user_model().objects.create_user(
            username="regularuser",
            password="regularpassword",
            email="regular@test.com"
        )

        # Utilisez un ID utilisateur existant pour deleteuser_url
        self.deleteuser_url = reverse('deleteuser', args=[self.regular_user.id])

    def test_deleteuser_as_admin(self):
        """Test pour suppression réussie d'un utilisateur en tant qu'admin"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.deleteuser_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_deleteuser_as_regular_user(self):
        another_user = User.objects.create_user(
            username='another_user',
            email='another@example.com',
            password='password123'
        )

        # Vérifiez l'URL
        delete_url = reverse('deleteuser', args=[another_user.id])
        # Authentifiez l'utilisateur
        self.client.force_authenticate(user=self.regular_user)
        # Effectuez la requête de suppression
        response = self.client.delete(delete_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(User.objects.filter(id=another_user.id).exists())

    def test_deleteuser_self(self):
        """Test pour suppression réussie de son propre compte"""
        self.client.force_authenticate(user=self.regular_user)
        self.deleteuser_url = reverse('deleteuser', args=[self.regular_user.id])
        response = self.client.delete(self.deleteuser_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_deleteuser_user_not_found(self):
        """Test pour suppression d'un utilisateur qui n'existe pas"""
        self.client.force_authenticate(user=self.admin_user)
        self.deleteuser_url = reverse('deleteuser', args=[9999])  # ID utilisateur inexistant
        response = self.client.delete(self.deleteuser_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

class UserUpdateAPITestCase(APITestCase):

    def setUp(self):
        # Créer un utilisateur pour les tests
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='password123'
        )
        # Générer un token JWT pour l'utilisateur
        refresh = RefreshToken.for_user(self.user)
        self.token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
        # URL de l'API pour la mise à jour de l'utilisateur
        self.url = reverse('user_update')  # Assurez-vous que le nom de l'URL est correct

    def test_update_user_successful(self):
        """
        Test la mise à jour réussie des informations de l'utilisateur.
        """
        data = {
            'email': 'newemail@example.com',
            'first_name': 'NouveauPrénom',
            'last_name': 'NouveauNom'
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'newemail@example.com')

    def test_update_user_unauthenticated(self):
        """
        Test que la mise à jour échoue si l'utilisateur n'est pas authentifié.
        """
        self.client.credentials()  # Supprimer les informations d'authentification
        data = {
            'email': 'unauthenticated@example.com'
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_user_invalid_data(self):
        """
        Test la mise à jour avec des données invalides.
        """
        data = {
            'email': 'email_invalide'  # Email invalide
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_update_user_no_changes(self):
        """
        Test la mise à jour sans aucune modification des données.
        """
        data = {
            'email': self.user.email,  # Même email
            'first_name': self.user.first_name,  # Même prénom
            'last_name': self.user.last_name  # Même nom
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'Aucune modification détectée.')



    def test_update_user_internal_server_error(self):
        """
        Test pour simuler une erreur interne du serveur.
        """
        with self.assertLogs(level='ERROR') as log:
            # Simuler une exception en modifiant temporairement la méthode save
            original_save = User.save
            def mock_save(*args, **kwargs):
                raise Exception('Erreur simulée')
            User.save = mock_save

            data = {
                'email': 'error@example.com'
            }
            response = self.client.put(self.url, data, format='json')
            self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
            self.assertEqual(response.data['error'], 'Erreur interne du serveur')

            # Restaurer la méthode originale
            User.save = original_save

