from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils.dateparse import parse_date
from django.db.models import Q

from duos.models import Duo
from .models import Score, ScoreAggregates
from .serializers import ScoreSerializer

class RetrieveScoreView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        if not start_date_str or not end_date_str:
            return Response({'error': 'start_date and end_date parameters are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        start_date = parse_date(start_date_str)
        end_date = parse_date(end_date_str)
        
        if not start_date or not end_date:
            return Response({'error': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)
        scores = Score.objects.filter(user=user, date__range=[start_date, end_date])
        serializer = ScoreSerializer(scores, many=True)
        response_data = {}
        for score in serializer.data:
            date_str = score.get('date')
            response_data[date_str] = score
        return Response(response_data, status=status.HTTP_200_OK)

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
        response_data = {
                'currentStreak': 0,
                'longestStreak': 0
            }
        score_aggregates = ScoreAggregates.objects.filter(user=user).first()
        if not score_aggregates:
            score_aggregates = ScoreAggregates.objects.create(user=user)
        current_streak = score_aggregates.perfect_day_current_streak
        longest_streak = score_aggregates.perfect_day_longest_streak
        last_perfect_day = score_aggregates.last_perfect_day
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
                if uninterrupepted_tracking:
                    if last_perfect_day and (date - last_perfect_day).days == 1:
                        current_streak += 1
                    else:
                        current_streak = 1
                    if current_streak > longest_streak:
                        longest_streak = current_streak
                    last_perfect_day = date
                else:
                    current_streak = 0
                    
        score_aggregates.perfect_day_current_streak = current_streak
        score_aggregates.perfect_day_longest_streak = longest_streak
        score_aggregates.last_perfect_day = last_perfect_day
        score_aggregates.save()
        response_data['currentStreak'] = current_streak
        response_data['longestStreak'] = longest_streak

        return Response(response_data, status=status.HTTP_200_OK)