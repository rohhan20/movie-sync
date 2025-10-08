import { Movie } from './movie.model';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  watchedMovies: Movie[];
}