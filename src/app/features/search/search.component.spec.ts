import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { SearchComponent } from './search.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MovieService } from '../../services/movie.service';
import { UserService } from '../../services/user.service';
import { of } from 'rxjs';

const movieServiceMock = {
  getAllMovies: () => of([]),
  searchMovies: () => of([])
};

const userServiceMock = {
  getWatchedMovies: () => of([])
};

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchComponent, MatSliderModule, NoopAnimationsModule, FormsModule],
      providers: [
        { provide: MovieService, useValue: movieServiceMock },
        { provide: UserService, useValue: userServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
