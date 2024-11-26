import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

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
  @ViewChild('monthChart') monthChart!: ElementRef<HTMLCanvasElement>;
  
  stats: ItineraryStatsResponse | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  months: string[] = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  selectedMonth: number | null = null;
  chart: Chart | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.error = null;
    
    this.authService.getUserItinerariesStats().subscribe({
      next: (response: ItineraryStatsResponse) => {
        console.log('Données reçues:', response); // Log des données reçues
        this.stats = response;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
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

  showChartForMonth(month: number): void {
    if (!this.stats) {
      console.error('Statistiques non chargées');
      return;
    }

    this.selectedMonth = month;

    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.monthChart.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Contexte Canvas non disponible');
      return;
    }

    console.log('Contexte Canvas disponible'); // Log pour vérifier le contexte

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Itinéraires'],
        datasets: [{
          label: `Itinéraires pour ${this.getMonthName(month)}`,
          data: [this.stats.itineraries_by_month[month] || 0],
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }
}