from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'student', 'Студент'
        TEACHER = 'teacher', 'Преподаватель'
        ADMIN = 'admin', 'Администратор'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT)
    full_name = models.CharField(max_length=255, blank=True)
    student_group = models.ForeignKey(
        'academics.StudentGroup',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students'
    )

    def save(self, *args, **kwargs):
        if not self.full_name:
            self.full_name = self.get_full_name() or self.username
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.username} ({self.role})'
