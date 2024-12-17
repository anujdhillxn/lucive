from rest_framework import serializers
from .models import Score

class ScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Score
        fields = ['value', 'date', 'uninterrupted_tracking']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        res = {
            'value': ret['value'],
            'date': ret['date'],
            'uninterrupted_tracking': ret['uninterrupted_tracking']
        }
        return res