import { Component, OnInit } from '@angular/core';
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
  baseUrl = 'http://localhost/frameBase';
  //baseUrl = 'https://triosdevelopers.com/~Max.Gabriel/frame/frameBase'; 

  constructor(
    private service: Service, 
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
    console.log('Items in cart:', this.cartItems);
    // Subscribe to cart items for real-time updates
    this.service.cartItems$.subscribe((items: CartItem[]) => {
      this.cartItems = items;
      this.calculateTotal();
    });
    // Load purchased items
    this.loadPurchasedItems();
  }

  loadCartItems(): void {
    this.cartItems = this.service.getCartItems();
    this.calculateTotal();
  }

  private checkIfPurchased(pictureID: number): void {
    this.service.checkPurchaseStatus(pictureID).subscribe({
      next: (response) => {
        if (response.success) {
          // Update the status in cartItems array
          const cartItem = this.cartItems.find(item => item.pictureID === pictureID);
          if (cartItem) {
            cartItem.status = response.status;
          }
          if (response.isPurchased || response.isDownloaded) {
            this.purchasedItems.add(pictureID);
          }
          this.calculateTotal(); // Recalculate total after status update
        }
      },
      error: (error) => {
        console.error('Error checking purchase status:', error);
      }
    });
  }
  
  private calculateTotal(): void {
    this.total = this.cartItems.reduce((sum, item) => {
      if (item.status === 'active') { // Only include active items in total
        const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        return sum + itemPrice;
      }
      return sum;
    }, 0);
    this.total = Math.round(this.total * 100) / 100;
  }

  private loadPurchasedItems(): void {
    this.service.checkSession().subscribe({
      next: (sessionData) => {
        if (sessionData.authenticated && sessionData.customerID) {
          this.customerID = sessionData.customerID;
          this.cartItems.forEach(item => {
            this.checkIfPurchased(item.pictureID);
          });
        }
      },
      error: (error) => {
        console.error('Session check failed:', error);
      }
    });
  }

  removeItem(pictureID: number): void {
    this.service.removeFromCart(pictureID);
    this.loadCartItems();
  }

  clearCart(): void {
    this.service.clearCart();
    this.loadCartItems();
  }

  downloadImage(pictureID: number): void {
    if (this.isDownloading) return;
  
    if (!this.customerID) {
      this.showDialog('Please log in to download your purchased images.');
      return;
    }
  
    this.isDownloading = true;
  
    this.service.downloadProduct(pictureID, this.customerID).subscribe({
      next: (blob: Blob) => {
        try {
          // Check if the response is an error message in JSON format
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const jsonResponse = JSON.parse(reader.result as string);
              this.calculateTotal();
              if (!jsonResponse.success) {
                this.showDialog(jsonResponse.error || 'Download failed');
                return;
              }
            } catch {
              // Not JSON, proceed with download
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              
              // Get the filename from Content-Disposition header if available
              const contentDisposition = blob.type;
              const filename = `high_quality_image_${pictureID}.png`;
              
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              
              this.service.removeFromCart(pictureID);
              this.showDialog('Download completed successfully!');
              this.updateImageStatus(pictureID);
              
            }
          };
          reader.readAsText(blob);
        } catch (error) {
          console.error('Error processing download:', error);
          this.showDialog('Failed to process download');
        }
      },
      error: (error) => {
        console.error('Download error:', error);
        if (error.error instanceof Blob) {
          // Try to read error message from blob
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorResponse = JSON.parse(reader.result as string);
              this.showDialog(errorResponse.error || 'Download failed');
            } catch {
              this.showDialog('Failed to download image');
            }
          };
          reader.readAsText(error.error);
        } else {
          this.showDialog('Failed to download image');
        }
      },
      complete: () => {
        this.isDownloading = false;
      }
    });
  }

  // New method to update image status
private updateImageStatus(pictureID: number): void {
  this.service.updateImageStatus(pictureID, 'downloaded').subscribe({
    next: (response) => {
      console.log('Image status updated successfully');
    },
    error: (error) => {
      console.error('Failed to update image status:', error);
    }
  });
}

  checkOut(): void {
    if (this.isProcessingCheckout) return;
    this.isProcessingCheckout = true;

    // First verify session
    this.service.checkSession().subscribe({
      next: (sessionData) => {
        if (!sessionData.authenticated) {
          this.showDialog('Please log in to complete your purchase');
          this.isProcessingCheckout = false;
          return;
        }

        this.customerID = sessionData.customerID;

        if (this.customerID === null) {
          this.showDialog('Customer ID is missing. Please try again.');
          this.isProcessingCheckout = false;
          return;
        }

        // Initiate payment process
        this.initiatePayment();
      },
      error: (error) => {
        console.error('Session check failed:', error);
        this.showDialog('Failed to verify session. Please try again.');
        this.isProcessingCheckout = false;
      }
    });
  }

  private initiatePayment(): void {
    // Filter only active items
    const activeItems = this.cartItems.filter(item => item.status === 'active');
    
    console.log('Initiating payment with:', {
        items: activeItems,  // Send only active items
        total: this.total,
        customerID: this.customerID
    });

    // Check if we have any active items
    if (activeItems.length === 0) {
        this.showDialog('No active items to purchase.');
        this.isProcessingCheckout = false;
        return;
    }

    this.service.initiatePayment({
        items: activeItems,  // Send only active items
        total: this.total,
        customerID: this.customerID
    }).subscribe({
        next: (paymentResponse) => {
            console.log('Payment response:', paymentResponse);
            console.log('Items in cart:', this.cartItems);
            if (paymentResponse.success) {
                this.orderNumber = paymentResponse.orderNumber;
                this.renderPayPalButton(paymentResponse.paypalClientId);
            } else {
                this.showDialog(paymentResponse.error || 'Payment initiation failed');
                this.isProcessingCheckout = false;
            }
        },
        error: (error) => {
            console.error('Payment initiation failed:', error);
            let errorMessage = 'Failed to initiate payment.';
            if (error.error && error.error.error) {
                errorMessage += ' ' + error.error.error;
            }
            this.showDialog(errorMessage);
            this.isProcessingCheckout = false;
        }
    });
}

  private renderPayPalButton(clientId: string): void {
    const paypal = (window as any).paypal;
    if (!paypal) {
      console.error('PayPal SDK not loaded');
      this.isProcessingCheckout = false;
      return;
    }

    // Clear existing buttons
    const container = document.getElementById('paypal-button-container');
    if (container) container.innerHTML = '';

    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: this.total.toFixed(2)
            }
          }]
        });
      },
      onApprove: async (data: any, actions: any) => {
        try {
          const orderData = await actions.order.capture();
          this.processSuccessfulPayment();
        } catch (error) {
          console.error('PayPal capture error:', error);
          this.showDialog('Payment processing failed. Please try again.');
        }
      },
      onError: (err: any) => {
        console.error('PayPal error:', err);
        this.showDialog('Payment processing failed. Please try again.');
        this.isProcessingCheckout = false;
      }
    }).render('#paypal-button-container');
  }

  private processSuccessfulPayment(): void {
    if (!this.customerID || !this.orderNumber) {
      this.showDialog('Missing customer ID or order number');
      return;
    }

    this.service.checkout(this.orderNumber, this.cartItems, this.customerID).subscribe({
      next: (response) => {
        if (response.success) {
          // Update purchased items
          this.cartItems.forEach(item => {
            this.purchasedItems.add(item.pictureID);
          });
          
          this.showDialog('Thank you for your purchase! You can now download your images.');
          // Don't clear cart immediately to allow downloads
        } else {
          throw new Error(response.error || 'Unknown error occurred');
        }
      },
      error: (error) => {
        console.error('Checkout error:', error);
        this.showDialog(`There was an error processing your order: ${error.message}. Please contact support.`);
      },
      complete: () => {
        this.isProcessingCheckout = false;
      }
    });
  }

  private showDialog(message: string): void {
    const dialogRef = this.dialog.open(DialogOkComponent, {
      width: '400px',
      data: { message }
    });
  }

  // Navigate to gallery
  continueShopping(): void {
    this.router.navigate(['/gallery']);
  }
}


// import { Component } from '@angular/core';
// import { Service } from '../../service/service';
// import { CartItem } from '../../Models/interfaces';
// import { DialogComponent } from '../../dialog/dialog.component';
// import { MatDialog } from '@angular/material/dialog';
// import { DialogOkComponent } from '../../dialog-ok/dialog-ok.component';

// @Component({
//   selector: 'app-cart',
//   templateUrl: './cart.component.html',
//   styleUrls: ['./cart.component.css'],
//   standalone: false
// })
// export class CartComponent {
//   cartItems: CartItem[] = [];
//   total: number = 0;
//   isProcessingCheckout: boolean = false;
//   orderNumber: string | null = null;
//   private customerID: number | null = null;  // Add this to store customerID
//   purchasedItems: Set<number> = new Set();
//   isDownloading: boolean = false;

//   constructor(private service: Service, private dialog: MatDialog,) {}

//   ngOnInit(): void {
//     this.loadCartItems();
//     this.calculateTotal();
//   }

//   loadCartItems(): void {
//     this.cartItems = this.service.getCartItems();
//     this.calculateTotal();
//   }

//   removeItem(pictureID: number): void {
//     this.service.removeFromCart(pictureID);
//     this.loadCartItems();
//   }

//   clearCart(): void {
//     this.service.clearCart();
//     this.loadCartItems();
//   }

//   private calculateTotal(): void {
//     this.total = this.cartItems.reduce((sum, item) => {
//       const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
//       return sum + itemPrice;
//     }, 0);
//     this.total = Math.round(this.total * 100) / 100;
//   }

//   checkOut(): void {
//     if (this.isProcessingCheckout) return;
//     this.isProcessingCheckout = true;

//     // First verify session
//     this.service.checkSession().subscribe({
//       next: (sessionData) => {
//         if (!sessionData.authenticated) {
//           alert('Please log in to complete your purchase');
//           this.isProcessingCheckout = false;
//           return;
//         }

//         this.customerID = sessionData.customerID; // Store customerID

//         if (this.customerID === null) {
//           alert('Customer ID is missing. Please try again.');
//           this.isProcessingCheckout = false;
//           return;
//         }

//         // Initiate payment process
//         this.service.initiatePayment({
//           items: this.cartItems,
//           total: this.total,
//           customerID: this.customerID
//         }).subscribe({
//           next: (paymentResponse) => {
//             if (paymentResponse.success) {
//               this.orderNumber = paymentResponse.orderNumber;
//               this.renderPayPalButton(paymentResponse.paypalClientId);
//             } else {
//               throw new Error(paymentResponse.error);
//             }
//           },
//           error: (error) => {
//             console.error('Payment initiation failed:', error);
//             const dialogRef = this.dialog.open(DialogOkComponent, {
//               width: '400px',
//               data: { message: 'Failed to initiate payment. Please try again.' }
//             });
//             this.isProcessingCheckout = false;
//           }
//         });
//       },
//       error: (error) => {
//         console.error('Session check failed:', error);
//         alert('Failed to verify session. Please try again.');
//         this.isProcessingCheckout = false;
//       }
//     });
//   }

//   private renderPayPalButton(clientId: string): void {
//     const paypal = (window as any).paypal;
//     if (!paypal) {
//       console.error('PayPal SDK not loaded');
//       this.isProcessingCheckout = false;
//       return;
//     }

//     // Clear existing buttons
//     const container = document.getElementById('paypal-button-container');
//     if (container) container.innerHTML = '';

//     paypal.Buttons({
//       createOrder: (data: any, actions: any) => {
//         return actions.order.create({
//           purchase_units: [{
//             amount: {
//               value: this.total.toFixed(2)
//             }
//           }]
//         });
//       },
//       onApprove: async (data: any, actions: any) => {
//         try {
//           const orderData = await actions.order.capture();
          
//           if (!this.customerID || !this.orderNumber) {
//             throw new Error('Missing customer ID or order number');
//           }

//           // Process the completed order
//           this.service.checkout(this.orderNumber, this.cartItems, this.customerID).subscribe({
//             next: (response) => {
//               if (response.success) {
//                 const dialogRef = this.dialog.open(DialogOkComponent, {
//                   width: '400px',
//                   data: { message: 'Thank you for your purchase!' }
//                 });
//                 this.clearCart();
//               } else {
//                 throw new Error(response.error || 'Unknown error occured');
//               }
//             },
//             error: (error) => {
//               console.error('Checkout error: ', error)
//               const errorMessage = error.error?.error || error.message || 'Unknown error occurred';
//               const dialogRef = this.dialog.open(DialogOkComponent, {
//                     width: '400px',
//                     data: { message: 'There was an error processing your order. Please contact support.', error }
//                   });
             
//             }
//           });
//         } catch (error) {
//           console.error('PayPal capture error:', error);
//           alert('Payment processing failed. Please try again.');
//         }
//       },
//       onError: (err: any) => {
//         console.error('PayPal error:', err);
//         alert('Payment processing failed. Please try again.');
//         this.isProcessingCheckout = false;
//       }
//     }).render('#paypal-button-container');
//   }

//   downloadImage(pictureID: number): void {
//         if (this.isDownloading) return;
      
//         if (!this.customerID) {
//           this.showDialog('Please log in to download your purchased images.');
//           return;
//         }
      
//         this.isDownloading = true;
      
//         this.service.downloadProduct(pictureID, this.customerID).subscribe({
//           next: (blob: Blob) => {
//             try {
//               // Check if the response is an error message in JSON format
//               const reader = new FileReader();
//               reader.onload = () => {
//                 try {
//                   const jsonResponse = JSON.parse(reader.result as string);
//                   if (!jsonResponse.success) {
//                     this.showDialog(jsonResponse.error || 'Download failed');
//                     return;
//                   }
//                 } catch {
//                   // Not JSON, proceed with download
//                   const url = window.URL.createObjectURL(blob);
//                   const link = document.createElement('a');
//                   link.href = url;
                  
//                   // Get the filename from Content-Disposition header if available
//                   const contentDisposition = blob.type;
//                   const filename = `high_quality_image_${pictureID}.png`;
                  
//                   link.download = filename;
//                   document.body.appendChild(link);
//                   link.click();
//                   document.body.removeChild(link);
//                   window.URL.revokeObjectURL(url);
                  
//                   this.showDialog('Download completed successfully!');
//                 }
//               };
//               reader.readAsText(blob);
//             } catch (error) {
//               console.error('Error processing download:', error);
//               this.showDialog('Failed to process download');
//             }
//           },
//           error: (error) => {
//             console.error('Download error:', error);
//             if (error.error instanceof Blob) {
//               // Try to read error message from blob
//               const reader = new FileReader();
//               reader.onload = () => {
//                 try {
//                   const errorResponse = JSON.parse(reader.result as string);
//                   this.showDialog(errorResponse.error || 'Download failed');
//                 } catch {
//                   this.showDialog('Failed to download image');
//                 }
//               };
//               reader.readAsText(error.error);
//             } else {
//               this.showDialog('Failed to download image');
//             }
//           },
//           complete: () => {
//             this.isDownloading = false;
//           }
//         });
//       }


//   private showDialog(message: string): void {
//     const dialogRef = this.dialog.open(DialogOkComponent, {
//       width: '400px',
//       data: { message }
//     });
//   }
// }