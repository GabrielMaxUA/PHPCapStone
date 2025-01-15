// order-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Service } from '../service/service';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css'],
  standalone: false
})
export class OrderDetailsComponent implements OnInit {
  orderNumber: string = '';
  filteredOrders: any[] = []; // Holds filtered results
  orderItems: any[] = [];
  searchQuery: string = ''; // Binds to search input

//baseUrl = 'http://localhost/frameBase'; // Add your base URL here
private readonly baseUrl = 'https://triosdevelopers.com/~Max.Gabriel/frame/frameBase';
  constructor(private route: ActivatedRoute, private service: Service ) {}

  ngOnInit() {
    // Subscribe to route query parameters to retrieve the order number
    this.route.queryParams.subscribe(params => {
      this.orderNumber = params['orderNumber']; // Extract the order number from the query parameters
      if (this.orderNumber) {
        // If an order number exists, load the corresponding order items
        this.loadOrderItems();
      }
    });
  }
  
  loadOrderItems() {
    // Fetch the order details for the given order number
    this.service.getOrderDetailsByOrderID(this.orderNumber).subscribe({
      next: (items) => {
        // Process each order item to ensure image paths are full URLs
        this.orderItems = items.map(item => ({
          ...item,
          imageLow: this.getFullImagePath(item.imageLow) // Generate the full image path for the low-resolution image
        }));
        console.log('Processed items:', this.orderItems); // Debug log to verify processed items
      },
      error: (error) => {
        // Log any error encountered while fetching the order items
        console.error('Error loading order items:', error);
      }
    });
  }
  
  getFullImagePath(path: string): string {
    // Generate the full URL for the given image path
    if (!path) return ''; // Return an empty string if the path is undefined or null
  
    if (path.startsWith('http')) return path; // If the path is already a full URL, return it as is
  
    // Remove the leading slash if present
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
    // Combine the base URL with the cleaned path to generate the full URL
    return `${this.baseUrl}/${cleanPath}`;
  }
  
  toggleImage(item: any) {
    // Toggle between high-resolution and low-resolution images for the given item
    item.showHighRes = !item.showHighRes; // Toggle the `showHighRes` property
  }
  
  goBack() {
    // Navigate back to the previous page in the browser's history
    window.history.back();
  }
  
}