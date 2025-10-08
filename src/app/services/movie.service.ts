import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Movie } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private mockMovies: Movie[] = [
    { id: '1', title: 'Inception', description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg' },
    { id: '2', title: 'The Dark Knight', description: 'When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.', posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
    { id: '3', title: 'Interstellar', description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.', posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
    { id: '4', title: 'Parasite', description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.', posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg' },
    { id: '5', title: 'The Matrix', description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.', posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
    { id: '6', title: 'Pulp Fiction', description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.', posterUrl: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' }
  ];

  constructor() { }

  getAllMovies(): Observable<Movie[]> {
    return of(this.mockMovies);
  }

  getMovieById(id: string): Observable<Movie | undefined> {
    return of(this.mockMovies.find(m => m.id === id));
  }

  searchMovies(query: string): Observable<Movie[]> {
    const lowerCaseQuery = query.toLowerCase();
    return this.getAllMovies().pipe(
      map(movies => movies.filter(movie => movie.title.toLowerCase().includes(lowerCaseQuery)))
    );
  }

  getRecommendations(userIds: string[]): Observable<Movie[]> {
    // In a real app, this would be complex logic. Here, we'll just return some movies.
    return of(this.mockMovies.slice(0, 3));
  }
}