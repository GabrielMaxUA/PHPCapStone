// Import necessary modules and services from Angular, RxJS, and other libraries.
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  forkJoin,
  map,
  Observable,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { Router } from '@angular/router';
import { UserService } from './user.service'; // Custom service to manage user-related data and logic.
import { DialogOkComponent } from '../dialog-ok/dialog-ok.component'; // Dialog component for displaying messages.
import { MatDialog } from '@angular/material/dialog'; // Angular Material Dialog for displaying modals.
import { CartItem, OrderResponse, User } from '../Models/interfaces'; // Interfaces for defining data structures.

// Decorator to mark this class as injectable, making it available for dependency injection.
@Injectable({
  providedIn: 'root', // Register the service at the root level, making it accessible throughout the app.
})
export class Service {
  // Base URL for making HTTP requests to the backend API.
  private baseUrl = 'http://localhost/frameBase';
  //private baseUrl = 'https://triosdevelopers.com/~Max.Gabriel/frame/frameBase';

  // Observable flags and data properties for managing UI and state.
  showDialog = false; // Boolean to control the display of dialog boxes.
  dialogMessage = ''; // Message to display in the dialog box.

  // Cart management properties.
  private cartItems: CartItem[] = []; // Array holding the current items in the cart.
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]); // Subject for notifying components of cart updates.
  private cartCountSubject = new BehaviorSubject<number>(0); // Subject for notifying components of the cart item count.
  private currentCustomerID: number | null = null; // Currently logged-in customer's ID.

  // Public observables for components to subscribe to cart data and count changes.
  public readonly cartItems$ = this.cartItemsSubject.asObservable();
  public readonly cartCount$ = this.cartCountSubject.asObservable();

  // Heartbeat interval for session validation.
  private heartbeatInterval: any; // Variable to store the interval ID.
  private readonly HEARTBEAT_INTERVAL = 2 * 60 * 1000; // 2 minutes interval for the heartbeat.

  // Constructor for injecting necessary dependencies.
  constructor(
    private http: HttpClient, // HttpClient for making HTTP requests.
    private dialog: MatDialog, // MatDialog for opening dialog boxes.
    private userService: UserService, // UserService for managing user-related state and actions.
    private router: Router // Router for handling navigation and redirection.
  ) {
    // Perform an initial session check on service initialization.
    this.checkSession().subscribe({
      next: (response) => {
        if (response?.authenticated) {
          this.currentCustomerID = response.customerID; // Set the current user ID.
          this.userService.setUser({
            email: response.email,
            type: response.userType,
            status: response.userStatus,
            customerID: response.customerID,
          });
          this.loadCartFromStorage(); // Load the cart after session validation.
        } else {
          this.userService.clearUser();
          this.currentCustomerID = null; // Clear the current user ID.
          this.cartItems = []; // Clear the in-memory cart.
          this.cartItemsSubject.next([]); // Notify subscribers of the cleared cart.
        }
      },
      error: (error) => {
        console.error('Session check error:', error); // Log session check error.
        this.userService.clearUser();
        this.currentCustomerID = null; // Reset customer ID.
        this.cartItems = []; // Clear the in-memory cart.
        this.cartItemsSubject.next([]); // Notify subscribers of the cleared cart.
      },
    });
  }


    /**
   * Handles generic GET requests.
   * @param endpoint API endpoint to call.
   * @returns Observable of the response.
   */
    getRequest<T>(
      endpoint: string,
      options: { headers?: HttpHeaders; withCredentials?: boolean } = {}
    ): Observable<T> {
      let headers = options.headers || new HttpHeaders();
  
      // If no custom headers are provided and withCredentials is not specified, set default headers.
      if (!options.headers && !options.withCredentials) {
        headers = headers.set('Accept', 'application/json'); // Set default header to accept JSON responses.
      }
  
      return this.http.get<T>(`${this.baseUrl}/${endpoint}`, {
        ...options,
        headers,
      }); // Send GET request with the provided options.
    }
  
    /**
     * Handles generic DELETE requests.
     * @param endpoint API endpoint to call.
     * @returns Observable of the response.
     */
    deleteRequest<T>(endpoint: string): Observable<T> {
      return this.http.delete<T>(`${this.baseUrl}/${endpoint}`); // Send DELETE request to the specified endpoint.
    }
  
    /**
     * Handles generic POST requests.
     * @param endpoint API endpoint to call.
     * @param payload Data to send in the request body.
     * @param isFormData Indicates if the payload is FormData.
     * @returns Observable of the response.
     */
    postRequest<T>(
      endpoint: string,
      payload: any,
      options: { headers?: HttpHeaders; withCredentials?: boolean } = {}
    ): Observable<T> {
      let headers = options.headers || new HttpHeaders();
      if (!options.headers && !options.withCredentials) {
        headers = headers.set('Content-Type', 'application/json'); // Set JSON content type if not using FormData.
      }
      return this.http.post<T>(`${this.baseUrl}/${endpoint}`, payload, {
        ...options,
        headers,
      }); // Send POST request to the endpoint.
    }
  
    /**
     * Retrieves the content for the main galleries page.
     * @returns Observable containing gallery content data.
     */
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
        aImageMain: string;
      }>('uploadData?action=mainGallery', { withCredentials: true });
    }
    
  /**
   * Logs in a user with email and password.
   * @param data Object containing `email` and `password` fields.
   * @returns Observable of the login response.
   */
  login(data: { email: string; password: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' }); // Set JSON headers.

    return this.postRequest(`login`, data, {
      headers,
      withCredentials: true,
    }).pipe(
      map((response: any) => {
        console.log('Login response:', response); // Debug log for login response.
        if (response.success) {
          this.currentCustomerID = response.customerID; // Save the customer ID on successful login.
          this.userService.setUser({
            email: data.email, // Set the email in the UserService.
            type: response.userType, // Set the user type.
            status: response.userStatus, // Set the user status.
            customerID: response.customerID, // Set the customer ID.
          });
          this.loadCartFromStorage(); // Load the user's cart after login.
          this.startHeartbeat(); // Start the heartbeat interval for session validation.
        }
        return response; // Return the response to the subscriber.
      })
    );
  }

  /**
   * Checks if a user session is still active.
   * @returns Observable of the session check response.
   */
  checkSession(): Observable<any> {
    return this.getRequest(`check_session`, { withCredentials: true }).pipe(
      map((response: any) => {
        console.log('Session check response:', response); // Debug log for session response.
        if (response?.authenticated) {
          // If authenticated, set the user data in UserService.
          this.userService.setUser({
            email: response.email,
            type: response.userType,
            status: response.userStatus,
            customerID: response.customerID,
          });
          this.currentCustomerID = response.customerID; // Save the customer ID.
          this.getCartItems(); // Load the cart for the authenticated user.
        } else {
          // If not authenticated, clear user data.
          this.userService.clearUser();
          this.currentCustomerID = null;
        }
        return response; // Return the response to the subscriber.
      })
    );
  }
  /**
   * Logs out the current user and clears the session data.
   * @returns Observable of the logout response.
   */
  logout(): Observable<any> {
    this.stopHeartbeat(); // Stop the heartbeat process to end session validation.
    console.log('Logging out'); // Log the logout action for debugging.
    this.currentCustomerID = null; // Clear the currently logged-in user ID.
    this.cartItems = []; // Clear the in-memory cart.
    this.cartItemsSubject.next([]); // Notify subscribers that the cart is now empty.
    return this.getRequest(`logout`, { withCredentials: true }); // Call the logout endpoint.
  }

  /**
   * Registers a new user.
   * @param user Object containing user details such as email, password, etc.
   * @returns Observable of the registration response.
   */
  register(user: User) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' }); // Set JSON headers.
    return this.postRequest<User>(`register`, user, { headers }); // Send registration data to the server.
  }

  /**
   * Retrieves a list of customers.
   * @returns Observable of the list of customers.
   */
  getCustomers() {
    return this.getRequest(`list`).pipe(
      map((response: any) => {
        return response['data']; // Extract the 'data' field from the response.
      })
    );
  }

  /**
   * Updates the status of a user (e.g., active/inactive).
   * @param customerID ID of the customer to update.
   * @param status New status to assign.
   * @param firstName Customer's first name.
   * @param lastName Customer's last name.
   * @returns Observable of the update response.
   */
  updateUserStatus(
    customerID: number,
    status: string,
    firstName: string,
    lastName: string
  ): Observable<any> {
    const payload = {
      data: {
        customerID: customerID, // The customer ID to update.
        status: status, // The new status for the user.
        firstName: firstName, // Customer's first name.
        lastName: lastName, // Customer's last name.
      },
    };
    return this.postRequest('cEdit', payload, { withCredentials: true }); // Send the update request to the server.
  }

  /**
   * Submits changes to the main gallery.
   * @param formData FormData containing updated gallery data.
   * @returns Observable of the submission response.
   */
  submitMainGalleryChanges(formData: FormData): Observable<any> {
    return this.postRequest('uploadData?action=mainGallery', formData, {
      withCredentials: true,
    });
  }

  /**
   * Submits gallery data for a specific action.
   * @param formData FormData containing the gallery data.
   * @param action The action to perform (e.g., 'add', 'update').
   * @returns Observable of the submission response.
   */
  submitGalleriesData(formData: FormData, action: string): Observable<any> {
    return this.postRequest(`galleriesData?action=${action}`, formData, {
      withCredentials: true,
    });
  }

  /**
   * Submits price changes for gallery items.
   * @param formData FormData containing the price changes.
   * @param action The action to perform (e.g., 'updatePrice').
   * @returns Observable of the submission response.
   */
  submitPriceChange(formData: FormData, action: string): Observable<any> {
    return this.postRequest(`editGalleriesData?action=${action}`, formData, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves content for the Nature Gallery.
   * @returns Observable of nature gallery items.
   */
  getNatureContent(): Observable<
    { pictureID: number; nGalleryImage: string; price: number }[]
  > {
    return this.getRequest<
      { pictureID: number; nGalleryImage: string; price: number }[]
    >('galleriesData?action=natureGallery', { withCredentials: true });
  }

  /**
   * Retrieves content for the Staged Gallery.
   * @returns Observable of staged gallery items.
   */
  getStagedContent(): Observable<
    { pictureID: number; sGalleryImage: string; price: number; type: string }[]
  > {
    return this.getRequest<
      {
        pictureID: number;
        sGalleryImage: string;
        price: number;
        type: string;
      }[]
    >('galleriesData?action=stagedGallery', { withCredentials: true });
  }

  /**
   * Retrieves content for the Architecture Gallery.
   * @returns Observable of architecture gallery items.
   */
  getArchitectureContent(): Observable<
    { pictureID: number; aGalleryImage: string; price: number }[]
  > {
    return this.getRequest<
      { pictureID: number; aGalleryImage: string; price: number }[]
    >('galleriesData?action=architectureGallery', { withCredentials: true });
  }

  /**
   * Retrieves bio and image data for the About page.
   * @returns Observable containing bio and image data.
   */
  getBio(): Observable<{ bioText: string; mainImage: string }> {
    return this.getRequest<{ bioText: string; mainImage: string }>('bio', {
      withCredentials: true,
    });
  }

  /**
   * Fetches orders based on the given order number.
   * @param orderNumber The order number to fetch details for.
   * @returns Observable of the order details.
   */
  getOrderDetailsByOrderID(orderNumber: string): Observable<any[]> {
    if (!orderNumber) {
      return throwError(() => new Error('Order number is required'));
    }
    return this.getRequest<any[]>(`orders.php?orderNumber=${orderNumber}`, {
      withCredentials: true,
    }).pipe(
      map((orders) => orders || []), // Map response to an array (or empty array if null).
      catchError((error) => {
        console.error('Error fetching orders:', error);
        return throwError(() => new Error('Failed to fetch orders'));
      })
    );
  }

  /**
   * Fetches orders for a given customer ID.
   * @param customerID The customer ID to fetch orders for.
   * @returns Observable containing the order data.
   */
  getOrdersByCustomerID(customerID: number): Observable<OrderResponse> {
    console.log('Fetching orders for customer ID:', customerID); // Debug log for the customer ID.
    if (!customerID) {
      return throwError(() => new Error('Customer ID is required')); // Throw an error if no customer ID is provided.
    }
    return this.getRequest<OrderResponse>(
      `orderDetails.php?customerID=${customerID}`
    ).pipe(
      catchError((error) => {
        console.error('Error fetching order data:', error); // Log any errors during the request.
        return throwError(() => new Error('Failed to fetch order data')); // Return a user-friendly error.
      })
    );
  }

  /**
   * Saves the bio text for the About page.
   * @param bio The bio text to save.
   * @returns Observable of the save response.
   */
  saveBio(bio: string): Observable<any> {
    const payload = { bio }; // Payload containing the bio text.
    return this.postRequest('bio', payload); // Call the API to save the bio.
  }

  /**
   * Uploads the main image for the About page.
   * @param file The image file to upload.
   * @returns Observable of the upload response.
   */
  uploadMainImage(file: File): Observable<any> {
    const formData = new FormData(); // Create a FormData object to hold the file.
    formData.append('image', file); // Append the image file to the FormData.
    return this.postRequest('bio', formData, {
      withCredentials: true,
    }); // Call the API to upload the image.
  }

  /**
   * Deletes an image by its picture ID.
   * @param pictureID The ID of the picture to delete.
   * @param action The action associated with the deletion.
   * @returns Observable of the delete response.
   */
  deleteImage(pictureID: number, action: string): Observable<any> {
    console.log('Passing to server:', pictureID, action); // Debug log for the deletion request.
    return this.deleteRequest(
      `deleteImage?pictureID=${pictureID}&action=${action}`
    ); // Call the API to delete the image.
  }

  /**
   * Starts the heartbeat process to periodically validate the user session.
   */
  startHeartbeat() {
    this.stopHeartbeat(); // Clear any existing heartbeat to avoid duplicates.
    console.log('Starting heartbeat'); // Log the heartbeat initialization.
    this.heartbeatInterval = setInterval(() => {
      this.checkSession().subscribe({
        next: (response) => {
          if (!response.authenticated) {
            this.stopHeartbeat(); // Stop the heartbeat if the user is no longer authenticated.
            this.router.navigate(['/signin']); // Redirect the user to the sign-in page.
          }
        },
        error: () => {
          this.stopHeartbeat(); // Stop the heartbeat on error.
          this.router.navigate(['/signin']); // Redirect the user to the sign-in page.
        },
      });
    }, this.HEARTBEAT_INTERVAL); // Run the session check at the defined interval.
  }

  /**
   * Stops the heartbeat process.
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval); // Clear the interval to stop the heartbeat.
    }
  }

  /**
   * Initiates a payment process with the given data.
   * @param data Object containing items, total, and customer ID.
   * @returns Observable of the payment initiation response.
   */
  initiatePayment(data: {
    items: CartItem[];
    total: number;
    customerID: number | null;
  }): Observable<any> {
    return this.postRequest(`payment.php`, data); // Call the API to initiate the payment process.
  }

  /**
   * Completes the checkout process.
   * @param orderNumber The order number for the checkout.
   * @param cartItems Array of items in the cart.
   * @param customerID The customer ID associated with the checkout.
   * @returns Observable of the checkout response.
   */
  checkout(
    orderNumber: string,
    cartItems: CartItem[],
    customerID: number
  ): Observable<any> {
    return this.postRequest(`checkout.php`, {
      orderNumber, // The order number for this transaction.
      cartItems, // The items being purchased.
      customerID, // The ID of the customer.
    });
  }

  /**
   * Downloads a product as a binary Blob.
   * @param pictureID The ID of the picture to download.
   * @param customerID The customer ID requesting the download.
   * @returns Observable of the Blob containing the product data.
   */
  downloadProduct(pictureID: number, customerID: number): Observable<Blob> {
    
    const headers = new HttpHeaders({
      Accept: 'application/octet-stream', // Specify the expected response type.
      'Content-Type': 'application/json', // Specify the request content type.
    });

    return this.checkSession().pipe(
      map((sessionData) => {
        if (
          !sessionData.authenticated ||
          sessionData.customerID !== customerID
        ) {
          throw new Error('Unauthorized access'); // Throw an error if the user is unauthorized.
        }
        return sessionData.customerID; // Return the customer ID if authorized.
      }),
      switchMap(() => {
        console.log(pictureID, customerID);
        return this.http.post(
          `${this.baseUrl}/download-product`,
          { pictureID, customerID },
          {
            responseType: 'blob', // Expect the response as a binary Blob.
            headers: headers, // Attach the headers to the request.
          }
        );
      })
    );
  }

  /**
   * Checks the purchase status of a product.
   * @param pictureID The ID of the picture to check.
   * @returns Observable of the purchase status response.
   */
  checkPurchaseStatus(pictureID: number): Observable<any> {
    return this.checkSession().pipe(
      map((sessionData) => {
        if (!sessionData.authenticated || !sessionData.customerID) {
          throw new Error('User not authenticated'); // Throw an error if the user is not authenticated.
        }
        return sessionData.customerID; // Return the customer ID if authenticated.
      }),
      switchMap((customerID) => {
        return this.postRequest<any>(
          `check-purchase-status.php`,
          {
            pictureID, // ID of the product to check.
            customerID, // ID of the customer making the request.
          }
        );
      })
    );
  }

  /**
   * Updates the status of an image.
   * @param pictureID The ID of the picture to update.
   * @param status The new status to assign.
   * @returns Observable of the update response.
   */
  updateImageStatus(pictureID: number, status: string): Observable<any> {
    return this.postRequest(`update-image-status.php`, {
      pictureID, // ID of the image to update.
      status, // New status for the image.
    });
  }

  /**
   * Loads the cart from local storage for the current user.
   */
  // private loadCartFromStorage() {
  //   if (!this.currentCustomerID) {
  //     console.error('Cannot load cart: No customer ID'); // Log an error if no customer ID exists.
  //     return;
  //   }

  //   const key = `cart_${this.currentCustomerID}`; // Generate the storage key for the cart.
  //   const savedCart = localStorage.getItem(key); // Retrieve the cart from local storage.

  //   if (savedCart) {
  //     try {
  //       const cartData = JSON.parse(savedCart); // Parse the cart data.
  //       this.cartItems = cartData.items || []; // Update the in-memory cart items.
  //       this.updateCart(); // Notify subscribers of the updated cart.
  //     } catch (error) {
  //       console.error('Failed to parse cart from storage:', error); // Log parsing errors.
  //       this.cartItems = []; // Reset the cart if parsing fails.
  //       this.updateCart();
  //     }
  //   }
  // }
  loadCartFromStorage() {
    if (!this.currentCustomerID) {
      console.error('Cannot load cart: No customer ID'); // Log an error if no customer ID exists.
      return;
    }

    const key = `cart_${this.currentCustomerID}`; // Generate the local storage key.
    const savedCart = localStorage.getItem(key); // Retrieve the cart from local storage.

    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart); // Parse the cart data.
        this.cartItems = cartData.items || []; // Initialize the in-memory cart.
        this.cartItemsSubject.next(this.cartItems); // Notify subscribers of the loaded cart.
        this.updateCart();
      } catch (error) {
        console.error('Failed to parse cart from storage:', error); // Log parsing errors.
        this.cartItems = []; // Reset the cart if parsing fails.
        this.cartItemsSubject.next([]); // Notify subscribers of the cleared cart.
      }
    } else {
      console.log('No cart found in local storage for the current user'); // Log if no cart is found.
    }
  }

  /**
   * Updates the cart by checking the status of each item and notifying subscribers.
   */

  private updateCart() {
    if (!this.currentCustomerID) {
      this.cartItemsSubject.next([]); // Notify subscribers that the cart is empty.
      this.cartCountSubject.next(0); // Set the cart count to zero.
      return;
    }

    // Create an array of status-check observables for all cart items.
    const statusChecks = this.cartItems.map((item) =>
      this.checkPurchaseStatus(item.pictureID)
    );

    if (statusChecks.length === 0) {
      this.cartItemsSubject.next([]); // Notify subscribers that the cart is empty.
      this.cartCountSubject.next(0); // Set the cart count to zero.
      this.saveCartToStorage(); // Save the empty cart state to local storage.
      return;
    }

    // Use forkJoin to execute all status-check observables in parallel.
    forkJoin(statusChecks).subscribe({
      next: (responses) => {
        this.cartItems = this.cartItems.map((item, index) => {
          const response = responses[index]; // Match each response to the corresponding cart item.
          if (response?.success) {
            return {
              ...item, // Copy existing item properties.
              status: response.status, // Update the status based on the response.
            };
          }
          return item; // Return the item unchanged if no valid response.
        });

        this.cartItemsSubject.next(this.cartItems); // Notify subscribers of the updated cart.

        // **Filter items by status 'active' and calculate the total**
        const totalActiveItems = this.cartItems
          .filter((item) => item.status === 'active') // Only include items with status 'active'
          .reduce((sum, item) => sum + (item.quantity || 1), 0); // Sum the quantities of active items.

        this.cartCountSubject.next(totalActiveItems); // Notify subscribers of the updated cart count.
        this.saveCartToStorage(); // Save the updated cart state to local storage.
      },
      error: (error) => {
        console.error('Error updating cart:', error); // Log errors during cart update.

        // **Filter items by status 'active' for the fallback cart count**
        const totalActiveItems = this.cartItems
          .filter((item) => item.status === 'active') // Only include items with status 'active'
          .reduce((sum, item) => sum + (item.quantity || 1), 0); // Sum the quantities of active items.

        this.cartCountSubject.next(totalActiveItems); // Notify subscribers of the updated cart count.
      },
    });
  }

  /**
   * Adds an item to the cart after checking its purchase status.
   * @param item The item to add to the cart.
   */
  addToCart(item: CartItem) {
    if (!this.currentCustomerID) {
      console.error('Cannot add to cart: No customer ID'); // Log an error if no customer ID exists.
      return;
    }

    // Check if the item is already in the cart.
    const existingItem = this.cartItems.find(
      (i) => i.pictureID === item.pictureID
    );

    if (existingItem) {
      // Show a dialog informing the user that the item is already in the cart.
      this.dialog.open(DialogOkComponent, {
        width: '400px',
        data: {
          header: 'Attention',
          message: 'Theis item is already in your cart',
        },
      });
      return;
    }

    // Check the purchase status of the item before adding it.
    this.checkPurchaseStatus(item.pictureID).subscribe({
      next: (response) => {
        if (response.success) {
          // Add the new item to the cart with a default quantity of 1 and its current status.
          const newItem: CartItem = {
            ...item,
            quantity: 1,
            status: response.status,
          };
          this.cartItems.push(newItem); // Add the item to the cart.
          this.updateCart(); // Update the cart and notify subscribers.
        }
      },
      error: (error) => {
        console.error('Error checking item status:', error); // Log any errors during the status check.
      },
    });
  }

  /**
   * Removes an item from the cart by its picture ID.
   * @param pictureID The ID of the picture to remove.
   */
  removeFromCart(pictureID: number) {
    this.cartItems = this.cartItems.filter(
      (item) => item.pictureID !== pictureID
    ); // Remove the item with the matching picture ID.
    this.updateCart(); // Update the cart and notify subscribers.
  }

  /**
   * Clears the cart of items that are not purchased or downloaded.
   */
  clearCart() {
    if (!this.currentCustomerID) {
      return; // Exit if no customer ID exists.
    }

    // Create an array of status-check observables for all cart items.
    const statusChecks = this.cartItems.map((item) =>
      this.checkPurchaseStatus(item.pictureID)
    );

    if (statusChecks.length === 0) {
      this.cartItems = []; // Clear the in-memory cart.
      this.updateCart(); // Notify subscribers of the updated cart.
      return;
    }

    // Use forkJoin to execute all status-check observables in parallel.
    forkJoin(statusChecks).subscribe({
      next: (responses) => {
        // Filter out items that are not purchased or downloaded.
        this.cartItems = this.cartItems.filter((item, index) => {
          const response = responses[index];
          return (
            response?.success &&
            (response.status === 'purchased' ||
              response.status === 'downloaded')
          );
        });
        this.updateCart(); // Notify subscribers of the updated cart.
      },
      error: (error) => {
        console.error('Error clearing cart:', error); // Log any errors during cart clearing.
      },
    });
  }

  /**
   * Saves the cart to local storage for the current user.
   */
  private saveCartToStorage() {
    if (!this.currentCustomerID) {
      return; // Exit if no customer ID exists.
    }

    const key = `cart_${this.currentCustomerID}`; // Generate the storage key for the cart.
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          items: this.cartItems, // Save the current cart items.
          lastUpdated: new Date().toISOString(), // Add a timestamp for when the cart was last updated.
        })
      );
    } catch (error) {
      console.error('Error saving cart to storage:', error); // Log errors during saving.
    }
  }

  /**
   * Retrieves the current cart items.
   * @returns Array of current cart items.
   */
  getCartItems(): CartItem[] {
    return this.cartItems; // Return the in-memory cart items.
  }

  /**
   * Calculates and retrieves the total count of items in the cart.
   * @returns Total item count.
   */
  getCartCount() {
    return this.cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0); // Sum up the quantities of all items in the cart.
  }
}
