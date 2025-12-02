import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        // Try to get user data from Firestore, otherwise use auth data
        const userDoc = doc(this.firestore, `users/${user.uid}`);
        const userSnap = await getDoc(userDoc);
        
        if (userSnap.exists()) {
          const userData = userSnap.data() as User;
          this.currentUserSubject.next(userData);
        } else {
          // Create user document if it doesn't exist
          const newUser: User = {
            uid: user.uid,
            email: user.email!,
            displayName: user.displayName || '',
            watchedMovies: []
          };
          await setDoc(userDoc, newUser);
          this.currentUserSubject.next(newUser);
        }
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  login(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.auth, email, password).then(() => ({ success: true })).catch(error => ({ success: false, error })));
  }

  signInWithGoogle(): Observable<any> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider).then(async (result) => {
      const user = result.user;
      const userDoc = doc(this.firestore, `users/${user.uid}`);
      const userSnap = await getDoc(userDoc);
      
      if (!userSnap.exists()) {
        await setDoc(userDoc, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          watchedMovies: []
        });
      }
      return { success: true };
    }).catch(error => ({ success: false, error })));
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
