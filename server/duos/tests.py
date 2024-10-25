from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse
from .models import Duo
from django.utils import timezone

User = get_user_model()

class DuoViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username='user1', password='password1')
        self.user2 = User.objects.create_user(username='user2', password='password2')
        self.user3 = User.objects.create_user(username='user3', password='password3')
        self.duo_list_url = reverse('get-duo')
        self.create_duo_url = reverse('create-duo')
        self.delete_duo_url = reverse('delete-duo')
        self.login_url = reverse('login')
        
        # Login as user1
        self.authenticate(self.user1)

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def test_create_duo_valid(self):
        data = {
            'invitation_token': self.user2.invitation_token
        }
        response = self.client.post(self.create_duo_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Duo.objects.count(), 1)
        self.assertEqual(response.data['user1'], 'user1')
        self.assertEqual(response.data['user2'], 'user2')

    def test_create_duo_invalid_invitation_token(self):
        data = {
            'invitation_token': 'invalidtoken'
        }
        response = self.client.post(self.create_duo_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Duo.objects.count(), 0)
    
    def test_create_duo_with_self(self):
        data = {
            'invitation_token': self.user1.invitation_token
        }
        response = self.client.post(self.create_duo_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Duo.objects.count(), 0)

    def test_create_duo_with_existing_duo_self(self):
        Duo.objects.create(user1=self.user1, user2=self.user3)
        data = {
            'invitation_token': self.user2.invitation_token
        }
        response = self.client.post(self.create_duo_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Duo.objects.count(), 1)

    def test_create_duo_with_existing_duo_other(self):
        Duo.objects.create(user1=self.user3, user2=self.user2)
        data = {
            'invitation_token': self.user2.invitation_token
        }
        response = self.client.post(self.create_duo_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Duo.objects.count(), 1)

    def test_get_duo_valid(self):
        Duo.objects.create(user1=self.user1, user2=self.user2)
        response = self.client.get(self.duo_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user1'], 'user1')
        self.assertEqual(response.data['user2'], 'user2')
    
    def test_get_duo_not_found(self):
        response = self.client.get(self.duo_list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_duo_valid(self):
        token_1_before = self.user1.invitation_token
        token_2_before = self.user2.invitation_token
        Duo.objects.create(user1=self.user1, user2=self.user2)
        response = self.client.delete(self.delete_duo_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Duo.objects.count(), 0)
        self.user1.refresh_from_db()
        self.user2.refresh_from_db()
        self.assertNotEqual(self.user1.invitation_token, token_1_before)
        self.assertNotEqual(self.user2.invitation_token, token_2_before)

    def test_delete_duo_not_found(self):
        response = self.client.delete(self.delete_duo_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Duo.objects.count(), 0)
        