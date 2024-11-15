from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from .models import Word

User = get_user_model()

class WordTests(APITestCase):

    def setUp(self):
        self.client = APIClient()
        self.add_words_url = reverse('word-add-words')
        self.random_words_url = reverse('word-random-words')
        self.superuser = User.objects.create_superuser('admin', 'admin@example.com', 'password')
        self.user = User.objects.create_user('user', 'user@example.com', 'password')
        self.client.force_authenticate(user=self.user)

    def test_retrieve_random_words(self):
        Word.objects.create(word="example1", meaning="meaning1", usage="usage1", difficulty=1)
        Word.objects.create(word="example2", meaning="meaning2", usage="usage2", difficulty=2)
        response = self.client.get(self.random_words_url, {'n': 1})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_random_words_with_no_words(self):
        response = self.client.get(self.random_words_url, {'n': 1})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)