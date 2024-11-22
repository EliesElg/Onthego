import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

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

  register(username: string, password: string, email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/signup`, { 
      username, 
      password, 
      email 
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
    return this.http.get<ItineraryStatsResponse>(`${this.baseUrl}/dashboard`, { headers });
  }

  whoami(): Observable<any> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return new Observable(observer => observer.error('No token found'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.baseUrl}/whoami`, { headers });
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