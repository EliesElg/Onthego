import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  username: string | null = null;
  isMobileMenuOpen = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  checkLoginStatus(): void {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.authService.getUserProfile().subscribe({
        next: (response) => {
          if (response && response.username) {
            this.isLoggedIn = true;
            this.username = response.username;
          }
        },
        error: () => {
          this.isLoggedIn = false;
          this.username = '';
        }
      });
    } else {
      this.isLoggedIn = false;
      this.username = '';
    }
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.username = '';
    this.router.navigate(['/login']);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}