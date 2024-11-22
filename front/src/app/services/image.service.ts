import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private accessKey = 'H7IYKYFj00aiylXzmrMYRjDKHPw7S9_s_Yl40pegSic';
  private apiUrl = 'https://api.unsplash.com/search/photos';

  constructor(private http: HttpClient) { }

  fetchImageForActivity(keywords: string): Observable<string | null> {
    const url = `${this.apiUrl}?page=1&query=${encodeURIComponent(keywords)}&client_id=${this.accessKey}`;

    return this.http.get<any>(url).pipe(
      map(response => {
        if (response.results.length > 0) {
          return response.results[0].urls.small;
        }
        return null;
      })
    );
  }
}
