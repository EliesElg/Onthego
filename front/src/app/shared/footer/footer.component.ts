import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  isLoggedIn = false;
  username: string | null = null;
  userRole: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  checkLoginStatus(): void {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.authService.whoami().subscribe({
        next: (response) => {
          if (response && response.username) {
            this.isLoggedIn = true;
            this.username = response.username;
            this.userRole = response.role;
          }
        },
        error: () => {
          this.isLoggedIn = false;
          this.username = '';
          this.userRole = null;
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.username = '';
    this.router.navigate(['/login']);
  }
}