import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { ProfileComponent } from './profile.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { UserService } from '../services/user.service';
import { MovieService } from '../services/movie.service';
import { of } from 'rxjs';

const userServiceMock = {
  getUserProfile: () => of(null),
  getWatchedMovies: () => of([])
};

const movieServiceMock = {
  getGenres: () => of([]),
  getRecommendations: () => of([])
};

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProfileComponent,
        MatSliderModule,
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatAutocompleteModule
      ],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: MovieService, useValue: movieServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
