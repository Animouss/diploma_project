from rest_framework import serializers

from testing.models import Test


class TestListSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()

    class Meta:
        model = Test
        fields = ('id', 'title', 'level', 'status', 'duration')

    def get_status(self, _obj):
        return 'Не начат'

    def get_duration(self, obj):
        return f'{obj.duration_minutes} мин'
