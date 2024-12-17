import datetime
from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from .models import Score
from duos.models import Duo
User = get_user_model()

class ScoreTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='password')
        self.user2 = User.objects.create_user(username='user2', password='password')
        self.duo = Duo.objects.create(user1=self.user1, user2=self.user2)
        self.retrieve_url = reverse('retrieve-score')
        self.update_url = reverse('update-score')
        
        self.score1 = Score.objects.create(user=self.user1, value=10, date=datetime.date(2023, 1, 1), uninterrupted_tracking=False)
        self.score2 = Score.objects.create(user=self.user1, value=20, date=datetime.date(2023, 1, 2), uninterrupted_tracking=False)
        self.score3 = Score.objects.create(user=self.user2, value=30, date=datetime.date(2023, 1, 1), uninterrupted_tracking=False)

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def test_retrieve_scores(self):
        self.authenticate(self.user1)
        response = self.client.get(self.retrieve_url, {'start_date': '2023-01-01', 'end_date': '2023-01-02'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['value'], 10)
        self.assertEqual(response.data[1]['value'], 20)

    def test_update_scores(self):
        self.authenticate(self.user1)
        scores_data = [
            {'date': '2023-01-01', 'value': 15, 'uninterrupted_tracking': False},
            {'date': '2023-01-03', 'value': 25, 'uninterrupted_tracking': True}
        ]
        response = self.client.post(self.update_url, scores_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['value'], 15)
        self.assertEqual(response.data[1]['value'], 25)

    def test_update_scores_not_part_of_confirmed_duo(self):
        self.authenticate(self.user1)
        self.duo.delete()
        scores_data = [
            {'date': '2023-01-01', 'value': 15}
        ]
        response = self.client.post(self.update_url, scores_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], 'User is not part of a confirmed duo')

    def test_update_scores_missing_scores_data(self):
        self.authenticate(self.user1)
        response = self.client.post(self.update_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Scores data is required')

    def test_update_scores_missing_date_or_value(self):
        self.authenticate(self.user1)
        scores_data = [
            {'date': '2023-01-01'},
            {'value': 25},
            {'date': '2023-01-03', 'value': 25},
        ]
        response = self.client.post(self.update_url, scores_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Date, uninterrupted_tracking and value are required for each score entry')

    def test_update_scores_invalid_date_format(self):
        self.authenticate(self.user1)
        scores_data = [
            {'date': 'invalid-date', 'value': 15, 'uninterrupted_tracking': False}
        ]
        response = self.client.post(self.update_url, scores_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Invalid date format for date: invalid-date')