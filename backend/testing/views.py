from rest_framework.generics import ListAPIView

from testing.models import Test
from testing.serializers import TestListSerializer
from users.models import User


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
