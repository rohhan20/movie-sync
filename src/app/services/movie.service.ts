import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Movie } from '../models/movie.model';
import { environment } from '../../environments/environment';

interface TmdbResponse {
  results: Movie[];
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private http = inject(HttpClient);
  private apiUrl = 'https://api.themoviedb.org/3';
  private apiKey = environment.tmdb.apiKey;

  constructor() { }

  private getBaseParams(): HttpParams {
    return new HttpParams().set('api_key', this.apiKey);
  }

  getPopularMovies(): Observable<Movie[]> {
    const params = this.getBaseParams();
    return this.http.get<TmdbResponse>(`${this.apiUrl}/movie/popular`, { params }).pipe(
      map(response => response.results)
    );
  }

  searchMovies(query: string, filters: { genre?: number | null, year?: number | null, rating?: number | null }, watchedMovieIds: number[] = []): Observable<Movie[]> {
    let params = this.getBaseParams().set('query', query);

    if (filters.genre) {
      params = params.set('with_genres', filters.genre.toString());
    }
    if (filters.year) {
      params = params.set('primary_release_year', filters.year.toString());
    }
    if (filters.rating) {
      params = params.set('vote_average.gte', filters.rating.toString());
    }

    const endpoint = filters.genre || filters.year || filters.rating ? '/discover/movie' : '/search/movie';

    return this.http.get<TmdbResponse>(`${this.apiUrl}${endpoint}`, { params }).pipe(
      map(response => response.results.filter(movie => !watchedMovieIds.includes(movie.id)))
    );
  }

  getRecommendations(userIds: string[], filters: { genre?: number | null, year?: number | null, rating?: number | null }, watchedMovieIds: number[] = []): Observable<Movie[]> {
    let params = this.getBaseParams();

    if (filters.genre) {
      params = params.set('with_genres', filters.genre.toString());
    }
    if (filters.year) {
      params = params.set('primary_release_year', filters.year.toString());
    }
    if (filters.rating) {
      params = params.set('vote_average.gte', filters.rating.toString());
    }

    return this.http.get<TmdbResponse>(`${this.apiUrl}/discover/movie`, { params }).pipe(
      map(response => response.results.filter(movie => !watchedMovieIds.includes(movie.id)).slice(0, 10))
    );
  }

  getGenres(): Observable<{ id: number, name: string }[]> {
    const params = this.getBaseParams();
    return this.http.get<{ genres: { id: number, name: string }[] }>(`${this.apiUrl}/genre/movie/list`, { params }).pipe(
      map(response => response.genres)
    );
  }
}
