from django.db import models


class StudentGroup(models.Model):
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return f'{self.code} — {self.name}'
