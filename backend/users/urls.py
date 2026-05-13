from django.urls import path

from users.views import (
    GroupDetailView,
    GroupListCreateView,
    LoginView,
    LogoutView,
    MeView,
    UserDetailView,
    UserListCreateView,
)

urlpatterns = [
    path('login/', LoginView.as_view(), name='auth-login'),
    path('me/', MeView.as_view(), name='auth-me'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
]

admin_urlpatterns = [
    path('users/', UserListCreateView.as_view(), name='users-list-create'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='users-detail'),
    path('groups/', GroupListCreateView.as_view(), name='groups-list-create'),
    path('groups/<int:pk>/', GroupDetailView.as_view(), name='groups-detail'),
]
