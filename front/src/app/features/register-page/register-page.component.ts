import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router'; // Importer RouterLink
import { CommonModule } from '@angular/common'; // Importez CommonModule

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, RouterLink], 
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent {
  firstName: string = '';
  lastName: string = '';
  username: string = '';
  email: string = '';
  password: string = '';
  role: string = '';
  passwordConfirmation: string = '';
  RegisterSuccess: boolean = false;
  errorMessage: string = ''; // Ajouter une propriété pour les messages d'erreur

  constructor(
    private authService: AuthService,
    public router: Router
  ) {}
  selectedType: string = '';

  onSelectType(type: string) {
    this.selectedType = type;
  }

  onRegister(event: Event, form: NgForm): void {
      console.log("-------- entrée dans onRegister");
      event.preventDefault();
      
      // Validation du formulaire
      if (form.invalid) {
          this.errorMessage = 'Le formulaire est invalide';
          return;
      }
  
      // Validation du format email
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(this.email)) {
          this.errorMessage = 'Veuillez entrer une adresse email valide';
          return;
      }
  
      // Validation des mots de passe
      if (this.password !== this.passwordConfirmation) {
          this.errorMessage = 'Les mots de passe ne correspondent pas';
          return;
      }
  
      this.authService.register(this.username, this.password, this.email, this.role).subscribe({
          next: (response) => {
              console.log('Inscription réussie', response);
              this.RegisterSuccess = true;
              this.router.navigate(['/login']);
          },
          error: (error) => {
              console.error('Échec de l\'inscription', error);
              
              if (error.error) {
                  if (typeof error.error === 'string') {
                      this.errorMessage = error.error;
                  } else if (error.error.password) {
                      this.errorMessage = error.error.password[0];
                  } else if (error.error.email) {
                      if (error.error.email.includes('already exists')) {
                          this.errorMessage = 'Cette adresse email est déjà utilisée';
                      } else {
                          this.errorMessage = 'Format d\'email invalide';
                      }
                  } else if (error.error.username) {
                      this.errorMessage = 'Ce nom d\'utilisateur est déjà pris';
                  } else if (error.error.role) {
                      this.errorMessage = 'Veuillez sélectionner un type de compte valide';
                  } else if (error.error.non_field_errors) {
                      this.errorMessage = error.error.non_field_errors[0];
                  } else if (error.status === 400) {
                      this.errorMessage = 'Données invalides. Veuillez vérifier vos informations.';
                  } else if (error.status === 500) {
                      this.errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
                  } else {
                      this.errorMessage = 'Une erreur est survenue lors de l\'inscription';
                  }
              } else {
                  this.errorMessage = 'Erreur de connexion au serveur';
              }
          }
      });
  }
}