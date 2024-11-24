import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

interface ItineraryStatsResponse {
  itineraries_by_month: { [key: number]: number };
  total_itineraries_year: number;
  current_month_itineraries: number;
  unique_clients: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: ItineraryStatsResponse | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  months: string[] = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.error = null;
    
    this.authService.getUserItinerariesStats().subscribe({
      next: (response: ItineraryStatsResponse) => {
        this.stats = response;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        // Récupérer le message d'erreur de l'API
        this.error = err.error?.detail || 'Erreur lors du chargement des statistiques';
        console.error('Erreur:', err);
        this.isLoading = false;
      }
    });
  }

  getMonths(): number[] {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  }

  getMonthName(monthNumber: number): string {
    return this.months[monthNumber - 1];
  }

  getCurrentMonthName(): string {
    const currentMonth = new Date().getMonth();
    return this.months[currentMonth];
  }

  formatNumber(num: number): string {
    return num.toLocaleString('fr-FR');
  }
}
