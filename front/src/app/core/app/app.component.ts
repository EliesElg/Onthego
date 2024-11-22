import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink, RouterOutlet } from '@angular/router';


// Composants principaux
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';

// Fin composants principaux

// Composant SearchPage
import { DayPlanComponent } from '../../shared/day-plan/day-plan.component';
import { DayNavigatorComponent } from '../../shared/day-navigator/day-navigator.component';

// Composant ReviewPage
import { ReviewPageComponent } from '../../features/review-page/review-page.component';
import { SingleReviewComponent } from '../../shared/single-review/single-review.component';
import { CreateReviewComponent } from '../../shared/create-review/create-review.component';
import { PostListComponent } from '../../shared/post-list/post-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,  // Assurez-vous que HttpClientModule est ici
    RouterLink,
    RouterOutlet,

    // Composants principaux
    HeaderComponent,
    FooterComponent,

    // Composant SearchPage
    DayPlanComponent,
    DayNavigatorComponent,

    // Composant ReviewPage
    ReviewPageComponent,
    SingleReviewComponent,
    CreateReviewComponent,
    PostListComponent
    
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'front';
}
