import { Component } from '@angular/core';
import { User } from '../Models/interfaces';
import { MatDialog } from '@angular/material/dialog';
import { Service } from '../service/service';
import { DialogComponent } from '../dialog/dialog.component';
import { DialogOkComponent } from '../dialog-ok/dialog-ok.component';
import { first } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-customers',
    templateUrl: './customers.component.html',
    styleUrls: ['./customers.component.css'],
    standalone: false
})

export class CustomersComponent {
  customers: User[] = [];
  showDialog = false; // Whether the dialog is visible
  dialogMessage = ''; // Message to display in the dialog
  selectedItem: any; // Selected item for confirmation
  filteredCustomers: User[] = []; // Holds filtered results
  searchQuery: string = ''; // Binds to search input
  constructor(private service: Service, private dialog: MatDialog, private router: Router) {}

  ngOnInit(): void {
    this.getCustomers();
  }

  getCustomers(): void {
    this.service.getCustomers().subscribe(
      (data: User[]) => {
        this.customers = data;
        this.filteredCustomers = data; // Initialize filtered list

      },
      (error) => {
        console.error('Error fetching customers:', error);
      }
    );
  }

  toggleStatus(item: any): void {
    const newStatus = item.status === 'active' ? 'blocked' : 'active';
    const message =
      item.status === 'active'
        ? `Are you sure you want to block ${item.firstName} ${item.lastName}?`
        : `Are you sure you want to activate ${item.firstName} ${item.lastName}?`;
  
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      data: { 
        message: message,
        firstName: item.firstName, // Pass first name
        lastName: item.lastName    // Pass last name
      } 
    });
  
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        item.status = newStatus;
        this.service.updateUserStatus(item.customerID, item.status, item.firstName, item.lastName).subscribe(
          (response) => {
            const dialogRef = this.dialog.open(DialogOkComponent, {
              width: '400px',
              data: { 
                message: `Status updated to '${newStatus}' for user:
               ${item.firstName} ${item.lastName} `   // Display the  name
              }
            });
            console.log(`Status updated to '${newStatus}' for user:`, item.customerID);
          },
          (error) => {
            console.error('Error updating status:', error);
            alert('Failed to update status. Please try again.');
          }
        );
      } else {
        this.getCustomers();
      }
    });
  }
  
  filterCustomers(): void {
    const query = this.searchQuery.trim().toLowerCase(); // Trim whitespace and normalize query
    if (!query) {
      // If search query is empty, reset to show all customers
      this.filteredCustomers = [...this.customers];
      return;
    }
  
    this.filteredCustomers = this.customers.filter((customer) => {

      // if (customer.email?.toLowerCase() === query) {
      //   return true;
      // }

      return (
        customer.firstName?.toLowerCase().includes(query) ||
        customer.lastName?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query)
      );
    });
  }
  

}
