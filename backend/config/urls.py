from django.contrib import admin
from django.urls import include, path

from testing.urls import admin_urlpatterns as testing_admin_urlpatterns
from users.urls import admin_urlpatterns as users_admin_urlpatterns

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/tests/', include('testing.urls')),
]

urlpatterns += [path('api/admin/', include((users_admin_urlpatterns + testing_admin_urlpatterns, 'admin-api')))]
