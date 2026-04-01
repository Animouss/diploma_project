from django.contrib import admin

from testing.models import Answer, AnswerOption, Attempt, Question, ReadingPassage, Result, Test, TestAssignment

admin.site.register(Test)
admin.site.register(ReadingPassage)
admin.site.register(Question)
admin.site.register(AnswerOption)
admin.site.register(TestAssignment)
admin.site.register(Attempt)
admin.site.register(Answer)
admin.site.register(Result)