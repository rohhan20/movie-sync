import { Movie } from './movie.model';

export interface Session {
  id: string;
  members: string[];
  recommendations: Movie[];
}
