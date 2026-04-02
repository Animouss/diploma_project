from django.contrib.auth import authenticate
from rest_framework import serializers

from academics.models import StudentGroup
from users.models import User


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentGroup
        fields = ('id', 'name', 'code')


class UserSerializer(serializers.ModelSerializer):
    group = serializers.SerializerMethodField()
    student_group_id = serializers.IntegerField(source='student_group.id', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'full_name', 'role', 'is_active', 'group', 'student_group_id')

    def get_group(self, obj):
        return obj.student_group.code if obj.student_group else '—'


class UserCreateUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=6)
    student_group_id = serializers.PrimaryKeyRelatedField(
        queryset=StudentGroup.objects.all(),
        source='student_group',
        required=False,
        allow_null=True,
    )

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'full_name', 'role', 'is_active', 'student_group_id')

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for key, value in validated_data.items():
            setattr(instance, key, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance


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
