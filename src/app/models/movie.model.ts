export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  genre_ids: number[];
  release_date: string;
  vote_average: number;
}
