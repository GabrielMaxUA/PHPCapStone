import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Service } from '../../service/service';
import { CartItem } from '../../Models/interfaces';
import { DialogComponent } from '../../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogOkComponent } from '../../dialog-ok/dialog-ok.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  standalone: false
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;
  isProcessingCheckout: boolean = false;
  orderNumber: string | null = null;
  private customerID: number | null = null;
  purchasedItems: Set<number> = new Set();
  isDownloading: boolean = false;

  constructor(
    private service: Service, 
    private dialog: MatDialog,
    private router: Router,
    private cdRef: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initial setup for the cart component

    console.log('Items in cart:', this.cartItems);

    // Subscribe to cart items for real-time updates from the service
    this.service.cartItems$.subscribe((items: CartItem[]) => {
      this.cartItems = items; // Update the local cart items array
      this.calculateTotal(); // Recalculate the total price
      this.cdRef.detectChanges(); // Trigger change detection for updates
      console.log('Cart items updated:', items);
    });

    // Load purchased items and check session authentication
    this.service.checkSession().subscribe((sessionData) => {
      if (sessionData.authenticated) { // If user is authenticated
        this.service.loadCartFromStorage(); // Load cart items from storage
        this.loadPurchasedItems(); // Load purchased items
      }
    });
}

loadCartItems(): void {
    // Load cart items from the service
    this.cartItems = this.service.getCartItems();
    this.calculateTotal(); // Calculate the total price of the items in the cart
}

private checkIfPurchased(pictureID: number): void {
    // Check if a specific picture has been purchased
    this.service.checkPurchaseStatus(pictureID).subscribe({
      next: (response) => {
        if (response.success) {
          // Find the cart item and update its status
          const cartItem = this.cartItems.find(item => item.pictureID === pictureID);
          if (cartItem) {
            cartItem.status = response.status; // Update the item's status
          }
          if (response.isPurchased || response.isDownloaded) {
            this.purchasedItems.add(pictureID); // Mark the item as purchased
          }
          this.calculateTotal(); // Recalculate the total price
        }
      },
      error: (error) => {
        console.error('Error checking purchase status:', error); // Log errors
      }
    });
}

private calculateTotal(): void {
    // Calculate the total price of active items in the cart
    this.total = this.cartItems.reduce((sum, item) => {
      if (item.status === 'active') { // Only include active items
        const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        return sum + itemPrice; // Add the item's price to the total
      }
      return sum;
    }, 0);

    this.total = Math.round(this.total * 100) / 100; // Round to two decimal places
}

private loadPurchasedItems(): void {
    // Load purchased items for the authenticated user
    this.service.checkSession().subscribe({
      next: (sessionData) => {
        if (sessionData.authenticated && sessionData.customerID) {
          this.customerID = sessionData.customerID; // Set the customer ID
          this.cartItems.forEach(item => {
            this.checkIfPurchased(item.pictureID); // Check purchase status for each item
          });
        }
      },
      error: (error) => {
        console.error('Session check failed:', error); // Log errors
      }
    });
}

removeItem(pictureID: number): void {
    // Remove an item from the cart by picture ID
    this.service.removeFromCart(pictureID);
    this.loadCartItems(); // Reload the cart items
}

clearCart(): void {
    // Clear all items from the cart
    this.service.clearCart();
    this.loadCartItems(); // Reload the cart items
}

downloadImage(pictureID: number): void {
    if (this.isDownloading) return; // Prevent multiple simultaneous downloads

    if (!this.customerID) {
      // Show a dialog if the user is not logged in
      this.showDialog('Attention', 'Please log in to download your purchased images.');
      return;
    }

    // Show a confirmation dialog before downloading
    const message = "Please be aware that after downloading, your purchased image will be removed from the cart and you won't be able to retrieve it again.";

    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px', // Set dialog width
      data: { heading: 'WARNING', message }, // Pass the warning message
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.startDownload(pictureID); // Start the download process if confirmed
      } else {
        console.log('Download canceled by the user.');
      }
    });
}

private startDownload(pictureID: number): void {
    this.isDownloading = true; // Flag to indicate the download is in progress
    if (this.customerID === null) {
      console.error('Customer ID is null. Cannot proceed with the download.');
      return;
    }
    this.service.downloadProduct(pictureID, this.customerID).subscribe({
      
      next: (blob: Blob) => {
        try {
          // Create a URL for the downloaded Blob
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `high_quality_image_${pictureID}.png`; // Default filename
          document.body.appendChild(link);
          link.click(); // Trigger download
          document.body.removeChild(link); // Remove the link element
          window.URL.revokeObjectURL(url); // Revoke the Blob URL

          this.service.removeFromCart(pictureID); // Remove the item from the cart
          this.showDialog('Thank you', 'Download completed successfully!');
          this.updateImageStatus(pictureID); // Update the item's status to 'downloaded'
        } catch (error) {
          console.error('Error during download:', error);
          this.showDialog('OOPS', 'Failed to process download.');
        }
      },
      error: (error) => {
        console.error('Download error:', error); // Log errors
        this.showDialog('OOPS', 'Failed to process download.');
      },
      complete: () => {
        this.isDownloading = false; // Reset the downloading flag
      },
    });
}

private updateImageStatus(pictureID: number): void {
    // Update the status of the image to 'downloaded'
    this.service.updateImageStatus(pictureID, 'downloaded').subscribe({
      next: () => {
        console.log('Image status updated successfully');
      },
      error: (error) => {
        console.error('Failed to update image status:', error); // Log errors
      }
    });
}

checkOut(): void {
    if (this.isProcessingCheckout) return; // Prevent multiple simultaneous checkouts

    this.isProcessingCheckout = true; // Set the checkout processing flag

    // Verify the user's session
    this.service.checkSession().subscribe({
      next: (sessionData) => {
        if (!sessionData.authenticated) { // If not authenticated, show a dialog
          this.showDialog('Sorry', 'Please log in to complete your purchase');
          this.isProcessingCheckout = false; // Reset the flag
          return;
        }

        this.customerID = sessionData.customerID; // Set the customer ID

        if (this.customerID === null) {
          this.showDialog('Customer ID is missing.', 'Please try again.');
          this.isProcessingCheckout = false; // Reset the flag
          return;
        }

        this.initiatePayment(); // Proceed to initiate payment
      },
      error: (error) => {
        console.error('Session check failed:', error); // Log errors
        this.showDialog('Error', 'Failed to verify session. Please try again.');
        this.isProcessingCheckout = false; // Reset the flag
      }
    });
}

private initiatePayment(): void {
    // Filter only active cart items for payment
    const activeItems = this.cartItems.filter(item => item.status === 'active');

    console.log('Initiating payment with:', {
      items: activeItems, // Active items to be paid for
      total: this.total, // Total price
      customerID: this.customerID // Customer ID for reference
    });

    if (activeItems.length === 0) {
        this.showDialog('Sorry', 'No active items to purchase.');
        this.isProcessingCheckout = false; // Reset the flag
        return;
    }

    // Call the service to initiate payment
    this.service.initiatePayment({
        items: activeItems, // Active items
        total: this.total, // Total price
        customerID: this.customerID // Customer ID
    }).subscribe({
        next: (paymentResponse) => {
            if (paymentResponse.success) {
                this.orderNumber = paymentResponse.orderNumber; // Store the order number
                this.renderPayPalButton(paymentResponse.paypalClientId); // Render PayPal button
            } else {
                this.showDialog('Error', paymentResponse.error || 'Payment initiation failed.');
                this.isProcessingCheckout = false; // Reset the flag
            }
        },
        error: (error) => {
            console.error('Payment initiation failed:', error); // Log errors
            this.showDialog('', 'Failed to initiate payment. Please try again.');
            this.isProcessingCheckout = false; // Reset the flag
        }
    });
}

private renderPayPalButton(clientId: string): void {
    const paypal = (window as any).paypal;
    if (!paypal) {
      console.error('PayPal SDK not loaded');
      this.isProcessingCheckout = false; // Reset the flag
      return;
    }

    const container = document.getElementById('paypal-button-container');
    if (container) container.innerHTML = ''; // Clear existing buttons

    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: this.total.toFixed(2) // Set the total price
            }
          }]
        });
      },
      onApprove: async (data: any, actions: any) => {
        try {
          const orderData = await actions.order.capture(); // Capture the payment
          this.processSuccessfulPayment(); // Handle successful payment
        } catch (error) {
          console.error('PayPal capture error:', error); // Log errors
          this.showDialog('Error', 'Payment processing failed. Please try again.');
        }
      },
      onError: (err: any) => {
        console.error('PayPal error:', err); // Log errors
        this.showDialog('Oops...', 'Payment processing failed. Please try again.');
        this.isProcessingCheckout = false; // Reset the flag
      }
    }).render('#paypal-button-container'); // Render the PayPal button
}

processSuccessfulPayment(): void {
    if (!this.customerID || !this.orderNumber) {
      this.showDialog('Error', 'Missing customer ID or order number');
      return;
    }

    // Finalize checkout with the service
    this.service.checkout(this.orderNumber, this.cartItems, this.customerID).subscribe({
      next: (response) => {
        if (response.success) {
          this.cartItems.forEach(item => {
            this.purchasedItems.add(item.pictureID); // Mark items as purchased
          });
          this.service.loadCartFromStorage(); // Reload the cart
          this.showDialog('Thank you for your purchase!', 'You can now download your images.');
        } else {
          throw new Error(response.error || 'Unknown error occurred');
        }
      },
      error: (error) => {
        console.error('Checkout error:', error); // Log errors
        this.showDialog('Attention!', `There was an error processing your order: ${error.message}. Please contact support.`);
      },
      complete: () => {
        this.isProcessingCheckout = false; // Reset the flag
      }
    });
}

private showDialog(header: string, message: string): void {
    // Open a dialog with the provided header and message
    const dialogRef = this.dialog.open(DialogOkComponent, {
      width: '400px',
      data: { header, message }
    });
}

continueShopping(): void {
    // Navigate back to the gallery
    this.router.navigate(['/gallery']);
}
}