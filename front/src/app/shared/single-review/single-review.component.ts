import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService } from '../../services/image.service';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-single-review',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './single-review.component.html',
  styleUrls: ['./single-review.component.scss']
})
export class SingleReviewComponent implements OnInit {
  posts: any[] = [];

  imageUrl: string | null = null;
  destinationimage: string = 'Los Angeles';

  constructor(
    private imageService: ImageService,
    private reviewService: ReviewService
  ) {}

  ngOnInit() {
    this.loadPosts();
    this.loadImage();
  }

  loadImage() {
    this.imageService.fetchImageForActivity(this.destinationimage).subscribe(
      imageUrl => this.imageUrl = imageUrl,
      error => console.error('Erreur lors de la récupération de l\'image Unsplash:', error)
    );
  }

  loadPosts() {
    this.reviewService.getPosts().subscribe(
      data => {
        this.posts = data;
      },
      error => {
        console.error('Erreur lors de la récupération des posts:', error);
      }
    );
  }

}
