from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from unittest.mock import patch
from django.contrib.auth import get_user_model
User = get_user_model()
class UserTests(APITestCase):

    def setUp(self):
        # Create a user for testing
        self.test_user = User.objects.create_user(
            username='testuser',
            email='testuser@gmail.com',
            password='password123'
        )
        self.login_url = reverse('login')
        self.register_url = reverse('register')
        self.user_info_url = reverse('user-info')
        self.logout_url = reverse('logout')
        self.google_register_url = reverse('google-register')
        self.access_token = 'mock_access_token'

    def test_register_user(self):
        """
        Test user registration.
        """
        data = {
            'username': 'new.user_123',
            'email': 'newuser@example.com',
            'password': 'password123'
        }
        
        # Before registration, check that there's only 1 user (the test_user)
        self.assertEqual(User.objects.count(), 1)  

        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # After registration, check that there are 2 users
        self.assertEqual(User.objects.count(), 2)  # 1 existing + 1 new user

    def test_register_user_with_invalid_username(self):
        """
        Test registration with an invalid username.
        """
        data = {
            'username': 'new user',  # Invalid username
            'email': 'newuser@example.com',
            'password': 'password123'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_user_with_invalid_password(self):
        """
        Test registration with an invalid password.
        """
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'pass'  # Invalid
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_user_invalid_email(self):
        """
        Test user registration with invalid email.
        """
        data = {
            'username': 'validusername',
            'email': 'invalid-email',
            'password': 'password123'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
        self.assertEqual(response.data['email'][0], "Enter a valid email address.")

    def test_login_user_with_username(self):
        """
        Test user login.
        """
        data = {
            'identifier': 'testuser',
            'password': 'password123'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)  # Ensure token is returned

    def test_login_user_with_email(self):
        """
        Test user login.
        """
        data = {
            'identifier': 'testuser@gmail.com',
            'password': 'password123'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)  # Ensure token is returned

    def test_get_user_info(self):
        """
        Test getting user info (requires authentication).
        """
        # First, log in to get the token
        login_data = {
            'identifier': 'testuser',
            'password': 'password123'
        }
        login_response = self.client.post(self.login_url, login_data)
        token = login_response.data['token']

        # Set the token in the authorization header
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        response = self.client.get(self.user_info_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')

    def test_update_user_info(self):
        """
        Test updating user info (requires authentication).
        """
        # First, log in to get the token
        login_data = {
            'identifier': 'testuser',
            'password': 'password123'
        }
        login_response = self.client.post(self.login_url, login_data)
        token = login_response.data['token']

        # Set the token in the authorization header
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        
        # Update user info
        
        update_data = {
            'username': 'updateduser',
            'email': 'updateduser@example.com'
        }
        response = self.client.put(self.user_info_url, update_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'updateduser')

    def test_login_invalid_username(self):
        """
        Test login with invalid username.
        """
        data = {
            'identifier': 'invaliduser',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_invalid_email(self):
        """
        Test login with invalid email.
        """
        data = {
            'identifier': 'invaliduser@gmail.com',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_login_invalid_password(self):
        """
        Test login with invalid password.
        """
        data = {
            'identifier': 'testuser',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_invalid_email(self):
        """
        Test registration with an invalid email.
        """
        data = {
            'username': 'newuser',
            'email': 'invalidemail',  # Invalid email
            'password': 'password123'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_user(self):
        """
        Test user logout.
        """
        # First, log in to get the token
        login_data = {
            'identifier': 'testuser',
            'password': 'password123'
        }
        login_response = self.client.post(self.login_url, login_data)
        token = login_response.data['token']

        # Set the token in the authorization header
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        response = self.client.post(reverse('logout'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_register_existing_user(self):
        """
        Test registration with an existing username.
        """
        data = {
            'username': 'testuser',  # Attempting to register the existing user
            'email': 'testuser@example.com',
            'password': 'password123'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('requests.get')
    def test_google_oauth_register(self, mock_get):
        """
        Test Google OAuth registration.
        """
        # Mock the Google API response

        google_user_info = {
            'email': 'testusergoogle@gmail.com'
        }

        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = google_user_info

        # Send a POST request to the Google OAuth register endpoint
        response = self.client.post(self.google_register_url, data={'access_token': self.access_token}, format='json')

        # Check that the response status code is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check that the response contains a token
        self.assertIn('token', response.data)

        # Check that the user was created
        self.assertEqual(User.objects.count(), 2)  # 1 existing + 1 new user
        user = User.objects.get(email=google_user_info['email'])
        self.assertIsNotNone(user)
        self.assertTrue(user.username.startswith('USER'))

    @patch('requests.get')
    def test_google_oauth_login(self, mock_get):
        """
        Test Google OAuth registration.
        """
        # Mock the Google API response

        google_user_info = {
            'email': 'testuser@gmail.com'
        }

        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = google_user_info

        # Send a POST request to the Google OAuth register endpoint
        response = self.client.post(self.google_register_url, data={'access_token': self.access_token}, format='json')

        # Check that the response status code is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check that the response contains a token
        self.assertIn('token', response.data)

        # Check that the testuser was not created again
        self.assertEqual(User.objects.count(), 1)  # 1 existing
        user = User.objects.get(email=google_user_info['email'])
        self.assertIsNotNone(user)
        self.assertTrue(user.username == 'testuser')

    @patch('requests.get')
    def test_google_oauth_register_invalid_token(self, mock_get):
        """
        Test Google OAuth registration with an invalid token.
        """
        # Mock the Google API response for an invalid token
        mock_get.return_value.status_code = 400

        # Send a POST request to the Google OAuth register endpoint with an invalid token
        response = self.client.post(self.google_register_url, data={'access_token': 'invalid_token'}, format='json')

        # Check that the response status code is 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Check that the response contains an error message
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Invalid token')

    def test_change_username(self):
        """
        Test changing the username.
        """
        # First, log in to get the token
        login_data = {
            'identifier': 'testuser',
            'password': 'password123'
        }
        login_response = self.client.post(self.login_url, login_data)
        token = login_response.data['token']

        # Set the token in the authorization header
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)

        # Change the username
        change_username_data = {
            'new_username': 'newusername'
        }
        response = self.client.put(reverse('change-username'), change_username_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.get(username='newusername').username, 'newusername')
        self.assertEqual(response.data['username'], 'newusername')

    def test_change_username_to_existing_username(self):
        """
        Test changing the username to an existing username.
        """
        # First, log in to get the token
        login_data = {
            'identifier': 'testuser',
            'password': 'password123'
        }
        login_response = self.client.post(self.login_url, login_data)
        token = login_response.data['token']

        # Set the token in the authorization header
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)

        # Change the username to an existing username
        change_username_data = {
            'new_username': 'testuser'
        }
        response = self.client.put(reverse('change-username'), change_username_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_username_to_invalid_username(self):
        """
        Test changing the username to an invalid username.
        """
        # First, log in to get the token
        login_data = {
            'identifier': 'testuser',
            'password': 'password123'
        }
        login_response = self.client.post(self.login_url, login_data)
        token = login_response.data['token']

        # Set the token in the authorization header
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)

        # Change the username to an invalid username
        change_username_data = {
            'new_username': 'invalid username'
        }
        response = self.client.put(reverse('change-username'), change_username_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)