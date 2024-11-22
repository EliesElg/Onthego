import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';


interface Itinerary {
  id: number;
  client_name: string;
  place: string;
  trip_type: string;
  budget: number;
  start_date: string;
  created_at: string;
}

@Component({
  selector: 'app-itinerary-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.scss']
})
export class TripsComponent implements OnInit {
  itineraries: Itinerary[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadItineraries();
  }

  loadItineraries(): void {
    this.isLoading = true;
    this.error = null;

    this.authService.getUserItinerariesList().subscribe({
      next: (response: Itinerary[]) => {
        this.itineraries = response;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des itinéraires:', err);
        this.error = 'Erreur lors du chargement des itinéraires';
        this.isLoading = false;
      }
    });
  }

  viewDetails(itineraryId: number): void {
    this.router.navigate(['/itinerary', itineraryId]);
  }
}