import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePageComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    this.passwordForm = this.fb.group({
      current_password: ['', Validators.required],
      new_password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.authService.getUserProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue(profile);
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement du profil';
        this.isLoading = false;
      },
    });
  }

  onUpdateProfile(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.authService.updateUserProfile(this.profileForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          alert('Profil mis à jour avec succès');
        },
        error: () => {
          this.error = 'Erreur lors de la mise à jour du profil';
          this.isLoading = false;
        },
      });
    }
  }

  onChangePassword(): void {
    if (this.passwordForm.valid) {
      this.isLoading = true;
      this.authService.changePassword(this.passwordForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          alert('Mot de passe mis à jour avec succès');
          this.passwordForm.reset();
        },
        error: () => {
          this.error = 'Erreur lors de la mise à jour du mot de passe';
          this.isLoading = false;
        },
      });
    }
  }
}