from rest_framework import serializers

def get_preparation_level(score_percent):
    score = float(score_percent or 0)
    if score >= 80:
        return "Продвинутый"
    if score >= 60:
        return "Академический"
    return "Базовый"


from testing.models import Answer, AnswerOption, Attempt, Question, ReadingPassage, Result, Test, TestAssignment


class TestListSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()

    class Meta:
        model = Test
        fields = ('id', 'title', 'comment', 'status', 'duration')

    def get_status(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if not user or user.role != 'student':
            return 'Не начат'
        attempt = Attempt.objects.filter(user=user, test=obj).order_by('-started_at').first()
        if not attempt:
            return 'Не начат'
        if attempt.status == Attempt.AttemptStatus.FINISHED:
            return 'Пройден'
        return 'В процессе'

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
        fields = ('id', 'title', 'comment', 'duration_minutes', 'questions')


class AttemptExecutionSerializer(serializers.ModelSerializer):
    test = TestDetailSerializer(read_only=True)

    class Meta:
        model = Attempt
        fields = ('id', 'status', 'started_at', 'finished_at', 'test')


class SaveAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    option_id = serializers.IntegerField(allow_null=True)


class AttemptSummarySerializer(serializers.ModelSerializer):
    test_title = serializers.CharField(source='test.title', read_only=True)
    result = serializers.SerializerMethodField()
    preparation_level = serializers.SerializerMethodField()

    class Meta:
        model = Attempt
        fields = ('id', 'test', 'test_title', 'status', 'started_at', 'finished_at', 'score_percent', 'preparation_level', 'result')

    def get_preparation_level(self, obj):
        return get_preparation_level(obj.score_percent)

    def get_result(self, obj):
        if not hasattr(obj, 'result'):
            return None
        return {
            'score_percent': obj.result.score_percent,
            'level_result': obj.result.level_result,
            'passed': obj.result.passed,
        }


class StudentResultSerializer(serializers.ModelSerializer):
    test_title = serializers.CharField(source='attempt.test.title', read_only=True)
    user_id = serializers.IntegerField(source='attempt.user_id', read_only=True)
    username = serializers.CharField(source='attempt.user.username', read_only=True)
    user_full_name = serializers.CharField(source='attempt.user.full_name', read_only=True)
    user_group = serializers.CharField(source='attempt.user.student_group.code', read_only=True, default='—')
    attempt_id = serializers.IntegerField(source='attempt.id', read_only=True)
    finished_at = serializers.DateTimeField(source='attempt.finished_at', read_only=True)
    preparation_level = serializers.SerializerMethodField()

    class Meta:
        model = Result
        fields = (
            'id',
            'attempt_id',
            'test_title',
            'user_id',
            'username',
            'user_full_name',
            'user_group',
            'score_percent',
            'level_result',
            'passed',
            'finished_at',
            'preparation_level',
            'created_at',
        )


    def get_preparation_level(self, obj):
        return get_preparation_level(obj.score_percent)

class AdminTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Test
        fields = ('id', 'title', 'comment', 'duration_minutes', 'is_published')


class AdminQuestionSerializer(serializers.ModelSerializer):
    passage_text = serializers.CharField(required=False, allow_blank=True, write_only=True)
    current_passage_text = serializers.CharField(source='passage.content', read_only=True)

    class Meta:
        model = Question
        fields = (
            'id',
            'test',
            'question_type',
            'text',
            'order',
            'points',
            'passage',
            'passage_text',
            'current_passage_text',
        )

    def _prepare_passage(self, validated_data):
        passage_text = validated_data.pop('passage_text', None)
        if passage_text is None:
            return validated_data

        if passage_text.strip() == '':
            validated_data['passage'] = None
            return validated_data

        test = validated_data.get('test') or getattr(self.instance, 'test', None)
        order = validated_data.get('order') or getattr(self.instance, 'order', 1)

        if self.instance and self.instance.passage:
            passage = self.instance.passage
            passage.content = passage_text
            passage.order = order
            passage.save(update_fields=['content', 'order'])
        else:
            passage = ReadingPassage.objects.create(test=test, content=passage_text, order=order)

        validated_data['passage'] = passage
        return validated_data

    def create(self, validated_data):
        validated_data = self._prepare_passage(validated_data)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data = self._prepare_passage(validated_data)
        return super().update(instance, validated_data)


class AdminOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerOption
        fields = ('id', 'question', 'text', 'is_correct', 'order')


class AssignmentSerializer(serializers.ModelSerializer):
    test_title = serializers.CharField(source='test.title', read_only=True)
    group_code = serializers.CharField(source='group.code', read_only=True)

    class Meta:
        model = TestAssignment
        fields = ('id', 'test', 'test_title', 'group', 'group_code', 'assigned_at')


class AssignmentBulkCreateSerializer(serializers.Serializer):
    test_id = serializers.IntegerField()
    group_ids = serializers.ListField(child=serializers.IntegerField(), allow_empty=False)


class ResultQuestionReviewSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    question_text = serializers.CharField()
    question_type = serializers.CharField()
    selected_option_id = serializers.IntegerField(allow_null=True)
    selected_option_text = serializers.CharField(allow_null=True)
    correct_option_id = serializers.IntegerField(allow_null=True)
    correct_option_text = serializers.CharField(allow_null=True)
    is_correct = serializers.BooleanField()


class ResultDetailSerializer(serializers.ModelSerializer):
    test_title = serializers.CharField(source='attempt.test.title', read_only=True)
    student_name = serializers.CharField(source='attempt.user.full_name', read_only=True)
    questions = serializers.SerializerMethodField()
    preparation_level = serializers.SerializerMethodField()

    class Meta:
        model = Result
        fields = (
            'id',
            'test_title',
            'student_name',
            'score_percent',
            'level_result',
            'passed',
            'preparation_level',
            'created_at',
            'questions',
        )

    def get_preparation_level(self, obj):
        return get_preparation_level(obj.score_percent)

    def get_questions(self, obj):
        attempt = obj.attempt
        answers_map = {a.question_id: a.selected_option for a in attempt.answers.select_related('selected_option')}
        rows = []
        for question in attempt.test.questions.prefetch_related('options').all():
            selected = answers_map.get(question.id)
            correct = question.options.filter(is_correct=True).first()
            rows.append({
                'question_id': question.id,
                'question_text': question.text,
                'question_type': question.question_type,
                'selected_option_id': selected.id if selected else None,
                'selected_option_text': selected.text if selected else None,
                'correct_option_id': correct.id if correct else None,
                'correct_option_text': correct.text if correct else None,
                'is_correct': bool(selected and correct and selected.id == correct.id),
            })
        return ResultQuestionReviewSerializer(rows, many=True).data
