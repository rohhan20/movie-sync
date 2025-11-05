import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from '@angular/fire/auth';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        const a: User = {
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName || '',
          watchedMovies: []
        };
        this.currentUserSubject.next(a);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  login(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  signup(name: string, email: string, password: string): Observable<void> {
    return from(createUserWithEmailAndPassword(this.auth, email, password).then(async (userCredential) => {
      await updateProfile(userCredential.user, { displayName: name });
      const userDoc = doc(this.firestore, `users/${userCredential.user.uid}`);
      await setDoc(userDoc, {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: name,
        watchedMovies: []
      });
    }));
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
}
