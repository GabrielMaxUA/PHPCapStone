import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../user';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class Service {
 
baseUrl = "http://localhost/frameBase";

  constructor(private http: HttpClient, private router: Router) {
  
  }

  ngOnInit(): void {
    this.getCustomers();
  }

  login(data: { email: string; password: string }): Observable<any> {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.baseUrl}/login`, data, {headers});
  }

   // Check session status
  checkSession(): Observable<any> {
    return this.http.get(`${this.baseUrl}/check_session`, { withCredentials: true });
  }
  
    // Logout service
  logout(): Observable<any> {
    return this.http.get(`${this.baseUrl}/logout`);
  }

  register(user: User) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<User>(`${this.baseUrl}/register`, user, { headers });
  }
  

  getCustomers(){
    return this.http.get(`${this.baseUrl}/list`).pipe(
      map((response:any) => {
        return response['data'];
      })
    );
  }

  getBio(): Observable<{ bioText: string; mainImage: string }> {
    return this.http.get<{ bioText: string; mainImage: string }>(`${this.baseUrl}/bio`);
  }

  saveBio(bio:string){
    const payload = {bio};
    console.log('Payload being sent', payload);
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });
    return this.http.post(`${this.baseUrl}/bio`, payload, {headers});
  }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post(`${this.baseUrl}/bio`, formData);
  }



}//class