import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../Models/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userSubject: BehaviorSubject<User | null>; // Tracks the current user
  public user$: Observable<User | null>; // Observable for components to subscribe to
  
  constructor() {
    // Initialize with no user logged in
    this.userSubject = new BehaviorSubject<User | null>(null);
    this.user$ = this.userSubject.asObservable();
  }

  // Update the current user
  setUser(user: User): void {
    this.userSubject.next(user);
  }

  // Clear the current user
  clearUser(): void {
    this.userSubject.next(null);
  }

  // Get the current user (not observable)
  getUser(): User | null {
    return this.userSubject.value;
  }
}
