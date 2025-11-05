import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { HomeComponent } from './home.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { MovieService } from '../services/movie.service';
import { UserService } from '../services/user.service';
import { of } from 'rxjs';

const authServiceMock = {
  currentUser$: of(null)
};

const sessionServiceMock = {
  createSession: () => of('123')
};

const movieServiceMock = {
  getAllMovies: () => of([]),
  searchMovies: () => of([])
};

const userServiceMock = {
  getWatchedMovies: () => of([])
};

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent, MatSliderModule, NoopAnimationsModule, RouterTestingModule, FormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: MovieService, useValue: movieServiceMock },
        { provide: UserService, useValue: userServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
