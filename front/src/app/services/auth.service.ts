import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Post } from '../models/post.interface';

interface AuthResponse {
  access_token: string;
  user?: {
    username: string;
    email: string;
  };
}

interface GeneratePromptResponse {
  generated_text: string;
  message?: string;
  itinerary_id?: number;
}

interface ItineraryStatsResponse {
  itineraries_by_month: { [key: number]: number };
  total_itineraries_year: number;
  current_month_itineraries: number;
  unique_clients: number;
}

interface Itinerary {
  id: number;
  client_name: string;
  place: string;
  trip_type: string;
  budget: number;
  start_date: string;
  created_at: string;
}

interface ItineraryDetailResponse {
  id: number;
  client_name: string;
  place: string;
  trip_type: string;
  budget: number;
  start_date: string;
  created_at: string;
  itinerary_days: Day[];
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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiBaseUrl}`; 

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { username, password });
  }

  register(username: string, password: string, email: string, role: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/signup`, { 
      username, 
      password, 
      email,
      role
    });
  }

  generatePrompt(data: any): Observable<GeneratePromptResponse> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<GeneratePromptResponse>(`${this.baseUrl}/generate_prompt`, data, { headers });
  }

  getUserItinerariesStats(): Observable<ItineraryStatsResponse> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return throwError(() => new Error('No token found'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<ItineraryStatsResponse>(`${this.baseUrl}/dashboard`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        // Gérer les erreurs HTTP
        if (error.status === 403) {
          // Erreur 403 (forbidden), probablement un problème de rôle
          return throwError(() => new Error(error.error?.detail || 'Accès refusé'));
        } else if (error.status === 401) {
          // Erreur 401 (unauthorized), token invalide ou expiré
          return throwError(() => new Error('Authentification requise. Veuillez vous reconnecter.'));
        } else if (error.status === 0) {
          // Problème de réseau ou de serveur
          return throwError(() => new Error('Impossible de se connecter au serveur.'));
        } else {
          // Autres erreurs
          return throwError(() => new Error(error.message || 'Une erreur inconnue s\'est produite.'));
        }
      })
    );
  }

  whoami(): Observable<any> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return new Observable(observer => observer.error('No token found'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.baseUrl}/whoami`, { headers });
  }

  shareItinerary(postData: { itinerary_id: number; text: string }): Observable<Post> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return throwError(() => new Error('Aucun token trouvé'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<Post>(`${this.baseUrl}/share_itinerary/`, postData, { headers });
  }

  getFeed(): Observable<Post[]> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return throwError(() => new Error('Aucun token trouvé'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Post[]>(`${this.baseUrl}/get_feed/`, { headers });
  }
  likePost(postId: number): Observable<{message: string, post: Post}> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return throwError(() => new Error('Aucun token trouvé'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<{message: string, post: Post}>(
      `${this.baseUrl}/like_post/`, 
      { post_id: postId }, 
      { headers }
    );
  }


  isLoggedIn(): Observable<boolean> {
    return this.whoami().pipe(
      map(user => !!user),
      catchError(() => of(false))
    );
  }

  logout() {
    localStorage.removeItem('authToken');
  }

  getUserItinerariesList(): Observable<Itinerary[]> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return throwError(() => new Error('No token found'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Itinerary[]>(`${this.baseUrl}/get_itineraries`, { headers });
  }

  getItineraryDetail(itineraryId: number): Observable<ItineraryDetailResponse> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return throwError(() => new Error('No token found'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<ItineraryDetailResponse>(`${this.baseUrl}/itineraries/${itineraryId}`, { headers })
      .pipe(
        catchError((error) => {
          console.error('Erreur lors de la récupération des détails de l\'itinéraire:', error);
          return throwError(() => new Error('Erreur lors de la récupération des détails de l\'itinéraire'));
        })
      );
  }

  getUserProfile(): Observable<any> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return throwError(() => new Error('Aucun token trouvé'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.baseUrl}/profile/`, { headers }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération du profil:', error);
        return throwError(() => new Error('Erreur lors de la récupération du profil'));
      })
    );
  }

  updateUserProfile(profileData: any): Observable<any> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return throwError(() => new Error('Aucun token trouvé'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${this.baseUrl}/userupdate`, profileData, { headers }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la mise à jour du profil:', error);
        return throwError(() => new Error('Erreur lors de la mise à jour du profil'));
      })
    );
  }

  changePassword(passwordData: any): Observable<any> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return throwError(() => new Error('Aucun token trouvé'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${this.baseUrl}/profile/change-password/`, passwordData, { headers }).pipe(
      catchError((error) => {
        console.error('Erreur lors du changement de mot de passe:', error);
        return throwError(() => new Error('Erreur lors du changement de mot de passe'));
      })
    );
  }
}