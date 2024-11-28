import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DayNavigatorComponent } from '../../shared/day-navigator/day-navigator.component';

interface GeneratePromptResponse {
  generated_text: string;
  message?: string;
  itinerary_id?: number;
}

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DayNavigatorComponent],
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss']
})
export class SearchPageComponent {
  ville: string = '';
  days: number = 1;
  tripType: string = '';
  startDate: string = '';
  budget: number = 0;
  age: number = 0;
  clientName: string = '';
  generatedText: string = '';
  formattedPlan: any;
  isOpen: boolean = true;
  isLoading: boolean = false;
  showResults: boolean = false;
  comments: string = '';
  
  // Propriété pour suivre l'état d'expansion des jours
  expandedDays: boolean[] = [];

  constructor(private authService: AuthService) {}

  toggleDiv(): void {
    this.isOpen = !this.isOpen;
  }

  onSearch(event: Event): void {
    event.preventDefault();
    this.isLoading = true;
    this.showResults = false;

    const requestData = {
      ville: this.ville,
      days: this.days,
      trip_type: this.tripType,
      start_date: this.startDate,
      budget: this.budget,
      client_name: this.clientName,
      age: this.age,
      comments: this.comments
    };

    this.authService.generatePrompt(requestData).subscribe({
      next: (response: GeneratePromptResponse) => {
        this.generatedText = response.generated_text;
        try {
          this.formattedPlan = JSON.parse(this.generatedText);

          // Initialiser les jours comme fermés
          if (this.formattedPlan?.itinerary) {
            this.expandedDays = new Array(this.formattedPlan.itinerary.length).fill(false);
          }
          this.showResults = true;
        } catch (e) {
          console.error('Error parsing JSON:', e);
        }
        this.isLoading = false;
        this.isOpen = false;
      },
      error: (error: Error) => {
        console.error('Search failed', error);
        this.isLoading = false;
      }
    });
  }

  // Méthode pour basculer l'état d'expansion d'une journée
  toggleDay(index: number): void {
    this.expandedDays[index] = !this.expandedDays[index];
  }
}