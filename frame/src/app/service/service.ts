import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, map, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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
  private readonly baseUrl = 'https://triosdevelopers.com/~Max.Gabriel/frame/frameBase';
  private readonly heartbeatInterval = 2 * 60 * 1000; // 2 minutes
  
  private cartItems: CartItem[] = [];
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private cartCountSubject = new BehaviorSubject<number>(0);
  private heartbeatTimer: any;

  // Public observables
  public readonly cartItems$ = this.cartItemsSubject.asObservable();
  public readonly cartCount$ = this.cartCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private userService: UserService,
    private router: Router
  ) {
    this.initializeService();
  }

  private initializeService(): void {
    // Initialize session check
    this.checkSession().subscribe({
      next: (response) => {
        if (response?.authenticated) {
          this.userService.setUser({
            email: response.email,
            type: response.userType,
            status: response.userStatus
          });
          this.startHeartbeat();
        } else {
          this.userService.clearUser();
        }
      },
      error: () => this.userService.clearUser()
    });

    // Initialize cart from localStorage
    this.loadCartFromStorage();
  }

  // Authentication Methods
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.postRequest('login.php', credentials, false, true).pipe(
      tap((response: any) => {
        if (response.success) {
          this.userService.setUser({
            email: credentials.email,
            type: response.userType,
            status: response.userStatus
          });
          this.startHeartbeat();
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.postRequest('logout.php', {}, false, true).pipe(
      tap(() => {
        this.stopHeartbeat();
        this.userService.clearUser();
      })
    );
  }

  checkSession(): Observable<any> {
    return this.getRequest('check_session.php', true);
  }

  register(user: User): Observable<any> {
    return this.postRequest('register.php', user);
  }

  // User Management Methods
  getCustomers(): Observable<any> {
    return this.getRequest<{ data: any }>('list.php').pipe(
      map(response => response.data)
    );
  }

  updateUserStatus(customerID: number, status: string): Observable<any> {
    return this.postRequest('cEdit.php', {
      data: { customerID, status }
    });
  }

  // Gallery Management Methods
  getMainGalleriesPageContent(): Observable<any> {
    return this.getRequest('uploadData.php?action=mainGallery');
  }

  submitMainGalleryChanges(formData: FormData): Observable<any> {
    return this.postRequest('uploadData.php?action=mainGallery', formData, true);
  }

  getNatureContent(): Observable<any> {
    return this.getRequest('galleriesData.php?action=natureGallery');
  }

  getArchitectureContent(): Observable<any> {
    return this.getRequest('galleriesData.php?action=architectureGallery');
  }

  getStagedContent(): Observable<any> {
    return this.getRequest('galleriesData.php?action=stagedGallery');
  }

  submitGalleriesData(formData: FormData, action: string): Observable<any> {
    return this.postRequest(`galleriesData.php?action=${action}`, formData, true);
  }

  submitPriceChange(formData: FormData, action: string): Observable<any> {
    return this.postRequest(`editGalleriesData.php?action=${action}`, formData, true);
  }

  deleteImage(pictureID: number, action: string): Observable<any> {
    return this.deleteRequest(`deleteImage.php?pictureID=${pictureID}&action=${action}`);
  }

  // About Page Methods
  getBio(): Observable<any> {
    return this.getRequest('bio.php?action=aboutPage');
  }

  saveBio(bio: string): Observable<any> {
    return this.postRequest('uploadData.php?action=updateAboutPage', { bio });
  }

  uploadMainImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.postRequest('uploadData.php?action=updateAboutPage', formData, true);
  }

  // Cart Management Methods
  addToCart(item: CartItem): void {
    const existingItem = this.cartItems.find(i => i.pictureID === item.pictureID);
    
    if (existingItem) {
      this.dialog.open(DialogOkComponent, {
        width: '400px',
        data: { message: 'The item is already in your cart' }
      });
    } else {
      this.cartItems.push({ ...item, quantity: 1 });
      this.updateCart();
      this.saveCartToStorage();
    }
  }

  removeFromCart(pictureID: number): void {
    this.cartItems = this.cartItems.filter(item => item.pictureID !== pictureID);
    this.updateCart();
    this.saveCartToStorage();
  }

  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
    this.saveCartToStorage();
  }

  getCartItems(): CartItem[] {
    return [...this.cartItems];
  }

  getCartCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Private Helper Methods
  private getRequest<T>(endpoint: string, withCredentials = false): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { withCredentials })
      .pipe(catchError(this.handleError));
  }

  private postRequest<T>(
    endpoint: string, 
    data: any, 
    isFormData = false, 
    withCredentials = false
  ): Observable<T> {
    const headers = new HttpHeaders(
      isFormData ? {} : { 'Content-Type': 'application/json' }
    );
    return this.http.post<T>(
      `${this.baseUrl}/${endpoint}`, 
      data, 
      { headers, withCredentials }
    ).pipe(catchError(this.handleError));
  }

  private deleteRequest<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  private updateCart(): void {
    this.cartItemsSubject.next([...this.cartItems]);
    this.cartCountSubject.next(this.getCartCount());
  }

  private saveCartToStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  private loadCartFromStorage(): void {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.updateCart();
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
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
    }, this.heartbeatInterval);
  }

  public stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}