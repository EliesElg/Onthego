
from django.urls import path
from . import views
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

schema_view = get_schema_view(
   openapi.Info(
      title="Post API",
      default_version='v1',
      description="Test description",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@post.local"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(AllowAny,),
)

urlpatterns = [
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('login', views.login, name='login'),
    path('signup', views.signup),
    path('deleteuser/<int:user_id>/', views.deleteuser, name='deleteuser'),
    path('whoami', views.whoami),
    path('userupdate', views.user_update),
    path('get_users/', views.get_users),
    path('generate_prompt', views.generate_prompt, name='generate_prompt'),
    path('dashboard/', views.get_dashboard, name='get_dashboard'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('get_itineraries/', views.get_user_itineraries, name='get_itineraries'),
    path('itineraries/<int:itinerary_id>/', views.get_itinerary_detail, name='get_itinerary_detail'),
    path('profile/', views.get_user_profile, name='get_user_profile'),
    path('profile/update/', views.update_user_profile, name='update_user_profile'),
    path('profile/change-password/', views.change_password, name='change_password'),


]
