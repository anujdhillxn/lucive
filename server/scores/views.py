from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils.dateparse import parse_date
from django.db.models import Q

from duos.models import Duo
from .models import Score
from .serializers import ScoreSerializer

class RetrieveScoreView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        scores = Score.objects.filter(user=user).order_by('date')
        serializer = ScoreSerializer(scores, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UpdateScoreView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        scores_data = request.data
        if scores_data is None:
            return Response({'error': 'Scores data is required'}, status=status.HTTP_400_BAD_REQUEST)
        confirmed_duo = Duo.objects.filter(
            (Q(user1=user) | Q(user2=user))
        ).first()
        if not confirmed_duo:
            return Response({'error': 'User is not part of a confirmed duo'}, status=status.HTTP_403_FORBIDDEN)
        for score_data in scores_data:
            date_str = score_data.get('date')
            value = score_data.get('value')
            uninterrupepted_tracking = score_data.get('uninterrupted_tracking')
            if not date_str or value is None or uninterrupepted_tracking is None:
                return Response({'error': 'Date, uninterrupted_tracking and value are required for each score entry'}, status=status.HTTP_400_BAD_REQUEST)
            date = parse_date(date_str)
            if not date:
                return Response({'error': f'Invalid date format for date: {date_str}'}, status=status.HTTP_400_BAD_REQUEST)
            score = Score.objects.filter(user=user, date=date).first()
            if not score:
                score = Score.objects.create(user=user, date=date, value=value, uninterrupted_tracking=uninterrupepted_tracking)

        return Response(status=status.HTTP_201_CREATED)