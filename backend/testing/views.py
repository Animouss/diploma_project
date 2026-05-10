from decimal import Decimal

from django.shortcuts import get_object_or_404
from django.db import models
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from academics.models import StudentGroup
from testing.models import Answer, AnswerOption, Attempt, Question, Result, Test, TestAssignment
from testing.serializers import (
    AdminOptionSerializer,
    AdminQuestionSerializer,
    AdminTestSerializer,
    AssignmentBulkCreateSerializer,
    AssignmentSerializer,
    AttemptExecutionSerializer,
    AttemptSummarySerializer,
    SaveAnswerSerializer,
    StudentResultSerializer,
    ResultDetailSerializer,
    TestDetailSerializer,
    TestListSerializer,
)
from users.models import User


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.ADMIN)


class IsTeacherOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in (User.Role.TEACHER, User.Role.ADMIN)
        )


class TestAccessMixin:
    @staticmethod
    def user_can_access_test(user, test):
        if user.role in (User.Role.ADMIN, User.Role.TEACHER):
            return True

        if user.role == User.Role.STUDENT and user.student_group_id:
            return test.assignments.filter(group_id=user.student_group_id).exists()

        return False

    @staticmethod
    def get_student_available_tests(user):
        return Test.objects.filter(
            is_published=True,
            assignments__group_id=user.student_group_id,
        ).distinct()


class TestListView(ListAPIView):
    serializer_class = TestListSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role in (User.Role.ADMIN, User.Role.TEACHER):
            return Test.objects.order_by('title')

        if user.student_group_id:
            return Test.objects.filter(
                is_published=True,
                assignments__group=user.student_group
            ).distinct().order_by('title')

        return Test.objects.none()


class TestDetailView(TestAccessMixin, RetrieveAPIView):
    serializer_class = TestDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Test.objects.filter(is_published=True).prefetch_related('questions__options', 'questions__passage')

    def get_object(self):
        test = super().get_object()
        if not self.user_can_access_test(self.request.user, test):
            self.permission_denied(self.request, message='Нет доступа к этому тесту.')
        return test


class StartAttemptView(TestAccessMixin, APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, test_id):
        user = request.user
        test = get_object_or_404(Test, id=test_id, is_published=True)

        if user.role == User.Role.STUDENT:
            if not user.student_group_id:
                self.permission_denied(request, message='У студента не назначена группа.')
            if not self.get_student_available_tests(user).filter(id=test_id).exists():
                self.permission_denied(request, message='Тест не назначен вашей группе.')

        finished_attempt = Attempt.objects.filter(user=user, test=test, status=Attempt.AttemptStatus.FINISHED).first()
        if finished_attempt:
            return Response({'detail': 'Тест уже пройден. Повторное прохождение недоступно.'}, status=status.HTTP_400_BAD_REQUEST)

        attempt = Attempt.objects.filter(user=user, test=test, status=Attempt.AttemptStatus.IN_PROGRESS).first()
        if not attempt:
            attempt = Attempt.objects.create(user=user, test=test)

        payload = AttemptExecutionSerializer(attempt).data
        payload['remaining_seconds'] = test.duration_minutes * 60
        return Response(payload, status=status.HTTP_200_OK)


class AttemptDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, attempt_id):
        attempt = get_object_or_404(
            Attempt.objects.select_related('test', 'user').prefetch_related('test__questions__options', 'test__questions__passage'),
            id=attempt_id,
        )

        if request.user.role == User.Role.STUDENT and attempt.user_id != request.user.id:
            self.permission_denied(request, message='Нет доступа к попытке.')

        return Response(AttemptExecutionSerializer(attempt).data)


class SaveAttemptAnswerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, attempt_id):
        attempt = get_object_or_404(Attempt.objects.select_related('test', 'user'), id=attempt_id)

        if attempt.status != Attempt.AttemptStatus.IN_PROGRESS:
            return Response({'detail': 'Попытка уже завершена.'}, status=status.HTTP_400_BAD_REQUEST)

        if request.user.role == User.Role.STUDENT and attempt.user_id != request.user.id:
            self.permission_denied(request, message='Нет доступа к попытке.')

        serializer = SaveAnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        question = get_object_or_404(Question, id=serializer.validated_data['question_id'], test=attempt.test)
        option_id = serializer.validated_data['option_id']
        selected_option = None

        if option_id is not None:
            selected_option = get_object_or_404(AnswerOption, id=option_id, question=question)

        answer, _ = Answer.objects.update_or_create(
            attempt=attempt,
            question=question,
            defaults={'selected_option': selected_option},
        )

        return Response(
            {
                'attempt_id': attempt.id,
                'question_id': question.id,
                'selected_option_id': answer.selected_option_id,
            },
            status=status.HTTP_200_OK,
        )


class FinishAttemptView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, attempt_id):
        attempt = get_object_or_404(
            Attempt.objects.select_related('test', 'user').prefetch_related('test__questions__options', 'answers'),
            id=attempt_id,
        )

        if request.user.role == User.Role.STUDENT and attempt.user_id != request.user.id:
            self.permission_denied(request, message='Нет доступа к попытке.')

        if attempt.status == Attempt.AttemptStatus.FINISHED:
            return Response(AttemptSummarySerializer(attempt).data, status=status.HTTP_200_OK)

        questions = list(attempt.test.questions.all())
        total_points = sum(q.points for q in questions) or 1
        score_points = Decimal('0')

        answers_by_question = {
            answer.question_id: answer.selected_option_id
            for answer in Answer.objects.filter(attempt=attempt)
        }

        for question in questions:
            correct_option = question.options.filter(is_correct=True).first()
            if correct_option and answers_by_question.get(question.id) == correct_option.id:
                score_points += Decimal(question.points)

        score_percent = (score_points / Decimal(total_points)) * Decimal('100')
        score_percent = score_percent.quantize(Decimal('0.01'))

        attempt.score_percent = score_percent
        attempt.status = Attempt.AttemptStatus.FINISHED
        attempt.finished_at = timezone.now()
        attempt.save(update_fields=['score_percent', 'status', 'finished_at'])

        result, _ = Result.objects.update_or_create(
            attempt=attempt,
            defaults={
                'score_percent': score_percent,
                'level_result': attempt.test.level,
                'passed': score_percent >= Decimal('60.00'),
            },
        )

        payload = AttemptSummarySerializer(attempt).data
        payload['result_id'] = result.id
        return Response(payload, status=status.HTTP_200_OK)


class AttemptSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, attempt_id):
        attempt = get_object_or_404(
            Attempt.objects.select_related('test', 'user').prefetch_related('result'),
            id=attempt_id,
        )

        if request.user.role == User.Role.STUDENT and attempt.user_id != request.user.id:
            self.permission_denied(request, message='Нет доступа к попытке.')

        return Response(AttemptSummarySerializer(attempt).data)


class MyResultsView(ListAPIView):
    serializer_class = StudentResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Result.objects.select_related('attempt__test', 'attempt__user', 'attempt__user__student_group').filter(
            attempt__user=self.request.user,
            attempt__status=Attempt.AttemptStatus.FINISHED,
        ).order_by('-created_at')




class ResultDetailView(RetrieveAPIView):
    serializer_class = ResultDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Result.objects.select_related('attempt__test', 'attempt__user').prefetch_related('attempt__answers__selected_option', 'attempt__test__questions__options')

    def get_object(self):
        result = super().get_object()
        if self.request.user.role == User.Role.STUDENT and result.attempt.user_id != self.request.user.id:
            self.permission_denied(self.request, message='Нет доступа к результату.')
        return result


class ResultsOverviewView(ListAPIView):
    serializer_class = StudentResultSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        queryset = Result.objects.select_related(
            'attempt__test',
            'attempt__user',
            'attempt__user__student_group',
        ).filter(attempt__status=Attempt.AttemptStatus.FINISHED).order_by('-created_at')

        test_id = self.request.query_params.get('test_id')
        group_id = self.request.query_params.get('group_id')
        student_id = self.request.query_params.get('student_id')

        if test_id:
            queryset = queryset.filter(attempt__test_id=test_id)
        if group_id:
            queryset = queryset.filter(attempt__user__student_group_id=group_id)
        if student_id:
            queryset = queryset.filter(attempt__user_id=student_id)

        return queryset


class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == User.Role.STUDENT:
            available_tests = TestAccessMixin.get_student_available_tests(user) if user.student_group_id else Test.objects.none()
            finished_attempts = Attempt.objects.filter(user=user, status=Attempt.AttemptStatus.FINISHED).select_related('test').order_by('-finished_at')
            finished_test_ids = set(finished_attempts.values_list('test_id', flat=True))
            pending_tests = [t for t in available_tests if t.id not in finished_test_ids]
            avg = finished_attempts.aggregate(avg=models.Avg('score_percent'))['avg']
            last = finished_attempts.first()
            return Response({
                'role': 'student',
                'available_count': len(pending_tests),
                'finished_count': finished_attempts.count(),
                'average_score': float(avg) if avg is not None else 0,
                'last_result': StudentResultSerializer(last.result).data if last and hasattr(last, 'result') else None,
                'pending_tests': AdminTestSerializer(pending_tests, many=True).data,
            })

        student_users = User.objects.filter(role=User.Role.STUDENT)
        student_attempts = Attempt.objects.filter(user__in=student_users, status=Attempt.AttemptStatus.FINISHED)
        avg = student_attempts.aggregate(avg=models.Avg('score_percent'))['avg']
        return Response({
            'role': user.role,
            'students_count': student_users.count(),
            'students_average_score': float(avg) if avg is not None else 0,
            'students_finished_attempts': student_attempts.count(),
        })

class AdminTestListCreateView(ListCreateAPIView):
    permission_classes = [IsTeacherOrAdmin]
    queryset = Test.objects.order_by('-id')
    serializer_class = AdminTestSerializer


class AdminTestDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsTeacherOrAdmin]
    queryset = Test.objects.all()
    serializer_class = AdminTestSerializer


class AdminTestPublishView(APIView):
    permission_classes = [IsTeacherOrAdmin]

    def post(self, request, pk):
        test = get_object_or_404(Test, pk=pk)
        test.is_published = bool(request.data.get('is_published'))
        test.save(update_fields=['is_published'])
        return Response(AdminTestSerializer(test).data, status=status.HTTP_200_OK)


class AdminQuestionListCreateView(ListCreateAPIView):
    permission_classes = [IsTeacherOrAdmin]
    serializer_class = AdminQuestionSerializer

    def get_queryset(self):
        queryset = Question.objects.select_related('passage').order_by('test_id', 'order')
        test_id = self.request.query_params.get('test_id')
        if test_id:
            queryset = queryset.filter(test_id=test_id)
        return queryset


class AdminQuestionDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsTeacherOrAdmin]
    queryset = Question.objects.select_related('passage').all()
    serializer_class = AdminQuestionSerializer


class AdminOptionListCreateView(ListCreateAPIView):
    permission_classes = [IsTeacherOrAdmin]
    serializer_class = AdminOptionSerializer

    def get_queryset(self):
        queryset = AnswerOption.objects.order_by('question_id', 'order')
        question_id = self.request.query_params.get('question_id')
        if question_id:
            queryset = queryset.filter(question_id=question_id)
        return queryset


class AdminOptionDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsTeacherOrAdmin]
    queryset = AnswerOption.objects.all()
    serializer_class = AdminOptionSerializer


class AssignmentListCreateView(APIView):
    permission_classes = [IsTeacherOrAdmin]

    def get(self, request):
        test_id = request.query_params.get('test_id')
        queryset = TestAssignment.objects.select_related('test', 'group').order_by('-assigned_at')
        if test_id:
            queryset = queryset.filter(test_id=test_id)
        return Response(AssignmentSerializer(queryset, many=True).data)

    def post(self, request):
        serializer = AssignmentBulkCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        test_id = serializer.validated_data['test_id']
        group_ids = serializer.validated_data['group_ids']

        assignments = []
        for group in StudentGroup.objects.filter(id__in=group_ids):
            assignment, _ = TestAssignment.objects.get_or_create(test_id=test_id, group=group)
            assignments.append(assignment)

        return Response(AssignmentSerializer(assignments, many=True).data, status=status.HTTP_201_CREATED)


class AssignmentDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsTeacherOrAdmin]
    queryset = TestAssignment.objects.select_related('test', 'group').all()
    serializer_class = AssignmentSerializer
