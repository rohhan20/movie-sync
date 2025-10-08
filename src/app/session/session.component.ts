import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { Movie } from '../models/movie.model';
import { MovieService } from '../services/movie.service';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule
  ],
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit {
  sessionId$: Observable<string | null>;
  recommendations$: Observable<Movie[]>;

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService
  ) {
    this.sessionId$ = of(null);
    this.recommendations$ = of([]);
  }

  ngOnInit(): void {
    this.sessionId$ = this.route.paramMap.pipe(
      switchMap(params => of(params.get('id')))
    );

    // In a real app, you'd use the session ID to get recommendations for that group.
    // For this MVP, we'll just get some general recommendations.
    this.recommendations$ = this.movieService.getRecommendations([]);
  }
}