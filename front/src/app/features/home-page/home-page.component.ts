import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  isLoggedIn = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Vérifier si un token existe
    const token = localStorage.getItem('authToken');
    this.isLoggedIn = !!token;

    // Ou utiliser le service d'authentification si disponible
    this.authService.whoami().subscribe({
      next: (response) => {
        if (response && response.user) {
          this.isLoggedIn = true;
        }
      },
      error: () => {
        this.isLoggedIn = false;
      }
    });
  }
}