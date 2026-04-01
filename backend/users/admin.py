from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from users.models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = DjangoUserAdmin.fieldsets + (
        ('Дополнительно', {'fields': ('role', 'full_name', 'student_group')}),
    )
    list_display = ('username', 'full_name', 'role', 'student_group', 'is_staff', 'is_active')
