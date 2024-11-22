import { Component } from '@angular/core';
import { SingleReviewComponent } from "../../shared/single-review/single-review.component";
import { CreateReviewComponent } from '../../shared/create-review/create-review.component';
import { PostListComponent } from "../../shared/post-list/post-list.component";

@Component({
  selector: 'app-review-page',
  standalone: true,
  imports: [SingleReviewComponent, CreateReviewComponent, PostListComponent],
  templateUrl: './review-page.component.html',
  styleUrl: './review-page.component.scss'
})
export class ReviewPageComponent {

}
