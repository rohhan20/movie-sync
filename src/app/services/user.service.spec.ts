import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { of } from 'rxjs';

describe('UserService', () => {
  let service: UserService;
  let firestoreSpy: jasmine.SpyObj<Firestore>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const fsSpy = jasmine.createSpyObj('Firestore', ['collection', 'doc', 'collectionData']);
    const asSpy = jasmine.createSpyObj('AuthService', ['currentUser$']);

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: Auth, useValue: {} },
        { provide: Firestore, useValue: fsSpy },
        { provide: AuthService, useValue: asSpy }
      ]
    });
    service = TestBed.inject(UserService);
    firestoreSpy = TestBed.inject(Firestore) as jasmine.SpyObj<Firestore>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    (authServiceSpy.currentUser$ as any).and.returnValue(of({ uid: '123' } as any));
    (firestoreSpy.collection as any).and.returnValue({} as any);
    (firestoreSpy.doc as any).and.returnValue({} as any);
    (firestoreSpy.collectionData as any).and.returnValue(of([]));
    expect(service).toBeTruthy();
  });
});
