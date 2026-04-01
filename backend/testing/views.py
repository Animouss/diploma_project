from rest_framework import permissions
from rest_framework.generics import ListAPIView, RetrieveAPIView

from testing.models import Test
from testing.serializers import TestDetailSerializer, TestListSerializer
from users.models import User


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
