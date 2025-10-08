import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() { }

  login(email: string, password: string) {
    // In a real app, you'd call an API. Here, we'll create a mock user.
    const mockUser: User = {
      uid: '123',
      email: email,
      displayName: 'Test User',
      watchedMovies: []
    };
    this.currentUserSubject.next(mockUser);
    return of({ success: true });
  }

  logout() {
    this.currentUserSubject.next(null);
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
}