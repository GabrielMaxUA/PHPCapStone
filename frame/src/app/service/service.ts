
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { User } from '../user';
import { Router } from '@angular/router';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class Service {
  baseUrl = 'http://localhost/frameBase';

  constructor(private http: HttpClient, private router: Router, private userService: UserService){
    this.userService.clearUser(); // Clear user data
    this.router.navigate(['about']); // Redirect 
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
    console.log('Logging out'); // Log before making the HTTP call
    return this.http.get(`${this.baseUrl}/logout`, { responseType: 'json' });
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

  updateUserStatus(customerID: number, status: string): Observable<any> {
    const payload = {
      data: {
        customerID: customerID,
        status: status,
      },
    };
    return this.postRequest(`cEdit`, payload, true);
  }

  // General method to handle GET requests
  getRequest<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`);
  }

  deleteRequest<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`);
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
  getMainGalleriesPageContent(): Observable<{
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

  submitMainGalleryChanges(formData: FormData): Observable<any> {
    return this.postRequest('uploadData?action=mainGallery', formData, true);
  }

  submitGalleriesData(formData: FormData, action: string): Observable<any> {
    return this.postRequest(`galleriesData?action=${action}`, formData, true);
  }  

  submitNatureGalleryChanges(formData: FormData): Observable<any> {
    return this.postRequest('editGalleriesData?action=natureGallery', formData, true);
  }

  submitArchitectureGalleryChanges(formData: FormData): Observable<any> {
    return this.postRequest('editGalleriesData?action=architectureGallery', formData, true);
  }

  getNatureContent(): Observable<{pictureID: number, nGalleryImage: string; price: number }[]> {
    return this.getRequest<{pictureID: number, nGalleryImage: string; price: number }[]>('galleriesData?action=natureGallery');
  }

  getArchitectureContent(): Observable<{pictureID: number, aGalleryImage: string; price: number }[]> {
    return this.getRequest<{pictureID: number, aGalleryImage: string; price: number }[]>('galleriesData?action=architectureGallery');
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

  deleteImage(pictureID: number, action: string): Observable<any> {
    console.log('passing to server:', pictureID, action);
    return this.deleteRequest(`deleteImage?pictureID=${pictureID}&action=${action}`);
}

}
