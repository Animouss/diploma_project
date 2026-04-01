from django.contrib.auth import authenticate
from rest_framework import serializers

from users.models import User


class UserSerializer(serializers.ModelSerializer):
    group = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'full_name', 'role', 'is_active', 'group')

    def get_group(self, obj):
        return obj.student_group.code if obj.student_group else '—'


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs.get('username'), password=attrs.get('password'))
        if not user:
            raise serializers.ValidationError('Неверный логин или пароль.')
        if not user.is_active:
            raise serializers.ValidationError('Пользователь деактивирован.')
        attrs['user'] = user
        return attrs
