import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.interface';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe]
})
export class FeedComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();
  private userId!: number; // Utilisation de l'Assertion de Définition

  constructor(private authService: AuthService) {
    // Récupérer l'ID utilisateur via whoami
    this.authService.whoami().subscribe({
      next: (user) => {
        this.userId = user.id;
        this.loadFeed();
      },
      error: (error) => {
        console.error('Erreur whoami:', error);
      }
    });
  }

  ngOnInit(): void {
    // Le loadFeed est appelé après avoir obtenu le userId
  }

  likePost(postId: number): void {
    const postIndex = this.posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const currentPost = this.posts[postIndex];
    const wasLiked = this.isLiked(currentPost);
    const previousState = { ...currentPost };

    // Mise à jour optimiste
    const updatedPost = { ...currentPost };
    if (wasLiked) {
      updatedPost.likes = updatedPost.likes.filter(id => id !== this.userId);
    } else {
      updatedPost.likes = [...updatedPost.likes, this.userId];
    }
    this.posts[postIndex] = updatedPost;

    this.authService.likePost(postId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Mise à jour avec les données du serveur
          if (response && response.post) {
            this.posts[postIndex] = response.post;
          }
        },
        error: (error) => {
          console.error('Erreur like:', error);
          this.posts[postIndex] = previousState;
        }
      });
  }

  isLiked(post: Post): boolean {
    return !!this.userId && post.likes && Array.isArray(post.likes) && post.likes.includes(this.userId);
  }

  loadFeed(): void {
    this.loading = true;
    this.error = null;

    this.authService.getFeed()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (posts) => {
          this.posts = posts.map(post => ({
            ...post,
            likes: Array.isArray(post.likes) ? post.likes : []
          }));
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erreur lors du chargement du feed';
          this.loading = false;
          console.error('Erreur feed:', error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}