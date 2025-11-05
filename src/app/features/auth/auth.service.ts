import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { User } from "../../models/user.model";

Injectable({providedIn: 'root'})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

    login() {
        this.currentUserSubject.next({uid: 'xyz', email: 'example@gmail.com', displayName: 'Example User', watchedMovies: []});
    }

    logout() {
        this.currentUserSubject.next(null);
    }
}