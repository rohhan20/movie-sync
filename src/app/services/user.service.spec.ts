import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { of } from 'rxjs';
import * as firestore from '@angular/fire/firestore';

const authServiceMock = {
  currentUser$: of({ uid: '123' }),
  currentUserValue: { uid: '123' }
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: {} },
        { provide: Firestore, useValue: {} },
        { provide: AuthService, useValue: authServiceMock }
      ]
    });
    spyOn(firestore, 'collection').and.returnValue({} as any);
    spyOn(firestore, 'doc').and.returnValue({} as any);
    spyOn(firestore, 'collectionData').and.returnValue(of([]));
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
