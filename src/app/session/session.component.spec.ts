import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SessionComponent } from './session.component';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { MovieService } from '../services/movie.service';
import { of } from 'rxjs';

const authServiceMock = {
  currentUser$: of(null)
};

const sessionServiceMock = {
  getSession: () => of(null),
  joinSession: () => of(undefined)
};

const movieServiceMock = {
  getGenres: () => of([])
};

describe('SessionComponent', () => {
  let component: SessionComponent;
  let fixture: ComponentFixture<SessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SessionComponent,
        RouterTestingModule,
        FormsModule,
        MatSliderModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatSelectModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: MovieService, useValue: movieServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
