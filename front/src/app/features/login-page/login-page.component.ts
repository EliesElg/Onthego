import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import { RouterLink } from '@angular/router'; // Importer RouterLink
import { CommonModule } from '@angular/common'; // Ajout de l'import


@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [HttpClientModule, FormsModule,RouterLink,CommonModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})

export class LoginPageComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = ''; // Nouvelle propriété

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    // Validation des champs vides
    if (!this.username || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }
  
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        localStorage.setItem('authToken', response.access_token);
        window.location.href = '/';
      },
      error: (error) => {
        console.error('Login failed', error);
        
        if (error.error) {
          // Vérification de l'existence de l'utilisateur
          if (error.error.detail?.includes('No active account found')) {
            this.errorMessage = 'Aucun compte trouvé avec ce nom d\'utilisateur';
          }
          // Vérification du mot de passe
          else if (error.error.detail?.includes('incorrect')) {
            this.errorMessage = 'Mot de passe incorrect';
          }
          // Autres cas d'erreur
          else if (error.status === 400) {
            this.errorMessage = 'Données invalides';
          }
          else if (error.status === 401) {
            this.errorMessage = 'Identifiants incorrects';
          }
          else if (error.status === 500) {
            this.errorMessage = 'Erreur serveur. Veuillez réessayer plus tard';
          }
          else {
            this.errorMessage = 'Une erreur est survenue lors de la connexion';
          }
        } else {
          this.errorMessage = 'Erreur de connexion au serveur';
        }
      }
    });
  }
}