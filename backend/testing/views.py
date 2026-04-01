from rest_framework import permissions, status
from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from academics.models import StudentGroup
from testing.models import AnswerOption, Question, Test, TestAssignment
from testing.serializers import (
    AdminOptionSerializer,
    AdminQuestionSerializer,
    AdminTestSerializer,
    AssignmentBulkCreateSerializer,
    AssignmentSerializer,
    TestDetailSerializer,
    TestListSerializer,
)
from users.models import User


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.ADMIN)


class TestAccessMixin:
    @staticmethod
    def user_can_access_test(user, test):
        if user.role in (User.Role.ADMIN, User.Role.TEACHER):
            return True

        if user.role == User.Role.STUDENT and user.student_group_id:
            return test.assignments.filter(group_id=user.student_group_id).exists()

        return False


class TestListView(ListAPIView):
    serializer_class = TestListSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role in (User.Role.ADMIN, User.Role.TEACHER):
            return Test.objects.filter(is_published=True).order_by('title')

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


class AdminTestListCreateView(ListCreateAPIView):
    permission_classes = [IsAdminRole]
    queryset = Test.objects.order_by('-id')
    serializer_class = AdminTestSerializer


class AdminTestDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminRole]
    queryset = Test.objects.all()
    serializer_class = AdminTestSerializer


class AdminTestPublishView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        test = Test.objects.get(pk=pk)
        test.is_published = bool(request.data.get('is_published'))
        test.save(update_fields=['is_published'])
        return Response(AdminTestSerializer(test).data, status=status.HTTP_200_OK)


class AdminQuestionListCreateView(ListCreateAPIView):
    permission_classes = [IsAdminRole]
    serializer_class = AdminQuestionSerializer

    def get_queryset(self):
        queryset = Question.objects.select_related('passage').order_by('test_id', 'order')
        test_id = self.request.query_params.get('test_id')
        if test_id:
            queryset = queryset.filter(test_id=test_id)
        return queryset


class AdminQuestionDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminRole]
    queryset = Question.objects.select_related('passage').all()
    serializer_class = AdminQuestionSerializer


class AdminOptionListCreateView(ListCreateAPIView):
    permission_classes = [IsAdminRole]
    serializer_class = AdminOptionSerializer

    def get_queryset(self):
        queryset = AnswerOption.objects.order_by('question_id', 'order')
        question_id = self.request.query_params.get('question_id')
        if question_id:
            queryset = queryset.filter(question_id=question_id)
        return queryset


class AdminOptionDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminRole]
    queryset = AnswerOption.objects.all()
    serializer_class = AdminOptionSerializer


class AssignmentListCreateView(APIView):
    permission_classes = [IsAdminRole]

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
    permission_classes = [IsAdminRole]
    queryset = TestAssignment.objects.select_related('test', 'group').all()
    serializer_class = AssignmentSerializer
