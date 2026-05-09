from django.conf import settings
from django.db import models


class Test(models.Model):
    title = models.CharField(max_length=255)
    level = models.CharField(max_length=10)
    duration_minutes = models.PositiveIntegerField(default=30)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class ReadingPassage(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='passages')
    title = models.CharField(max_length=255, blank=True)
    content = models.TextField()
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title or f'Текст #{self.id}'


class Question(models.Model):
    class QuestionType(models.TextChoices):
        SINGLE_CHOICE = 'single_choice', 'Один вариант'
        READING_SINGLE_CHOICE = 'reading_single_choice', 'Чтение + один вариант'

    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='questions')
    passage = models.ForeignKey(ReadingPassage, on_delete=models.SET_NULL, null=True, blank=True, related_name='questions')
    question_type = models.CharField(max_length=40, choices=QuestionType.choices, default=QuestionType.SINGLE_CHOICE)
    text = models.TextField()
    order = models.PositiveIntegerField(default=1)
    points = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order']


class AnswerOption(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order']


class TestAssignment(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='assignments')
    group = models.ForeignKey('academics.StudentGroup', on_delete=models.CASCADE, related_name='test_assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('test', 'group')


class Attempt(models.Model):
    class AttemptStatus(models.TextChoices):
        IN_PROGRESS = 'in_progress', 'В процессе'
        FINISHED = 'finished', 'Завершена'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attempts')
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='attempts')
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=AttemptStatus.choices, default=AttemptStatus.IN_PROGRESS)
    score_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)


class Answer(models.Model):
    attempt = models.ForeignKey(Attempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    selected_option = models.ForeignKey(AnswerOption, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        unique_together = ('attempt', 'question')


class Result(models.Model):
    attempt = models.OneToOneField(Attempt, on_delete=models.CASCADE, related_name='result')
    score_percent = models.DecimalField(max_digits=5, decimal_places=2)
    level_result = models.CharField(max_length=10)
    passed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
