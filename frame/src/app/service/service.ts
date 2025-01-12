
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, forkJoin, map, Observable, switchMap, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { DialogOkComponent } from '../dialog-ok/dialog-ok.component';
import { MatDialog } from '@angular/material/dialog';
import { CartItem, OrderResponse, User } from '../Models/interfaces';

@Injectable({
  providedIn: 'root',
})
export class Service {
  baseUrl = 'http://localhost/frameBase'; // Add your base URL here
  //private readonly baseUrl = 'https://triosdevelopers.com/~Max.Gabriel/frame/frameBase';
 
  showDialog = false;
  dialogMessage = ''; 
  private cartItems: CartItem[] = [];
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private cartCountSubject = new BehaviorSubject<number>(0);
  private currentCustomerID: number | null = null;
  // Public observables
  public readonly cartItems$ = this.cartItemsSubject.asObservable();
  public readonly cartCount$ = this.cartCountSubject.asObservable();
 

  private heartbeatInterval: any;
  private readonly HEARTBEAT_INTERVAL = 2 * 60 * 1000;

  constructor(private http: HttpClient, private dialog: MatDialog, 
    private userService: UserService, private router: Router) {

      this.checkSession().subscribe({
        next: (response) => {
          console.log('Initial session check response:', response); // Debug log
          if (response?.authenticated) {
            this.userService.setUser({
              email: response.email,
              type: response.userType,
              status: response.userStatus,
              customerID: response.customerID
            });
            this.currentCustomerID = response.customerID;
            this.getCartItems();
            this.startHeartbeat();
          } else {
            console.log('Not authenticated, clearing user'); // Debug log
            this.userService.clearUser();
            this.currentCustomerID = response.customerID;
          }
        },
        error: (error) => {
          console.error('Session check error:', error); // Debug log
          this.userService.clearUser();
          this.currentCustomerID = null;
          this.clearCart(); // Clear cart when not authenticated
        }
      },
    );

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.updateCart(); // Update subjects with saved data
    }
  }

  login(data: { email: string; password: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
    return this.http.post(`${this.baseUrl}/login`, data, {headers, withCredentials: true }).pipe(
      map((response:any) => {
        console.log('Login response:', response);
        if(response.success){
          this.currentCustomerID = response.customerID;
          this.userService.setUser({
            email: data.email,
            type: response.userType,
            status: response.userStatus,
            customerID: response.customerID
          });
          this.getCartItems(); // Using existing method
          this.startHeartbeat();
        }
        return response;
      })
    );
  }

  checkSession(): Observable<any> {
    return this.http.get(`${this.baseUrl}/check_session`, { withCredentials: true })
      .pipe(
        map((response: any) => {
          console.log('Session check response:', response); // Debug log
          if (response?.authenticated) {
            this.userService.setUser({
              email: response.email,
              type: response.userType,
              status: response.userStatus,
              customerID: response.customerID
            });
            this.currentCustomerID = response.customerID; // Set the current user ID
            this.getCartItems(); // Load the user's cart
          } else {
            this.userService.clearUser();
            this.currentCustomerID = null; // Clear the current user ID
          }
          return response;
        })
      );
  }

    // Logout service
    logout(): Observable<any> {
      this.stopHeartbeat(); // Stop the heartbeat
      console.log('Logging out'); // Log before making the HTTP call
      this.currentCustomerID = null; // Clear the current user ID
      this.cartItems = []; // Clear the in-memory cart
      this.cartItemsSubject.next([]); // Notify subscribers about the cleared cart
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

  updateUserStatus(customerID: number, status: string, firstName: string, lastName: string): Observable<any> {
    const payload = {
      data: {
        customerID: customerID,
        status: status,
        firstName: firstName,
        lastName: lastName

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

  getArchitectureContent(): Observable<{pictureID: number, aGalleryImage: string; price: number, }[]> {
    return this.getRequest<{pictureID: number, aGalleryImage: string; price: number }[]>('galleriesData?action=architectureGallery');
  }
  // GET: Retrieve bio and image for About Page
  getBio(): Observable<{ bioText: string; mainImage: string }> {
    return this.getRequest<{ bioText: string; mainImage: string }>('uploadData?action=aboutPage');
  }
  /** Fetch orders by customer ID */
  getOrderDetailsByOrderID(orderNumber: string ): Observable<any[]> {
    if (!orderNumber) {
      return throwError(() => new Error('Customer ID is required'));
    }
    return this.http.get<any[]>(`${this.baseUrl}/orders.php?orderNumber=${orderNumber}`).pipe(
      map(orders => orders || []),
      catchError(error => {
        console.error('Error fetching orders:', error);
        return throwError(() => new Error('Failed to fetch orders'));
      })
    );
  }

  getOrdersByCustomerID(customerID: number): Observable<OrderResponse> {
    console.log('Fetching orders for customer ID:', customerID);
    if (!customerID) {
      return throwError(() => new Error('Customer ID is required'));
    }
    return this.http.get<OrderResponse>(`${this.baseUrl}/orderDetails.php?customerID=${customerID}`).pipe(
      catchError(error => {
        console.error('Error fetching order data:', error);
        return throwError(() => new Error('Failed to fetch order data'));
      })
    );
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

  // addToCart(item: CartItem) {
  //   console.log("Adding item to the cart: ", item);
  //   const existingItem = this.cartItems.find(i => i.pictureID === item.pictureID);

  //   if (existingItem) {
  //     const message = 'The item is already in your cart';
  //     const dialogRef = this.dialog.open(DialogOkComponent, {
  //       width: '400px',
  //       data: { message: message } // Pass the message dynamically
  //     });
  //   } else {
  //     this.cartItems.push({ ...item, quantity: 1});
  //   }
  //   console.log('Updating cart with: ', item)
  //   this.updateCart();
  //   this.saveCartToStorage(); // Save to localStorage
  // }

  // removeFromCart(pictureID: number){
  //   this.cartItems = this.cartItems.filter(item => item.pictureID !== pictureID);
  //   this.updateCart();
  //   this.saveCartToStorage();
  // }

//   clearCart() {
//     console.log('Cart items before clearing:', this.cartItems);
//     this.cartItems = this.cartItems.filter(item => {
//         console.log('Item:', item, 'Status:', item.status);
//         // Keep item if status is specifically 'purchased' or 'downloaded'
//         return item.status === 'purchased' || item.status === 'downloaded';
//     });
//     console.log('Cart items after clearing:', this.cartItems);
//     this.updateCart();
//     this.saveCartToStorage();
// }

  // private updateCart(){
  //   console.log('Updating cart. Items:', this.cartItems); // Debug log
  //   this.cartItemsSubject.next(this.cartItems);
  //   const totalItems = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  //   this.cartCountSubject.next(totalItems);
  //   console.log('Cart update complete. Total items:', totalItems);
  // }

// Save cart to localStorage based on customerID
//   private saveCartToStorage() {
//   if (!this.currentCustomerID) {
//     console.error('Cannot save cart: No customer ID');
//     return;
//   }
//   const key = `cart_${this.currentCustomerID}`;
//   localStorage.setItem(key, JSON.stringify(this.cartItems));
// }

//   getCartItems(): CartItem[] {
//   this.updateCart()
//     if (!this.currentCustomerID) {
//       console.error('Cannot load cart: No customer ID');
//       this.cartItems = []; // Clear the in-memory cart
//       this.updateCart();
//     }

//     const key = `cart_${this.currentCustomerID}`;
//     const savedCart = localStorage.getItem(key);

//     if (savedCart) {
//       try {
//         this.cartItems = JSON.parse(savedCart) || []; // Fallback to an empty array if parsing fails
//       } catch (error) {
//         console.error('Failed to parse cart from localStorage:', error);
//         this.cartItems = []; // Default to an empty array on error
//       }
//     } else {
//       this.cartItems = []; // Initialize with an empty cart if nothing is saved
//     }
//     this.updateCart(); // Update subjects and cart state
//     return this.cartItems

//   }

//   getCartCount(){
//     return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
//   }

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

  initiatePayment(data: {
    items: CartItem[];
    total: number;
    customerID: number | null;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/payment.php`, data);
  }
  
  checkout(orderNumber: string, cartItems: CartItem[], customerID: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/checkout.php`, {
      orderNumber,
      cartItems,
      customerID,
      status
    });
  }

  downloadProduct(pictureID: number, customerID: number): Observable<Blob> {
    const headers = new HttpHeaders({
      'Accept': 'application/octet-stream',
      'Content-Type': 'application/json'
    });

    return this.checkSession().pipe(
      map(sessionData => {
        if (!sessionData.authenticated || sessionData.customerID !== customerID) {
          throw new Error('Unauthorized access');
        }
        return sessionData.customerID;
      }),
      switchMap(() => {
        return this.http.post(`${this.baseUrl}/download-product`, 
          { pictureID, customerID },
          { 
            responseType: 'blob',
            headers: headers
          }
        );
      })
    );
  }

  checkPurchaseStatus(pictureID: number): Observable<any> {
    return this.checkSession().pipe(
      map(sessionData => {
        if (!sessionData.authenticated || !sessionData.customerID) {
          throw new Error('User not authenticated');
        }
        return sessionData.customerID;
      }),
      switchMap(customerID => {
        return this.http.post<any>(`${this.baseUrl}/check-purchase-status.php`, {
          pictureID,
          customerID
        });
      })
    );
  }
  
  updateImageStatus(pictureID: number, status: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/update-image-status.php`, {
      pictureID,
      status
    });
  }

  private loadCartFromStorage() {
    if (!this.currentCustomerID) {
      console.error('Cannot load cart: No customer ID');
      return;
    }

    const key = `cart_${this.currentCustomerID}`;
    const savedCart = localStorage.getItem(key);
    
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        this.cartItems = cartData.items || [];
        this.updateCart();
      } catch (error) {
        console.error('Failed to parse cart from storage:', error);
        this.cartItems = [];
        this.updateCart();
      }
    }
  }

  private updateCart() {
    if (!this.currentCustomerID) {
      this.cartItemsSubject.next([]);
      this.cartCountSubject.next(0);
      return;
    }

    const statusChecks = this.cartItems.map(item => 
      this.checkPurchaseStatus(item.pictureID)
    );

    if (statusChecks.length === 0) {
      this.cartItemsSubject.next([]);
      this.cartCountSubject.next(0);
      this.saveCartToStorage();
      return;
    }

    forkJoin(statusChecks).subscribe({
      next: (responses) => {
        this.cartItems = this.cartItems.map((item, index) => {
          const response = responses[index];
          if (response?.success) {
            return {
              ...item,
              status: response.status
            };
          }
          return item;
        });

        this.cartItemsSubject.next(this.cartItems);
        const totalItems = this.cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
        this.cartCountSubject.next(totalItems);
        this.saveCartToStorage();
      },
      error: (error) => {
        console.error('Error updating cart:', error);
        this.cartItemsSubject.next(this.cartItems);
        const totalItems = this.cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
        this.cartCountSubject.next(totalItems);
      }
    });
  }

  addToCart(item: CartItem) {
    if (!this.currentCustomerID) {
      console.error('Cannot add to cart: No customer ID');
      return;
    }

    const existingItem = this.cartItems.find(i => i.pictureID === item.pictureID);

    if (existingItem) {
      this.dialog.open(DialogOkComponent, {
        width: '400px',
        data: { message: 'The item is already in your cart' }
      });
      return;
    }

    this.checkPurchaseStatus(item.pictureID).subscribe({
      next: (response) => {
        if (response.success) {
          const newItem: CartItem = {
            ...item,
            quantity: 1,
            status: response.status
          };
          this.cartItems.push(newItem);
          this.updateCart();
        }
      },
      error: (error) => {
        console.error('Error checking item status:', error);
      }
    });
  }

  removeFromCart(pictureID: number) {
    this.cartItems = this.cartItems.filter(item => item.pictureID !== pictureID);
    this.updateCart();
  }

  clearCart() {
    if (!this.currentCustomerID) {
      return;
    }

    const statusChecks = this.cartItems.map(item => 
      this.checkPurchaseStatus(item.pictureID)
    );

    if (statusChecks.length === 0) {
      this.cartItems = [];
      this.updateCart();
      return;
    }

    forkJoin(statusChecks).subscribe({
      next: (responses) => {
        this.cartItems = this.cartItems.filter((item, index) => {
          const response = responses[index];
          return response?.success && 
            (response.status === 'purchased' || response.status === 'downloaded');
        });
        this.updateCart();
      },
      error: (error) => {
        console.error('Error clearing cart:', error);
      }
    });
  }

  private saveCartToStorage() {
    if (!this.currentCustomerID) {
      return;
    }

    const key = `cart_${this.currentCustomerID}`;
    try {
      localStorage.setItem(key, JSON.stringify({
        items: this.cartItems,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  getCartItems(): CartItem[] {
    return this.cartItems;
  }

  getCartCount() {
    return this.cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }
}