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
        self.user4 = User.objects.create_user(username='user4', password='password4')
        self.user5 = User.objects.create_user(username='user5', password='password5')
        self.duo_list_url = reverse('duo-list')
        self.create_duo_url = reverse('create-duo')
        self.confirm_duo_url = reverse('confirm-duo')
        self.delete_duo_url = reverse('delete-duo')
        self.login_url = reverse('login')
        
        # Login as user1
        self.authenticate(self.user1)

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def test_create_duo_valid(self):
        data = {
            'user2_username': 'user2'
        }
        response = self.client.post(self.create_duo_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Duo.objects.count(), 1)
        self.assertEqual(Duo.objects.get().user1, self.user1)
        self.assertEqual(Duo.objects.get().user2, self.user2)

    def test_create_duo_with_same_user(self):
        data = {
            'user2_username': 'user1'
        }
        response = self.client.post(self.create_duo_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Duo.objects.count(), 0)

    def test_create_duo_with_confirmed_duo(self):
        Duo.objects.create(user1=self.user1, user2=self.user2, is_confirmed=True)
        data = {
            'user2_username': 'user3'
        }
        response = self.client.post(self.create_duo_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Duo.objects.count(), 1)

    def test_create_duo_between_same_users(self):
        Duo.objects.create(user1=self.user1, user2=self.user2)
        data = {
            'user2_username': 'user2'
        }
        response = self.client.post(self.create_duo_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Duo.objects.count(), 1)

    def test_confirm_duo_valid(self):
        # Create a duo first
        Duo.objects.create(user1=self.user1, user2=self.user2, is_confirmed=False)
        self.assertEqual(Duo.objects.filter(user1=self.user1, user2=self.user2).count(), 1)
        self.client.logout()
        
        # Login as user2
        self.authenticate(self.user2)
        
        data = {
            'user1_username': 'user1'
        }
        response = self.client.put(self.confirm_duo_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Duo.objects.filter(user1=self.user1, user2=self.user2).count(), 1)
        duo = Duo.objects.get(user1=self.user1, user2=self.user2)
        self.assertTrue(duo.is_confirmed)
        self.assertIsNotNone(duo.confirmed_at)
        self.assertAlmostEqual(duo.confirmed_at, timezone.now(), delta=timezone.timedelta(seconds=1))

    def test_confirm_duo_not_found(self):
        data = {
            'user1_username': 'user3'
        }
        response = self.client.put(self.confirm_duo_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_confirm_duo_user1_not_provided(self):
        data = {}
        response = self.client.put(self.confirm_duo_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_confirm_duo_user1_does_not_exist(self):
        data = {
            'user1_username': 'nonexistentuser'
        }
        response = self.client.put(self.confirm_duo_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_confirm_duo_with_existing_confirmed_duo(self):
        Duo.objects.create(user1=self.user1, user2=self.user2, is_confirmed=True, confirmed_at=timezone.now())
        Duo.objects.create(user1=self.user3, user2=self.user1, is_confirmed=False)
        data1 = {
            'user1_username': 'user3'
        }
        response = self.client.put(self.confirm_duo_url, data1, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Duo.objects.get(user1=self.user3, user2=self.user1).is_confirmed)
        Duo.objects.get(user1=self.user1, user2=self.user2).delete()
        Duo.objects.create(user1=self.user3, user2=self.user4, is_confirmed=True, confirmed_at=timezone.now())
        data2 = {
            'user1_username': 'user3'
        }
        response = self.client.put(self.confirm_duo_url, data2, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Duo.objects.get(user1=self.user3, user2=self.user1).is_confirmed)

    def test_delete_duo_valid(self):
        # Create a duo first
        Duo.objects.create(user1=self.user1, user2=self.user2)
        
        data = {
            'with_user_name': 'user2'
        }
        response = self.client.delete(self.delete_duo_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Duo.objects.count(), 0)

    def test_delete_duo_not_found(self):
        data = {
            'with_user_name': 'user2'
        }
        response = self.client.delete(self.delete_duo_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_duo_other_user_not_provided(self):
        data = {}
        response = self.client.delete(self.delete_duo_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_duo_other_user_does_not_exist(self):
        data = {
            'with_user_name': 'nonexistentuser'
        }
        response = self.client.delete(self.delete_duo_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_duo_info(self):
        self.duo1 = Duo.objects.create(user1=self.user1, user2=self.user2, is_confirmed=True)
        self.duo2 = Duo.objects.create(user1=self.user1, user2=self.user3)
        self.duo3 = Duo.objects.create(user1=self.user1, user2=self.user4)
        self.duo4 = Duo.objects.create(user1=self.user3, user2=self.user4, is_confirmed=True, confirmed_at=timezone.now())
        self.duo5 = Duo.objects.create(user1=self.user1, user2=self.user5)
        response = self.client.get(self.duo_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['myDuo']), 1)
        self.assertEqual(len(response.data['requestsSent']), 1)
        self.assertEqual(len(response.data['requestsReceived']), 0)