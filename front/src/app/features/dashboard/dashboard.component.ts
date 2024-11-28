import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Color, ScaleType } from '@swimlane/ngx-charts';

interface ItineraryStatsResponse {
  itineraries_by_month: { [key: string]: number };
  total_itineraries_year: number;
  current_month_itineraries: number;
  unique_clients: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
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
  
  chartData: any[] = [];
  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#2563eb', '#0891b2', '#38bdf8', '#7dd3fc'] // Dégradés bleu/cyan
  };
  
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.error = null;
    
    this.authService.getUserItinerariesStats().subscribe({
      next: (response: ItineraryStatsResponse) => {
        console.log('Données reçues:', response);
        this.stats = response;
        this.prepareChartData();
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.detail || 'Erreur lors du chargement des statistiques';
        console.error('Erreur:', err);
        this.isLoading = false;
      }
    });
  }

  prepareChartData(): void {
    if (!this.stats || !this.stats.itineraries_by_month) {
      this.chartData = [];
      return;
    }

    this.chartData = Object.entries(this.stats.itineraries_by_month)
      .map(([month, count]) => ({
        name: this.months[parseInt(month) - 1],
        value: count || 0
      }))
      .sort((a, b) => this.months.indexOf(a.name) - this.months.indexOf(b.name));
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