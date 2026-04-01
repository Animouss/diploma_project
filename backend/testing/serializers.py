from rest_framework import serializers

from testing.models import AnswerOption, Question, Test


class TestListSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()

    class Meta:
        model = Test
        fields = ('id', 'title', 'level', 'status', 'duration')

    def get_status(self, _obj):
        return 'Не начат'

    def get_duration(self, obj):
        return f'{obj.duration_minutes} мин'


class AnswerOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerOption
        fields = ('id', 'text', 'order')


class TestQuestionSerializer(serializers.ModelSerializer):
    options = AnswerOptionSerializer(many=True)
    passage_text = serializers.CharField(source='passage.content', allow_null=True, read_only=True)

    class Meta:
        model = Question
        fields = ('id', 'question_type', 'text', 'order', 'points', 'passage_text', 'options')


class TestDetailSerializer(serializers.ModelSerializer):
    questions = TestQuestionSerializer(many=True)

    class Meta:
        model = Test
        fields = ('id', 'title', 'level', 'duration_minutes', 'questions')