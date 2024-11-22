import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../../services/review.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './post-list.component.html',
  styleUrl: './post-list.component.scss'
})
export class PostListComponent implements OnInit {
  posts: any[] = [];

  constructor(private reviewService: ReviewService) { }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts() {
    this.reviewService.getPosts().subscribe(data => {
      this.posts = data;
    }, error => {
      console.error('Erreur lors du chargement des posts:', error);
    });
  }
}