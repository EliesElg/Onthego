import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import { RouterLink } from '@angular/router'; // Importer RouterLink


@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [HttpClientModule, FormsModule,RouterLink],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {

  username: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        localStorage.setItem('authToken', response.access_token);
        window.location.href = '/'; // Force le rechargement complet
      },
      error: (error) => {
        console.error('Login failed', error);
      }
    });
  }
}
