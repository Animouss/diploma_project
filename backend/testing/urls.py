from django.urls import path

from testing.views import (
    AdminOptionDetailView,
    AdminOptionListCreateView,
    AdminQuestionDetailView,
    AdminQuestionListCreateView,
    AdminTestDetailView,
    AdminTestListCreateView,
    AdminTestPublishView,
    AssignmentDetailView,
    AssignmentListCreateView,
    TestDetailView,
    TestListView,
)

urlpatterns = [
    path('', TestListView.as_view(), name='tests-list'),
    path('<int:pk>/', TestDetailView.as_view(), name='tests-detail'),
]

admin_urlpatterns = [
    path('tests/', AdminTestListCreateView.as_view(), name='admin-tests-list-create'),
    path('tests/<int:pk>/', AdminTestDetailView.as_view(), name='admin-tests-detail'),
    path('tests/<int:pk>/publish/', AdminTestPublishView.as_view(), name='admin-tests-publish'),
    path('questions/', AdminQuestionListCreateView.as_view(), name='admin-questions-list-create'),
    path('questions/<int:pk>/', AdminQuestionDetailView.as_view(), name='admin-questions-detail'),
    path('options/', AdminOptionListCreateView.as_view(), name='admin-options-list-create'),
    path('options/<int:pk>/', AdminOptionDetailView.as_view(), name='admin-options-detail'),
    path('assignments/', AssignmentListCreateView.as_view(), name='admin-assignments-list-create'),
    path('assignments/<int:pk>/', AssignmentDetailView.as_view(), name='admin-assignments-detail'),
]
