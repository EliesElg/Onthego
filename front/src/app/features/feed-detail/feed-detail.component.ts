import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule, DatePipe } from '@angular/common';
import jsPDF from 'jspdf';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

interface ItineraryDetailResponse {
  id: number;
  client_name: string;
  place: string;
  trip_type: string;
  budget: number;
  start_date: string;
  created_at: string;
  itinerary_days: Day[];
  user_id: number; // Ajout de l'ID de l'utilisateur propriétaire

}

interface Day {
  day: number;
  date: string;
  activities: Activity[];
}

interface Activity {
  id: number;
  lieu: string;
  type: string;
  horaires: string;
  budget: number;
}

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],  
  templateUrl: './feed-detail.component.html',
  styleUrls: ['./feed-detail.component.scss'],
  providers: [DatePipe],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})

export class FeedDetailComponent implements OnInit {
  
  itinerary: ItineraryDetailResponse | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  expandedDays: { [day: number]: boolean } = {};
  showShareForm: boolean = false;
  currentUserId: number | null = null;
  shareText: string = '';
  userRole: string | null = null;
  // Constantes pour le PDF
  private readonly PAGE_WIDTH = 210;  // A4 width in mm
  private readonly PAGE_HEIGHT = 297; // A4 height in mm
  private readonly MARGIN = 20;
  private readonly CONTENT_WIDTH = this.PAGE_WIDTH - (2 * this.MARGIN);

  constructor(
    private datePipe: DatePipe,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  goToList(): void {
    this.router.navigate(['/trips']);
  }

  formatDate(date: string | null): string {
    return date ? this.datePipe.transform(date, 'dd/MM/yyyy') || '' : '';
  }

  ngOnInit(): void {
    const itineraryId = Number(this.route.snapshot.paramMap.get('id'));
    if (itineraryId) {
      this.loadItineraryDetail(itineraryId);
    }
    this.checkUserRole();
  }

  checkUserRole(): void {
    this.authService.whoami().subscribe({
      next: (response) => {
        if (response) {
          this.userRole = response.role;
          this.currentUserId = response.id; // Stocke l'ID de l'utilisateur connecté
        }
      },
      error: () => {
        this.userRole = null;
        this.currentUserId = null;
      }
    });
  }

  loadItineraryDetail(itineraryId: number): void {
    this.isLoading = true;
    this.error = null;
  
    this.authService.getItineraryDetail(itineraryId).subscribe({
      next: (response) => {
        this.itinerary = response;
        this.isLoading = false;
        this.initializeSequentialDays();
        this.itinerary.itinerary_days.forEach(day => {
          this.expandedDays[day.day] = false;
        });
      },
      error: (err) => {
        if (err.status === 404) {
          this.error = 'Cet itinéraire n\'existe pas ou n\'est pas partagé';
        } else {
          this.error = 'Erreur lors du chargement des détails de l\'itinéraire';
        }
        this.isLoading = false;
        console.error('Erreur:', err);
      }
    });
  }

  initializeSequentialDays(): void {
    if (this.itinerary?.itinerary_days) {
      this.itinerary.itinerary_days.forEach((day, index) => {
        day.day = index + 1;
      });
    }
  }

  toggleDay(dayNumber: number): void {
    this.expandedDays[dayNumber] = !this.expandedDays[dayNumber];
  }
    // Open the share form modal
    openShareForm(): void {
      this.showShareForm = true;
    }
  
    // Close the share form modal
    closeShareForm(): void {
      this.showShareForm = false;
      this.shareText = '';
    }
  
    // Handle form submission
    shareItinerary(event: Event): void {
      event.preventDefault();
      if (!this.itinerary) return;
  
      const postData = {
        itinerary_id: this.itinerary.id,
        text: this.shareText
      };
  
      this.authService.shareItinerary(postData).subscribe({
        next: (response) => {
          this.closeShareForm();
          alert('Votre itinéraire a été partagé sur le fil d\'actualité.');
        },
        error: (error) => {
          console.error('Erreur lors du partage de l\'itinéraire:', error);
          alert('Une erreur est survenue lors du partage de votre itinéraire.');
        }
      });
    }
  
  exportToPDF(): void {
    if (!this.itinerary) return;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    let yPosition = this.MARGIN;

    // En-tête
    pdf.setFillColor(51, 122, 183);
    pdf.rect(0, 0, this.PAGE_WIDTH, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    yPosition = 15;
    pdf.text('Détails de l\'itinéraire', this.PAGE_WIDTH / 2, yPosition, { align: 'center' });
    
    pdf.setFontSize(16);
    yPosition += 10;
    pdf.text(`Pour ${this.itinerary.client_name}`, this.PAGE_WIDTH / 2, yPosition, { align: 'center' });

    // Informations générales
    yPosition = 50;
    this.addInfoSection(pdf, yPosition, [
      { label: 'Destination', value: this.itinerary.place },
      { label: 'Type de voyage', value: this.itinerary.trip_type },
      { label: 'Budget total', value: `${this.itinerary.budget}€` },
      { label: 'Date de départ', value: this.itinerary.start_date }
    ]);

    // Jours et activités
    yPosition = 100;
    this.itinerary.itinerary_days.forEach((day) => {
      if (yPosition > this.PAGE_HEIGHT - 50) {
        pdf.addPage();
        yPosition = this.MARGIN;
      }

      // Jour header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(this.MARGIN, yPosition, this.CONTENT_WIDTH, 10, 'F');
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text(`Jour ${day.day} - ${this.formatDate(day.date)}`, this.MARGIN + 5, yPosition + 7);
      
      yPosition += 15;

      // Activités
      day.activities.forEach(activity => {
        if (yPosition > this.PAGE_HEIGHT - 30) {
          pdf.addPage();
          yPosition = this.MARGIN;
        }

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text(activity.lieu, this.MARGIN, yPosition);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text(activity.type, this.MARGIN, yPosition + 5);
        
        const horaireWidth = pdf.getTextWidth(activity.horaires);
        const budgetText = `${activity.budget}€`;
        const budgetWidth = pdf.getTextWidth(budgetText);
        
        pdf.text(activity.horaires, this.PAGE_WIDTH - this.MARGIN - horaireWidth, yPosition);
        pdf.text(budgetText, this.PAGE_WIDTH - this.MARGIN - budgetWidth, yPosition + 5);

        yPosition += 15;
      });

      yPosition += 5;
    });

    // Pied de page
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    const footerText = `Généré le ${new Date().toLocaleDateString('fr-FR')}`;
    pdf.text(footerText, this.PAGE_WIDTH / 2, this.PAGE_HEIGHT - 10, { align: 'center' });

    // Sauvegarder le PDF
    pdf.save(`Itinéraire_${this.itinerary.client_name}_${new Date().toLocaleDateString('fr-FR')}.pdf`);
  }

  private addInfoSection(pdf: jsPDF, startY: number, items: Array<{label: string, value: string}>): number {
    let yPos = startY;
    const colWidth = this.CONTENT_WIDTH / 2;
    
    items.forEach((item, index) => {
      const xPos = this.MARGIN + (index % 2 * colWidth);
      
      if (index % 2 === 0 && index > 0) {
        yPos += 25;
      }

      pdf.setFillColor(245, 245, 245);
      pdf.roundedRect(xPos, yPos, colWidth - 5, 20, 2, 2, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(item.label, xPos + 5, yPos + 7);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(item.value, xPos + 5, yPos + 15);
    });

    return yPos + 25;
  }
}