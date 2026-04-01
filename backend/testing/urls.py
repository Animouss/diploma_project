from django.urls import path

from testing.views import TestDetailView, TestListView

urlpatterns = [
    path('', TestListView.as_view(), name='tests-list'),
    path('<int:pk>/', TestDetailView.as_view(), name='tests-detail'),
]

  from django.urls import path

from testing.views import TestDetailView, TestListView

urlpatterns = [
    path('', TestListView.as_view(), name='tests-list'),
    path('<int:pk>/', TestDetailView.as_view(), name='tests-detail'),
]