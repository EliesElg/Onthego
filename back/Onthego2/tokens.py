from rest_framework_simplejwt.tokens import RefreshToken

class CustomRefreshToken(RefreshToken):
    @classmethod
    def for_user(cls, user):
        token = super().for_user(user)
        # Vérifie si l'utilisateur a un profil associé et récupère le rôle
        if hasattr(user, 'profile') and user.profile:
            token['role'] = user.profile.role
        else:
            token['role'] = None  # Si aucun profil, attribuer une valeur par défaut
        return token
