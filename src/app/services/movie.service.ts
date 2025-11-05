import { Injectable, inject } from '@angular/core';
import { Firestore, collection, getDocs, doc, getDoc, writeBatch, query, where } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Movie } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private firestore: Firestore = inject(Firestore);
  private moviesCollection = collection(this.firestore, 'movies');
  private mockMovies: Omit<Movie, 'id'>[] = [
    { title: 'Inception', description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', genre: 'Sci-Fi', year: 2010, rating: 8.8 },
    { title: 'The Dark Knight', description: 'When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.', posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', genre: 'Action', year: 2008, rating: 9.0 },
    { title: 'Interstellar', description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.', posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', genre: 'Sci-Fi', year: 2014, rating: 8.6 },
    { title: 'Parasite', description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.', posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', genre: 'Thriller', year: 2019, rating: 8.6 },
    { title: 'The Matrix', description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.', posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', genre: 'Sci-Fi', year: 1999, rating: 8.7 },
    { title: 'Pulp Fiction', description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.', posterUrl: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', genre: 'Crime', year: 1994, rating: 8.9 }
  ];

  constructor() {
    this.seedMovies();
  }

  async seedMovies() {
    const moviesSnapshot = await getDocs(this.moviesCollection);
    if (moviesSnapshot.empty) {
      const batch = writeBatch(this.firestore);
      this.mockMovies.forEach(movie => {
        const docRef = doc(this.moviesCollection);
        batch.set(docRef, movie);
      });
      await batch.commit();
    }
  }

  getAllMovies(): Observable<Movie[]> {
    return from(getDocs(this.moviesCollection)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movie)))
    );
  }

  getMovieById(id: string): Observable<Movie | undefined> {
    const movieDoc = doc(this.moviesCollection, id);
    return from(getDoc(movieDoc)).pipe(
      map(docSnap => docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Movie) : undefined)
    );
  }

  searchMovies(queryText: string, watchedMovieIds: string[] = []): Observable<Movie[]> {
    const lowerCaseQuery = queryText.toLowerCase();
    return this.getAllMovies().pipe(
      map(movies => movies.filter(movie =>
        movie.title.toLowerCase().includes(lowerCaseQuery) && !watchedMovieIds.includes(movie.id)
      ))
    );
  }

  getRecommendations(userIds: string[], watchedMovieIds: string[] = []): Observable<Movie[]> {
    // This mock logic will be replaced with a more sophisticated recommendation algorithm in a real app.
    return this.getAllMovies().pipe(
      map(movies => {
        const availableMovies = movies.filter(movie => !watchedMovieIds.includes(movie.id));
        return availableMovies.slice(0, 5); // Return a subset of available movies as recommendations
      })
    );
  }
}
