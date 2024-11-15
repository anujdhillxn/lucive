import random
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Word
from .serializers import WordSerializer

class RandomWordsView(APIView):
    def get(self, request):
        n = int(request.query_params.get('n', 1))
        words = Word.objects.order_by('?')[:n]
        serializer = WordSerializer(words, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)