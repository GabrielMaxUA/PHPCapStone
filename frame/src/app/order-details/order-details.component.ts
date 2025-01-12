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

  baseUrl = 'http://localhost/frameBase'; // Add your base URL here
  //private readonly baseUrl = 'https://triosdevelopers.com/~Max.Gabriel/frame/frameBase';
  constructor(
    private route: ActivatedRoute,
    private service: Service
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.orderNumber = params['orderNumber'];
      if (this.orderNumber) {
        this.loadOrderItems();
      }
    });
  }

  loadOrderItems() {
    this.service.getOrderDetailsByOrderID(this.orderNumber).subscribe({
      next: (items) => {
        this.orderItems = items.map(item => ({
          ...item,
          // Ensure image paths are complete
          imageLow: this.getFullImagePath(item.imageLow)
        }));
        console.log('Processed items:', this.orderItems); // Debug log
      },
      error: (error) => {
        console.error('Error loading order items:', error);
      }
    });
  }

  getFullImagePath(path: string): string {
    if (!path) return '';
    // If it's already a full URL, return as is
    if (path.startsWith('http')) return path;
    // If it starts with a slash, remove it
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${this.baseUrl}/${cleanPath}`;
  }

  toggleImage(item: any) {
    item.showHighRes = !item.showHighRes;
  }

  goBack() {
    window.history.back();
  }

}