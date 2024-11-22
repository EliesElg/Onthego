import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReviewService } from '../../services/review.service';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';



@Component({
  selector: 'app-create-review',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-review.component.html',
  styleUrl: './create-review.component.scss'
})
export class CreateReviewComponent {
  reviewForm: FormGroup;
  

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService,
    private router: Router

  ) {
    this.reviewForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      destination: ['', Validators.required],
      travel_date: ['', Validators.required],
      itinerary: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.reviewForm.valid) {
      this.reviewService.createPost(this.reviewForm.value).subscribe({
        next: (response) => {
          console.log('Review created successfully:', response);
          this.router.navigate(['/review']).then(() => {
            window.location.reload();  // Recharger la page après la navigation pour afficher le nouvel avis
          });
        },
        error: (error) => {
          console.error('Error creating review:', error);
        }
      });
    }
  }
}
