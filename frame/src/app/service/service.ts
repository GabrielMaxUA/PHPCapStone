// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { User } from '../user';
// import { map, Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })

// export class Service {
 
// baseUrl = "http://localhost/frameBase";

//   constructor(private http: HttpClient, private router: Router) {
  
//   }

//   ngOnInit(): void {
//     this.getCustomers();
//   }

//   login(data: { email: string; password: string }): Observable<any> {
//       const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post(`${this.baseUrl}/login`, data, {headers});
//   }

//    // Check session status
//   checkSession(): Observable<any> {
//     return this.http.get(`${this.baseUrl}/check_session`, { withCredentials: true });
//   }
  
//     // Logout service
//   logout(): Observable<any> {
//     return this.http.get(`${this.baseUrl}/logout`);
//   }

//   register(user: User) {
//     const headers = new HttpHeaders({
//       'Content-Type': 'application/json'
//     });
//     return this.http.post<User>(`${this.baseUrl}/register`, user, { headers });
//   }
  

//   getCustomers(){
//     return this.http.get(`${this.baseUrl}/list`).pipe(
//       map((response:any) => {
//         return response['data'];
//       })
//     );
//   }

//   getBio(): Observable<{ bioText: string; mainImage: string }> {
//     return this.http.get<{ bioText: string; mainImage: string }>(`${this.baseUrl}/bio`);
//   }

//   saveBio(bio:string){
//     const payload = {bio};
//     console.log('Payload being sent', payload);
//       const headers = new HttpHeaders({
//         'Content-Type': 'application/json'
//       });
//     return this.http.post(`${this.baseUrl}/bio`, payload, {headers});
//   }

//   uploadMainImage(file: File): Observable<any> {
//     const formData = new FormData();
//     formData.append('image', file);
//     return this.http.post(`${this.baseUrl}/bio`, formData);
//   }

//   getGallery(): Observable<{ 
//     sText: string; 
//     sImageMain: string;
//     nText: string; 
//     nImageMain: string; 
//     aText: string; 
//     aImageMain: string; 
//   }> {
//     return this.http.get<{ 
//       sText: string; 
//       sImageMain: string;
//       nText: string; 
//       nImageMain: string; 
//       aText: string; 
//       aImageMain: string;  }>(`${this.baseUrl}/mainGallery`);
//   }


//   submitGalleryChanges(formData: FormData): Observable<any> {
//     return this.http.post(`${this.baseUrl}/mainGallery`, formData);
//   }



// }//class

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { User } from '../user';

@Injectable({
  providedIn: 'root',
})
export class Service {
  baseUrl = 'http://localhost/frameBase';

  constructor(private http: HttpClient) {}

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

  // General method to handle GET requests
  getRequest<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`);
  }

  // General method to handle POST requests
  postRequest<T>(endpoint: string, payload: any, isFormData = false): Observable<T> {
    let headers = new HttpHeaders();
    if (!isFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, payload, { headers });
  }

  // GET: Retrieve data for the Main Gallery
  getGallery(): Observable<{
    sText: string;
    sImageMain: string;
    nText: string;
    nImageMain: string;
    aText: string;
    aImageMain: string;
  }> {
    return this.getRequest<{ 
      sText: string; 
      sImageMain: string; 
      nText: string; 
      nImageMain: string; 
      aText: string; 
      aImageMain: string 
    }>('uploadData?action=mainGallery');
  }//getgallery

  // POST: Submit changes to the Main Gallery (text and images)
  submitGalleryChanges(formData: FormData): Observable<any> {
    return this.postRequest('uploadData?action=updateMainGallery', formData, true);
  }

  // GET: Retrieve bio and image for About Page
  getBio(): Observable<{ bioText: string; mainImage: string }> {
    return this.getRequest<{ bioText: string; mainImage: string }>('uploadData?action=aboutPage');
  }

  // POST: Save bio text for About Page
  saveBio(bio: string): Observable<any> {
    const payload = { bio };
    return this.postRequest('uploadData?action=updateAboutPage', payload);
  }

  // POST: Upload main image for About Page
  uploadMainImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.postRequest('uploadData?action=updateAboutPage', formData, true);
  }
}
