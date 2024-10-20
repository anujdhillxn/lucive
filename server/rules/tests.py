from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Rule
from duos.models import Duo
import json
User = get_user_model()

class RulesAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username='user1', password='password1')
        self.user2 = User.objects.create_user(username='user2', password='password2')
        self.user_without_duo = User.objects.create_user(username='userwithoutduo', password='testpassword')
        self.duo = Duo.objects.create(user1=self.user1, user2=self.user2, is_confirmed=True)
        self.rule1 = Rule.objects.create(user=self.user2, app='TestApp', ruletype='TestType', rule_details=json.dumps({'key': 'value'}), is_active=True, change_allowed=True)
        self.rule2 = Rule.objects.create(user=self.user1, app='TestApp', ruletype='TestType', rule_details=json.dumps({'key': 'value'}), is_active=True, change_allowed=True)

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def test_get_user_rules(self):
        self.authenticate(self.user2)
        response = self.client.get('/api/rules/user-rules/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['app'], 'TestApp')
        self.assertEqual(response.data[0]['ruleType'], 'TestType')

    def test_get_user_rules_no_duo(self):
        self.authenticate(self.user_without_duo)
        response = self.client.get('/api/rules/user-rules/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], 'User is not part of a confirmed duo')

    def test_update_rule(self):
        self.authenticate(self.user1)
        data = {
            'app': 'TestApp',
            'ruletype': 'TestType',
            'rule_details': json.dumps({'key': 'updatedValue'}),
            'is_active': False
        }
        response = self.client.put('/api/rules/update-rule', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.rule1.refresh_from_db()
        self.assertEqual(self.rule1.rule_details, json.dumps({'key': 'updatedValue'}))
        self.assertEqual(self.rule1.is_active, False)
        self.assertEqual(self.rule1.change_allowed, False)

    def test_update_rule_when_change_not_allowed(self):
        self.rule1.change_allowed = False
        self.rule1.save()
        self.authenticate(self.user1)
        data = {
            'app': 'TestApp',
            'ruletype': 'TestType',
            'rule_details': 'Updated details',
            'is_active': False
        }
        response = self.client.put('/api/rules/update-rule', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_rule_no_confirmed_duo(self):
        self.duo.is_confirmed = False
        self.duo.save()
        self.authenticate(self.user1)
        data = {
            'app': 'TestApp',
            'ruletype': 'TestType',
            'rule_details': 'Updated details'
        }
        response = self.client.put('/api/rules/update-rule', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_rule_not_found(self):
        self.authenticate(self.user1)
        data = {
            'app': 'NonExistentApp',
            'ruletype': 'NonExistentType',
            'rule_details': 'Updated details'
        }
        response = self.client.put('/api/rules/update-rule', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_rule(self):
        self.authenticate(self.user1)
        data = {
            'app': 'TestApp',
            'ruletype': 'TestType2',
            'rule_details': json.dumps({'key': 'value'}),
            'is_active': True
        }
        response = self.client.post('/api/rules/create-rule', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['app'], 'TestApp')
        self.assertEqual(response.data['ruletype'], 'TestType2')
        self.assertEqual(response.data['rule_details'], json.dumps({'key': 'value'}))
        self.assertEqual(response.data['is_active'], True)
        self.assertTrue(Rule.objects.filter(user=self.user1, app='TestApp', ruletype='TestType').exists())

    def test_create_rule_without_confirmed_duo(self):
        self.authenticate(self.user_without_duo)
        data = {
            'app': 'TestApp',
            'ruletype': 'TestType',
            'rule_details': 'Test details',
            'is_active': True
        }
        response = self.client.post('/api/rules/create-rule', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('No confirmed duo found.', response.data['non_field_errors'])

    def test_create_duplicate_rule(self):
        self.authenticate(self.user2)
        data = {
            'app': 'TestApp',
            'ruletype': 'TestType',
            'rule_details': 'Duplicate rule details',
            'is_active': True,
            'change_allowed': False
        }
        response = self.client.post('/api/rules/create-rule', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)

    def test_allow_change_to_rule(self):
        self.authenticate(self.user1)
        data = {
            'app': 'TestApp',
            'ruletype': 'TestType'
        }
        response = self.client.put('/api/rules/allow-change-to-rule', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.rule2.refresh_from_db()
        self.assertFalse(self.rule2.change_allowed)

    def test_allow_change_to_rule_no_confirmed_duo(self):
        self.duo.is_confirmed = False
        self.duo.save()
        self.authenticate(self.user1)
        data = {
            'app': 'TestApp',
            'ruletype': 'TestType'
        }
        response = self.client.put('/api/rules/allow-change-to-rule', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_allow_change_to_rule_not_found(self):
        self.authenticate(self.user1)
        data = {
            'app': 'NonExistentApp',
            'ruletype': 'NonExistentType'
        }
        response = self.client.put('/api/rules/allow-change-to-rule', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_rule(self):
        self.authenticate(self.user1)
        data = {
            'app': 'TestApp',
            'ruletype': 'TestType'
        }
        response = self.client.delete('/api/rules/delete-rule', data)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Rule.objects.filter(user=self.user2, app='TestApp', ruletype='TestType').exists())

    def test_delete_rule_not_found(self):
        self.authenticate(self.user1)
        data = {
            'app': 'NonExistentApp',
            'ruletype': 'NonExistentType'
        }
        response = self.client.delete('/api/rules/delete-rule', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)

    def test_delete_rule_no_confirmed_duo(self):
        self.duo.is_confirmed = False
        self.duo.save()
        self.authenticate(self.user1)
        data = {
            'app': 'TestApp',
            'ruletype': 'TestType'
        }
        response = self.client.delete('/api/rules/delete-rule', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('No confirmed duo found.', response.data['non_field_errors'])