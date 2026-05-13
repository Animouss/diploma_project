from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from academics.models import StudentGroup
from testing.models import Answer, AnswerOption, Attempt, Question, ReadingPassage, Result, Test, TestAssignment


class Command(BaseCommand):
    help = 'Создаёт demo-данные для защиты диплома (admin/teacher/student, группа, тест, попытка, результат).'

    def handle(self, *args, **options):
        User = get_user_model()

        group, _ = StudentGroup.objects.get_or_create(code='IT-21-01', defaults={'name': 'Иностранные студенты ИТ-21-01'})

        admin = self._upsert_user(User, 'admin_demo', 'Администратор Демо', 'admin', 'admin123')
        teacher = self._upsert_user(User, 'teacher_demo', 'Преподаватель Демо', 'teacher', 'teacher123')
        student = self._upsert_user(User, 'student_demo', 'Студент Демо', 'student', 'student123', group)

        test, _ = Test.objects.get_or_create(
            title='Демонстрационный тест по русскому языку',
            defaults={
                'comment': 'Вступительный тест',
                'duration_minutes': 30,
                'is_published': True,
            },
        )
        test.is_published = True
        test.save(update_fields=['is_published'])

        passage, _ = ReadingPassage.objects.get_or_create(
            test=test,
            order=1,
            defaults={
                'title': 'Текст для чтения',
                'content': 'Русский язык является важной частью академической адаптации иностранных студентов.'
            },
        )

        q1, _ = Question.objects.get_or_create(
            test=test,
            order=1,
            defaults={
                'question_type': Question.QuestionType.SINGLE_CHOICE,
                'text': 'Выберите правильную форму: Студенты ___ контрольную работу.',
                'points': 1,
            },
        )

        q2, _ = Question.objects.get_or_create(
            test=test,
            order=2,
            defaults={
                'question_type': Question.QuestionType.READING_SINGLE_CHOICE,
                'text': 'О чём говорится в тексте?',
                'points': 1,
                'passage': passage,
            },
        )
        if q2.passage_id != passage.id:
            q2.passage = passage
            q2.save(update_fields=['passage'])

        self._upsert_option(q1, 'пишут', True, 1)
        self._upsert_option(q1, 'пишет', False, 2)
        self._upsert_option(q1, 'писал', False, 3)

        self._upsert_option(q2, 'О спортивных соревнованиях', False, 1)
        self._upsert_option(q2, 'Об академической адаптации и русском языке', True, 2)
        self._upsert_option(q2, 'О туристических маршрутах', False, 3)

        TestAssignment.objects.get_or_create(test=test, group=group)

        attempt, _ = Attempt.objects.get_or_create(
            user=student,
            test=test,
            status=Attempt.AttemptStatus.FINISHED,
            defaults={'score_percent': Decimal('100.00')},
        )

        if attempt.status != Attempt.AttemptStatus.FINISHED:
            attempt.status = Attempt.AttemptStatus.FINISHED
            attempt.score_percent = Decimal('100.00')
            attempt.save(update_fields=['status', 'score_percent'])

        for question in test.questions.all():
            correct_option = question.options.filter(is_correct=True).first()
            Answer.objects.update_or_create(
                attempt=attempt,
                question=question,
                defaults={'selected_option': correct_option},
            )

        Result.objects.update_or_create(
            attempt=attempt,
            defaults={
                'score_percent': Decimal('100.00'),
                'level_result': '',
                'passed': True,
            },
        )

        self.stdout.write(self.style.SUCCESS('Demo-данные созданы/обновлены.'))
        self.stdout.write('Логины: admin_demo / teacher_demo / student_demo')
        self.stdout.write('Пароли: admin123 / teacher123 / student123')

    def _upsert_user(self, user_model, username, full_name, role, password, group=None):
        user, _ = user_model.objects.get_or_create(username=username, defaults={'full_name': full_name, 'role': role})
        user.full_name = full_name
        user.role = role
        user.student_group = group if role == 'student' else None
        user.is_active = True
        user.set_password(password)
        user.save()
        return user

    @staticmethod
    def _upsert_option(question, text, is_correct, order):
        option, _ = AnswerOption.objects.get_or_create(question=question, order=order, defaults={'text': text, 'is_correct': is_correct})
        option.text = text
        option.is_correct = is_correct
        option.save(update_fields=['text', 'is_correct'])
        return option
