// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { Service } from './service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private service: Service, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.service.checkSession().pipe(
      map(response => {
        if (response.authenticated) {
          this.service.startHeartbeat();
          return true;
        }
        this.router.navigate(['/signin']);
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/signin']);
        return of(false);
      })
    );
  }
}