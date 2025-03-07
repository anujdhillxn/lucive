import datetime
from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from .models import Rule, RuleModificationRequest
from duos.models import Duo

User = get_user_model()

class RuleTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='password')
        self.user2 = User.objects.create_user(username='user2', password='password')
        self.user_without_duo = User.objects.create_user(username='user_without_duo', password='password')
        self.get_url = reverse('user-rules')
        self.duo = Duo.objects.create(user1=self.user1, user2=self.user2)
        
        self.rule1 = Rule.objects.create(app='TestApp', is_active=False, user=self.user1, daily_max_seconds=3600, hourly_max_seconds=600, session_max_seconds=300, daily_reset='00:00:00', intervention_type='FULL', app_display_name='Test App', is_daily_max_seconds_enforced=True, is_hourly_max_seconds_enforced=False, is_session_max_seconds_enforced=True, is_startup_delay_enabled=True)
        self.rule2 = Rule.objects.create(app='TestApp2', is_active=True, user=self.user2, daily_max_seconds=3600, hourly_max_seconds=600, session_max_seconds=300, daily_reset='00:00:00', intervention_type='PARTIAL', app_display_name='Test App 2', is_daily_max_seconds_enforced=False, is_hourly_max_seconds_enforced=False, is_session_max_seconds_enforced=False)
        
        self.mod_request1 = RuleModificationRequest.objects.create(app='TestApp2', is_active=False, user=self.user1, daily_max_seconds=1800, hourly_max_seconds=300, session_max_seconds=150, daily_reset='00:00:00', intervention_type='PARTIAL', is_startup_delay_enabled=False)   
        self.mod_request2 = RuleModificationRequest.objects.create(app='TestApp3', is_active=True, user=self.user1, daily_max_seconds=7200, hourly_max_seconds=1200, session_max_seconds=600, daily_reset='00:00:00', intervention_type='PARTIAL')
    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def test_get_user_rules(self):
        self.authenticate(self.user2)
        self.mod_request1.app = 'TestApp'
        self.mod_request1.save()
        response = self.client.get(self.get_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        
        rule_data = response.data[0]
        self.assertEqual(rule_data['app'], 'TestApp')
        self.assertEqual(rule_data['appDisplayName'], 'Test App')
        self.assertEqual(rule_data['isActive'], False)
        self.assertEqual(rule_data['dailyMaxSeconds'], 3600)
        self.assertEqual(rule_data['hourlyMaxSeconds'], 600)
        self.assertEqual(rule_data['sessionMaxSeconds'], 300)
        self.assertEqual(rule_data['dailyReset'], '00:00:00')
        self.assertEqual(rule_data['interventionType'], 'FULL')
        self.assertEqual(rule_data['isMyRule'], False)
        self.assertEqual(rule_data['isDailyMaxSecondsEnforced'], True)
        self.assertEqual(rule_data['isHourlyMaxSecondsEnforced'], False)
        self.assertEqual(rule_data['isSessionMaxSecondsEnforced'], True)
        self.assertEqual(rule_data['isStartupDelayEnabled'], True)
        self.assertEqual('modificationData' in rule_data, True)
        self.assertEqual(rule_data['modificationData']['isActive'], False)

    def test_get_user_rules_no_duo(self):
        self.authenticate(self.user_without_duo)
        response = self.client.get(self.get_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], 'User is not part of a confirmed duo')

    def test_get_user_rules_no_authentication(self):
        response = self.client.get(self.get_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_create_rule(self):
        self.authenticate(self.user1)
        create_url = reverse('create-rule')
        data = {
            'app': 'NewApp',
            'app_display_name': 'New App',
            'is_active': True,
            'daily_max_seconds': 3600,
            'hourly_max_seconds': 600,
            'session_max_seconds': 300,
            'is_daily_max_seconds_enforced': True,
            'is_hourly_max_seconds_enforced': False,
            'is_session_max_seconds_enforced': True,
            'daily_reset': '00:00:00',
            'intervention_type': 'FULL',
            'is_startup_delay_enabled': True
        }
        response = self.client.post(create_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Rule.objects.filter(app='NewApp').exists(), True)
    
    def test_create_rule_no_duo(self):
        self.authenticate(self.user_without_duo)
        create_url = reverse('create-rule')
        data = {
            'app': 'NewApp',
            'is_active': True,
            'daily_max_seconds': 3600,
            'hourly_max_seconds': 600,
            'session_max_seconds': 300,
            'is_daily_max_seconds_enforced': True,
            'is_hourly_max_seconds_enforced': False,
            'is_session_max_seconds_enforced': True,
            'daily_reset': '00:00:00',
            'intervention_type': 'FULL',
            'is_startup_delay_enabled': True
        }
        response = self.client.post(create_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Rule.objects.filter(app='NewApp').exists(), False)
    
    def test_create_rule_no_authentication(self):
        create_url = reverse('create-rule')
        data = {
            'app': 'NewApp',
            'is_active': True,
            'daily_max_seconds': 3600,
            'hourly_max_seconds': 600,
            'session_max_seconds': 300,
            'is_daily_max_seconds_enforced': True,
            'is_hourly_max_seconds_enforced': False,
            'is_session_max_seconds_enforced': True,
            'daily_reset': '00:00:00',
            'intervention_type': 'FULL',
            'is_startup_delay_enabled': True
        }
        response = self.client.post(create_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Rule.objects.filter(app='NewApp').exists(), False)
    
    def test_create_rule_already_exists(self):
        self.authenticate(self.user1)
        create_url = reverse('create-rule')
        data = {
            'app': 'TestApp',
            'is_active': True,
            'daily_max_seconds': 3600,
            'hourly_max_seconds': 600,
            'session_max_seconds': 300,
            'is_daily_max_seconds_enforced': True,
            'is_hourly_max_seconds_enforced': False,
            'is_session_max_seconds_enforced': True,
            'daily_reset': '00:00:00',
            'intervention_type': 'FULL',
            'is_startup_delay_enabled': True
        }
        response = self.client.post(create_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_delete_rule(self):
        self.authenticate(self.user1)
        delete_url = reverse('delete-rule')
        data = {
            'app': 'TestApp'
        }
        response = self.client.delete(delete_url, data)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Rule.objects.filter(app='TestApp').exists(), False)

    def test_delete_rule_no_authentication(self):
        delete_url = reverse('delete-rule')
        data = {
            'app': 'TestApp'
        }
        response = self.client.delete(delete_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Rule.objects.filter(app='TestApp').exists(), True)

    def test_delete_rule_not_found(self):
        self.authenticate(self.user1)
        delete_url = reverse('delete-rule')
        data = {
            'app': 'NonExistentApp'
        }
        response = self.client.delete(delete_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Rule.objects.filter(app='NonExistentApp').exists(), False)
    
    def test_delete_rule_active(self):
        self.authenticate(self.user1)
        delete_url = reverse('delete-rule')
        data = {
            'app': 'TestApp2'
        }
        response = self.client.delete(delete_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Rule.objects.filter(app='TestApp2').exists(), True)

    def test_delete_rule_mod_request(self):
        self.authenticate(self.user1)
        Rule.objects.create(app='TestApp3', is_active=False, user=self.user1, daily_max_seconds=3600, hourly_max_seconds=600, session_max_seconds=300, daily_reset='00:00:00', intervention_type='FULL')
        delete_url = reverse('delete-rule')
        data = {
            'app': 'TestApp3'
        }
        response = self.client.delete(delete_url, data)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(RuleModificationRequest.objects.filter(app='TestApp3').exists(), False)
    
    def test_update_rule(self):
        self.authenticate(self.user1)
        update_url = reverse('update-rule')
        data = {
            'app': 'TestApp',
            'is_active': True,
            'daily_max_seconds': 1800,
            'hourly_max_seconds': 300,
            'session_max_seconds': 150,
            'is_daily_max_seconds_enforced': True,
            'is_hourly_max_seconds_enforced': True,
            'is_session_max_seconds_enforced': True,
            'daily_reset': '00:00:00',
            'intervention_type': 'FULL',
            'is_startup_delay_enabled': True
        }
        response = self.client.put(update_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Rule.objects.get(app='TestApp').daily_max_seconds, 1800)
        self.assertEqual(Rule.objects.get(app='TestApp').hourly_max_seconds, 300)
        self.assertEqual(Rule.objects.get(app='TestApp').intervention_type, 'FULL')
        self.assertEqual(Rule.objects.get(app='TestApp').is_daily_max_seconds_enforced, True)
        self.assertEqual(Rule.objects.get(app='TestApp').is_hourly_max_seconds_enforced, True)
        self.assertEqual(RuleModificationRequest.objects.filter(app='TestApp').exists(), False)

    def test_update_rule_no_authentication(self):
        update_url = reverse('update-rule')
        data = {
            'app': 'TestApp',
            'is_active': True,
            'daily_max_seconds': 1800,
            'hourly_max_seconds': 300,
            'session_max_seconds': 150,
            'is_daily_max_seconds_enforced': True,
            'is_hourly_max_seconds_enforced': False,
            'is_session_max_seconds_enforced': True,
            'daily_reset': '00:00:00',
            'intervention_type': 'PARTIAL',
            'is_startup_delay_enabled': True
        }
        response = self.client.put(update_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Rule.objects.get(app='TestApp').daily_max_seconds, 3600)
        self.assertEqual(Rule.objects.get(app='TestApp').hourly_max_seconds, 600)
        self.assertEqual(Rule.objects.get(app='TestApp').intervention_type, 'FULL')
    
    def test_update_rule_not_found(self):
        self.authenticate(self.user1)
        update_url = reverse('update-rule')
        data = {
            'app': 'NonExistentApp',
            'is_active': True,
            'daily_max_seconds': 1800,
            'hourly_max_seconds': 300,
            'session_max_seconds': 150,
            'is_daily_max_seconds_enforced': True,
            'is_hourly_max_seconds_enforced': False,
            'is_session_max_seconds_enforced': True,
            'daily_reset': '00:00:00',
            'intervention_type': 'PARTIAL',
            'is_startup_delay_enabled': True
        }
        response = self.client.put(update_url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_rule_increase_max_seconds(self):
        self.authenticate(self.user1)
        update_url = reverse('update-rule')
        data = {
            'app': 'TestApp',
            'is_active': True,
            'daily_max_seconds': 7200,
            'hourly_max_seconds': 1200,
            'session_max_seconds': 600,
            'is_daily_max_seconds_enforced': True,
            'is_hourly_max_seconds_enforced': False,
            'is_session_max_seconds_enforced': True,
            'daily_reset': '00:00:00',
            'intervention_type': 'PARTIAL'
        }
        response = self.client.put(update_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Rule.objects.get(app='TestApp').daily_max_seconds, 3600)
        self.assertEqual(Rule.objects.get(app='TestApp').hourly_max_seconds, 600)
        self.assertEqual(Rule.objects.get(app='TestApp').intervention_type, 'FULL')
        self.assertEqual(RuleModificationRequest.objects.filter(app='TestApp').exists(), True)
        self.assertEqual(RuleModificationRequest.objects.get(app='TestApp').daily_max_seconds, 7200)
        self.assertEqual(RuleModificationRequest.objects.get(app='TestApp').hourly_max_seconds, 1200)
    
    def test_update_rule_only_made_inactive(self):
        self.authenticate(self.user2)
        update_url = reverse('update-rule')
        data = {
            'app': 'TestApp2',
            'is_active': False,
            'daily_max_seconds': 3600,
            'hourly_max_seconds': 600,
            'session_max_seconds': 300,
            'is_daily_max_seconds_enforced': True,
            'is_hourly_max_seconds_enforced': False,
            'is_session_max_seconds_enforced': True,
            'daily_reset': '00:00:00',
            'intervention_type': 'FULL'
        }
        response = self.client.put(update_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Rule.objects.get(app='TestApp2').is_active, True)
        self.assertEqual(RuleModificationRequest.objects.filter(app='TestApp2').exists(), True)
        self.assertEqual(RuleModificationRequest.objects.get(user=self.user2, app='TestApp2').is_active, False)

    def test_update_rule_only_made_active(self):
        self.authenticate(self.user2)
        self.rule1.is_active = False
        self.rule1.save()
        update_url = reverse('update-rule')
        data = {
            'app': 'TestApp2',
            'is_active': True,
            'daily_max_seconds': 3600,
            'hourly_max_seconds': 600,
            'session_max_seconds': 300,
            'is_daily_max_seconds_enforced': True,
            'is_hourly_max_seconds_enforced': False,
            'is_session_max_seconds_enforced': True,
            'daily_reset': '00:00:00',
            'intervention_type': 'FULL'
        }
        response = self.client.put(update_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Rule.objects.get(app='TestApp2').is_active, True)
    
    def test_update_rule_no_changes(self):
        self.authenticate(self.user1)
        update_url = reverse('update-rule')
        data = {
            'app': 'TestApp',
            'is_active': False,
            'daily_max_seconds': 3600,
            'hourly_max_seconds': 600,
            'session_max_seconds': 300,
            'is_daily_max_seconds_enforced': True,
            'is_hourly_max_seconds_enforced': False,
            'is_session_max_seconds_enforced': True,
            'daily_reset': '00:00:00',
            'intervention_type': 'FULL',
            'is_startup_delay_enabled': True
        }
        response = self.client.put(update_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Rule.objects.get(app='TestApp').is_active, False)
        self.assertEqual(RuleModificationRequest.objects.filter(app='TestApp').exists(), False)

    def test_update_rule_intervention_relaxed(self):
        self.authenticate(self.user1)
        update_url = reverse('update-rule')
        data = {
            'app': 'TestApp',
            'is_active': True,
            'daily_max_seconds': 3600,
            'hourly_max_seconds': 600,
            'session_max_seconds': 300,
            'is_daily_max_seconds_enforced': True,
            'is_hourly_max_seconds_enforced': False,
            'is_session_max_seconds_enforced': True,
            'daily_reset': '00:00:00',
            'intervention_type': 'PARTIAL',
            'is_startup_delay_enabled': True
        }
        response = self.client.put(update_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Rule.objects.get(app='TestApp').intervention_type, 'FULL')
        self.assertEqual(RuleModificationRequest.objects.filter(app='TestApp').exists(), True)
        self.assertEqual(RuleModificationRequest.objects.get(app='TestApp').intervention_type, 'PARTIAL')

    def test_update_rule_daily_reset_modified(self):
        self.authenticate(self.user1)
        update_url = reverse('update-rule')
        data = {
            'app': 'TestApp',
            'is_active': True,
            'daily_max_seconds': 3600,
            'hourly_max_seconds': 600,
            'session_max_seconds': 300,
            'is_daily_max_seconds_enforced': True,
            'is_hourly_max_seconds_enforced': False,
            'is_session_max_seconds_enforced': True,
            'daily_reset': '12:00:00',
            'intervention_type': 'FULL',
            'is_startup_delay_enabled': True
        }
        response = self.client.put(update_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Rule.objects.get(app='TestApp').daily_reset, datetime.datetime.strptime('00:00:00', '%H:%M:%S').time())
        self.assertEqual(RuleModificationRequest.objects.filter(app='TestApp').exists(), True)
        self.assertEqual(RuleModificationRequest.objects.get(app='TestApp').daily_reset, datetime.datetime.strptime('12:00:00', '%H:%M:%S').time())

    def test_update_rule_max_seconds_removed(self):
        self.authenticate(self.user1)
        update_url = reverse('update-rule')
        data = {
            'app': 'TestApp',
            'is_active': True,
            'daily_reset': '00:00:00',
            'daily_max_seconds': 3600,
            'hourly_max_seconds': 600,
            'session_max_seconds': 300,
            'is_daily_max_seconds_enforced': False,
            'is_hourly_max_seconds_enforced': False,
            'is_session_max_seconds_enforced': False,
            'intervention_type': 'FULL',
            'is_startup_delay_enabled': True
        }
        response = self.client.put(update_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Rule.objects.get(app='TestApp').daily_max_seconds, 3600)
        self.assertEqual(Rule.objects.get(app='TestApp').hourly_max_seconds, 600)
        self.assertEqual(Rule.objects.get(app='TestApp').is_daily_max_seconds_enforced, True)
        self.assertEqual(Rule.objects.get(app='TestApp').is_hourly_max_seconds_enforced, False)
        self.assertEqual(Rule.objects.get(app='TestApp').is_session_max_seconds_enforced, True)
        self.assertEqual(RuleModificationRequest.objects.filter(app='TestApp').exists(), True)
        self.assertEqual(RuleModificationRequest.objects.get(app='TestApp').is_daily_max_seconds_enforced, False)
        self.assertEqual(RuleModificationRequest.objects.get(app='TestApp').is_hourly_max_seconds_enforced, False)
        self.assertEqual(RuleModificationRequest.objects.get(app='TestApp').is_session_max_seconds_enforced, False)

    def test_update_rule_only_startup_delay_disabled(self):
        self.authenticate(self.user1)
        update_url = reverse('update-rule')
        data = {
            'app': 'TestApp',
            'is_active': True,
            'daily_reset': '00:00:00',
            'daily_max_seconds': 3600,
            'hourly_max_seconds': 600,
            'session_max_seconds': 300,
            'is_daily_max_seconds_enforced': True,
            'is_hourly_max_seconds_enforced': False,
            'is_session_max_seconds_enforced': True,
            'intervention_type': 'FULL',
            'is_startup_delay_enabled': False
        }
        response = self.client.put(update_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Rule.objects.get(app='TestApp').is_startup_delay_enabled, True)
        self.assertEqual(RuleModificationRequest.objects.filter(app='TestApp').exists(), True)
        self.assertEqual(RuleModificationRequest.objects.get(app='TestApp').is_startup_delay_enabled, False)

    def test_update_rule_only_startup_delay_enabled(self):
        self.authenticate(self.user1)
        self.rule1.is_startup_delay_enabled = False
        self.rule1.save()
        update_url = reverse('update-rule')
        data = {
            'app': 'TestApp',
            'is_active': True,
            'daily_reset': '00:00:00',
            'daily_max_seconds': 3600,
            'hourly_max_seconds': 600,
            'session_max_seconds': 300,
            'is_daily_max_seconds_enforced': True,
            'is_hourly_max_seconds_enforced': False,
            'is_session_max_seconds_enforced': True,
            'intervention_type': 'FULL',
            'is_startup_delay_enabled': True
        }
        response = self.client.put(update_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Rule.objects.get(app='TestApp').is_startup_delay_enabled, True)
        self.assertEqual(RuleModificationRequest.objects.filter(app='TestApp').exists(), False)    
    
    def test_approve_rule_modification_request(self):
        self.authenticate(self.user2)
        self.rule1.app = 'TestApp2'
        self.rule1.save()
        approve_url = reverse('approve-rule-modification-request')
        data = {
            'app': 'TestApp2'
        }
        response = self.client.post(approve_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Rule.objects.get(app='TestApp2', user=self.user1).daily_max_seconds, 1800)
        self.assertEqual(Rule.objects.get(app='TestApp2',user=self.user1).hourly_max_seconds, 300)
        self.assertEqual(Rule.objects.get(app='TestApp2',user=self.user1).intervention_type, 'PARTIAL')
        self.assertEqual(RuleModificationRequest.objects.filter(app='TestApp2').exists(), False)

    def test_approve_rule_modification_request_no_authentication(self):
        self.authenticate(self.user1)
        approve_url = reverse('approve-rule-modification-request')
        data = {
            'app': 'TestApp2'
        }
        response = self.client.post(approve_url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(Rule.objects.get(app='TestApp2').daily_max_seconds, 3600)
        self.assertEqual(Rule.objects.get(app='TestApp2').hourly_max_seconds, 600)
        self.assertEqual(Rule.objects.get(app='TestApp2').intervention_type, 'PARTIAL')
    
    def test_approve_rule_modification_request_no_duo(self):
        self.authenticate(self.user_without_duo)
        approve_url = reverse('approve-rule-modification-request')
        data = {
            'app': 'TestApp2'
        }
        response = self.client.post(approve_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Rule.objects.get(app='TestApp2').daily_max_seconds, 3600)
        self.assertEqual(Rule.objects.get(app='TestApp2').hourly_max_seconds, 600)
        self.assertEqual(Rule.objects.get(app='TestApp2').intervention_type, 'PARTIAL')
    
    def test_approve_rule_modification_request_not_found(self):
        self.authenticate(self.user2)
        approve_url = reverse('approve-rule-modification-request')
        data = {
            'app': 'TestApp'
        }
        response = self.client.post(approve_url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(Rule.objects.filter(app='TestApp').exists(), True)
    
    def test_approve_rule_modification_request_rule_not_found(self):
        self.authenticate(self.user2)
        approve_url = reverse('approve-rule-modification-request')
        data = {
            'app': 'TestApp3'
        }
        response = self.client.post(approve_url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(RuleModificationRequest.objects.filter(app='TestApp3').exists(), True)
    
    def test_delete_rule_modification_request(self):
        Rule.objects.create(app='TestApp2', is_active=False, user=self.user1, daily_max_seconds=3600, hourly_max_seconds=600, session_max_seconds=300, daily_reset='00:00:00', intervention_type='FULL')
        self.authenticate(self.user1)
        delete_url = reverse('delete-rule-modification-request')
        data = {
            'app': 'TestApp2'
        }
        response = self.client.delete(delete_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(RuleModificationRequest.objects.filter(app='TestApp2').exists(), False)
    
    def test_delete_rule_modification_request_no_authentication(self):
        delete_url = reverse('delete-rule-modification-request')
        data = {
            'app': 'TestApp2'
        }
        response = self.client.delete(delete_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(RuleModificationRequest.objects.filter(app='TestApp2').exists(), True)
    
    def test_delete_rule_modification_request_not_found(self):
        self.authenticate(self.user1)
        delete_url = reverse('delete-rule-modification-request')
        data = {
            'app': 'TestApp'
        }
        response = self.client.delete(delete_url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

