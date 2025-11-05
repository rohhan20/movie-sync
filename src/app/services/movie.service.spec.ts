import { TestBed } from '@angular/core/testing';
import { MovieService } from './movie.service';
import { Firestore } from '@angular/fire/firestore';
import * as firestore from '@angular/fire/firestore';

describe('MovieService', () => {
  let service: MovieService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Firestore, useValue: {} }
      ]
    });
    spyOn(firestore, 'collection').and.returnValue({} as any);
    spyOn(firestore, 'getDocs').and.returnValue(Promise.resolve({ docs: [] } as any));
    service = TestBed.inject(MovieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
