from rest_framework import permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from academics.models import StudentGroup
from users.models import User
from users.serializers import (
    GroupSerializer,
    LoginSerializer,
    UserCreateUpdateSerializer,
    UserSerializer,
)


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.ADMIN)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': UserSerializer(user).data}, status=status.HTTP_200_OK)


class MeView(APIView):
    def get(self, request):
        return Response({'user': UserSerializer(request.user).data}, status=status.HTTP_200_OK)


class LogoutView(APIView):
    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserListCreateView(ListCreateAPIView):
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        return User.objects.select_related('student_group').order_by('-id')

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserSerializer
        return UserCreateUpdateSerializer


class UserDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminRole]
    queryset = User.objects.select_related('student_group').all()

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserSerializer
        return UserCreateUpdateSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=['is_active'])


class GroupListCreateView(ListCreateAPIView):
    permission_classes = [IsAdminRole]
    queryset = StudentGroup.objects.order_by('code')
    serializer_class = GroupSerializer


class GroupDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminRole]
    queryset = StudentGroup.objects.all()
    serializer_class = GroupSerializer
