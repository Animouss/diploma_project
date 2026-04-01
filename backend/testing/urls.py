from django.urls import path

from testing.views import TestListView

urlpatterns = [
    path('', TestListView.as_view(), name='tests-list'),
]
