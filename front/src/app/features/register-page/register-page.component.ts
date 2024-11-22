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
  imports: [HttpClientModule, FormsModule, CommonModule,RouterLink], 
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent {
  firstName: string = '';
  lastName: string = '';
  username: string = '';
  email: string = '';
  password: string = '';
  passwordConfirmation: string = '';
  RegisterSuccess: boolean = false;

  constructor(
    private authService: AuthService,
    public router: Router
  ) {}

  onRegister(event: Event, form: NgForm): void {
    console.log("-------- entrée dans onRegister");
    event.preventDefault(); // Empêche la soumission par défaut du formulaire
    if (form.invalid) {
      console.error('Form is invalid');
      return;
    }
    if (this.password !== this.passwordConfirmation) {
      console.error('Passwords do not match');
      return;
    }
    this.authService.register(this.username, this.password, this.email).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        this.router.navigate(['/login']); // Redirigez l'utilisateur après une inscription réussie
      },
      error: (error) => {
        console.error('Registration failed', error);
      }
    });
  }
}