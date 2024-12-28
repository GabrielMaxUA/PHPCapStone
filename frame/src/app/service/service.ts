
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { User } from '../Models/user';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { CartItem } from '../Models/cartItem';
import { DialogOkComponent } from '../dialog-ok/dialog-ok.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class Service {
  baseUrl = 'http://localhost/frameBase';
  cartItems: CartItem[] =[];
  cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartCountSubject = new BehaviorSubject<number>(0);
  showDialog = false;
  dialogMessage = ''; 

  cartItems$ = this.cartItemsSubject.asObservable();
  cartCount$ = this.cartCountSubject.asObservable();

  private heartbeatInterval: any;
  private readonly HEARTBEAT_INTERVAL = 2 * 60 * 1000;

  constructor(private http: HttpClient, private dialog: MatDialog, 
    private userService: UserService, private router: Router) {
      console.log('Service constructor - checking session'); // Debug log
      this.checkSession().subscribe({
        next: (response) => {
          console.log('Initial session check response:', response); // Debug log
          if (response?.authenticated) {
            this.userService.setUser({
              email: response.email,
              type: response.userType,
              status: response.userStatus
            });
            this.startHeartbeat();
          } else {
            console.log('Not authenticated, clearing user'); // Debug log
            this.userService.clearUser();
          }
        },
        error: (error) => {
          console.error('Session check error:', error); // Debug log
          this.userService.clearUser();
        }
      });
      // this.checkSession().subscribe({
      //   next: (response) => {
      //     if (response.authenticated) {
      //       this.userService.setUser({
      //         email: response.email, // Make sure this is returned from PHP
      //         type: response.userType,
      //         status: response.userStatus
      //       });
      //       this.startHeartbeat();
      //     } else {
      //       this.userService.clearUser();
      //     }
      //   },
      //   error: () => {
      //     this.userService.clearUser();
      //   }
      // });

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.updateCart(); // Update subjects with saved data
    }
  }

  login(data: { email: string; password: string }): Observable<any> {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(`${this.baseUrl}/login`, data, {headers, withCredentials: true }).pipe(
      map((response:any) =>{
        console.log('Login response:', response); // Debugging
        if(response.success){
          this.userService.setUser({
            email: data.email,
            type: response.userType,
            status: response.userStatus
          });
          this.startHeartbeat();
        }
        return response;
      })
    );
  }

   // Check session status
  // checkSession(): Observable<any> {
  //   return this.http.get(`${this.baseUrl}/check_session`, { withCredentials: true });
  // }
  checkSession(): Observable<any> {
    return this.http.get(`${this.baseUrl}/check_session`, { withCredentials: true })
      .pipe(
        map((response: any) => {
          console.log('Session check response:', response); // Debug log
          // Ensure we always return an object with authenticated property
          return {
            authenticated: response?.authenticated ?? false,
            userType: response?.userType,
            userStatus: response?.userStatus,
            email: response?.email
          };
        })
      );
  }

    // Logout service
  logout(): Observable<any> {
    this.stopHeartbeat(); // Stop the heartbeat
    console.log('Logging out'); // Log before making the HTTP call
    return this.http.get(`${this.baseUrl}/logout`, { withCredentials: true, responseType: 'json' });
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

  submitPriceChange(formData: FormData, action: string): Observable<any> {
    return this.postRequest(`editGalleriesData?action=${action}`, formData, true);
  } 


  getNatureContent(): Observable<{pictureID: number, nGalleryImage: string; price: number }[]> {
    return this.getRequest<{pictureID: number, nGalleryImage: string; price: number }[]>('galleriesData?action=natureGallery');
  }

  getStagedContent(): Observable<{pictureID: number, sGalleryImage: string; price: number, type: string }[]> {
    return this.getRequest<{pictureID: number, sGalleryImage: string; price: number, type: string}[]>('galleriesData?action=stagedGallery');
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

  addToCart(item: CartItem){
    console.log("Adding item to the cart: ", item);
    const existingItem = this.cartItems.find( i => i.pictureID === item.pictureID);

    if (existingItem){
      const message =
        'The item is already in your cart';
      const dialogRef = this.dialog.open(DialogOkComponent, {
        width: '400px',
        data: { message: message } // Pass the message dynamically
      });}
    else{
      this.cartItems.push({...item, quantity: 1});
    }

    this.updateCart();
    this.saveCartToStorage(); // Save to localStorage
  }


  removeFromCart(pictureID: number){
    this.cartItems = this.cartItems.filter(item => item.pictureID !== pictureID);
    this.updateCart();
  }

  clearCart(){
    this.cartItems = [];
    this.updateCart();
    this.saveCartToStorage();
  }

  private updateCart(){
    console.log('Updating cart. Items:', this.cartItems); // Debug log
    this.cartItemsSubject.next(this.cartItems);
    const totalItems = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    this.cartCountSubject.next(totalItems);
  }

  private saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  getCartItems(){
    return this.cartItems;
  }

  getCartCount(){
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  startHeartbeat() {
    // Clear any existing heartbeat
    this.stopHeartbeat();
    console.log('Starting heartbeat');
    // Start new heartbeat
    this.heartbeatInterval = setInterval(() => {
      this.checkSession().subscribe({
        next: (response) => {
          if (!response.authenticated) {
            this.stopHeartbeat();
            this.router.navigate(['/signin']);
          }
        },
        error: () => {
          this.stopHeartbeat();
          this.router.navigate(['/signin']);
        }
      });
    }, this.HEARTBEAT_INTERVAL);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }
  
}
