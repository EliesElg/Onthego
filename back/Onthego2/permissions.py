from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied

class IsPro(BasePermission):
    def has_permission(self, request, view):
        if not hasattr(request.user, 'profile') or request.user.profile.role != 'pro':
            raise PermissionDenied("Accès réservé aux utilisateurs professionnels.")
        return True
