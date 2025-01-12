import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Service } from '../service/service';
import { CustomerInfo, OrderDetail, OrderResponse } from '../Models/interfaces';

@Component({
  selector: 'app-orders',
  standalone: false,
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  // Customer related properties
  customerID: number = 0;
  customerInfo: CustomerInfo | null = null;
  
  // Order related properties
  orderDetails: OrderDetail[] = [];
  filteredOrders: OrderDetail[] = [];
  
  // Search related properties
  searchQuery: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: Service
  ) {}

  ngOnInit() {
    // Subscribe to route parameters to get customerID
    this.route.queryParams.subscribe(params => {
      this.customerID = parseInt(params['customerID']);
      if (this.customerID) {
        this.loadOrders();
      }
    });
  }

  /**
   * Loads orders for the current customer
   */
  loadOrders() {
    this.service.getOrdersByCustomerID(this.customerID).subscribe({
      next: (response: OrderResponse) => {
        // Store customer information
        this.customerInfo = response.customerInfo;
        
        // Store and initialize order lists
        this.orderDetails = response.orders;
        this.filteredOrders = [...response.orders];
        
        // Log for debugging
        console.log('Customer Info:', response.customerInfo);
        console.log('Orders:', response.orders);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        // TODO: Implement error handling (e.g., show error message to user)
      }
    });
  }

  /**
   * Navigates to order details page
   * @param orderNumber - The order number to view details for
   */
  showOrderDetails(orderNumber: string) {
    this.router.navigate(['/order-details'], {
      queryParams: { orderNumber }
    });
  }

  /**
   * Filters orders based on search query
   */
  filterOrders(): void {
    const query = this.searchQuery.trim().toLowerCase();
    
    // If search query is empty, show all orders
    if (!query) {
      this.filteredOrders = [...this.orderDetails];
      return;
    }
  
    // Filter orders based on search criteria
    this.filteredOrders = this.orderDetails.filter((order) => {
      // Add null checks for all properties
      const orderNumber = order.orderNumber?.toLowerCase() ?? '';
      const date = order.date?.toString().toLowerCase() ?? '';
      const total = order.total?.toString() ?? '';

      // Return true if any field matches the search query
      return (
        orderNumber.includes(query) ||
        date.includes(query) ||
        total.includes(query)
      );
    });
  }

  /**
   * Clears the search and resets the filtered orders
   */
  clearSearch(): void {
    this.searchQuery = '';
    this.filteredOrders = [...this.orderDetails];
  }

  /**
   * Formats the total amount with currency symbol
   * @param total - The total amount to format
   * @returns Formatted string with currency symbol
   */
  formatTotal(total: number): string {
    return `$${total.toFixed(2)}`;
  }
}