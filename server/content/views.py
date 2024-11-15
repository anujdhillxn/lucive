import random
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Word
from .serializers import WordSerializer

class AddWordsView(APIView):
    def post(self, request):
        if not request.user.is_superuser:
            return Response({'error': 'Only superusers can add words.'}, status=status.HTTP_403_FORBIDDEN)

        words_data = request.data.get('words', [])
        if not isinstance(words_data, list):
            return Response({'error': 'Invalid data format. Expected a list of words.'}, status=status.HTTP_400_BAD_REQUEST)

        added_words = []
        omitted_words = []
        for word_data in words_data:
            word = word_data.get('word')
            if Word.objects.filter(word=word).exists():
                omitted_words.append(word)
                continue
            serializer = WordSerializer(data=word_data)
            if serializer.is_valid():
                serializer.save()
                added_words.append(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response({'added_words': added_words, 'omitted_words': omitted_words}, status=status.HTTP_201_CREATED)

class RandomWordsView(APIView):
    def get(self, request):
        n = int(request.query_params.get('n', 1))
        words = Word.objects.order_by('?')[:n]
        serializer = WordSerializer(words, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)