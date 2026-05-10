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
    AttemptDetailView,
    AttemptSummaryView,
    FinishAttemptView,
    MyResultsView,
    ResultDetailView,
    ResultsOverviewView,
    SaveAttemptAnswerView,
    StartAttemptView,
    TestDetailView,
    TestListView,
    DashboardSummaryView,
)

urlpatterns = [
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('', TestListView.as_view(), name='tests-list'),
    path('<int:pk>/', TestDetailView.as_view(), name='tests-detail'),
    path('<int:test_id>/start/', StartAttemptView.as_view(), name='tests-start-attempt'),
]

attempt_urlpatterns = [
    path('<int:attempt_id>/', AttemptDetailView.as_view(), name='attempts-detail'),
    path('<int:attempt_id>/answers/', SaveAttemptAnswerView.as_view(), name='attempts-save-answer'),
    path('<int:attempt_id>/finish/', FinishAttemptView.as_view(), name='attempts-finish'),
    path('<int:attempt_id>/summary/', AttemptSummaryView.as_view(), name='attempts-summary'),
]

result_urlpatterns = [
    path('me/', MyResultsView.as_view(), name='results-me'),
    path('overview/', ResultsOverviewView.as_view(), name='results-overview'),
    path('<int:pk>/', ResultDetailView.as_view(), name='results-detail'),
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
