import { Component } from '@angular/core';
import { User } from '../Models/interfaces';
import { MatDialog } from '@angular/material/dialog';
import { Service } from '../service/service';
import { DialogComponent } from '../dialog/dialog.component';
import { DialogOkComponent } from '../dialog-ok/dialog-ok.component';
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
    // Component initialization
    this.getCustomers(); // Fetch the list of customers when the component loads
}

getCustomers(): void {
    // Fetches the list of customers from the service
    this.service.getCustomers().subscribe(
      (data: User[]) => {
        this.customers = data; // Assign fetched data to the customers list
        this.filteredCustomers = data; // Initialize the filtered list with all customers
      },
      (error) => {
        // Log any errors encountered while fetching customers
        console.error('Error fetching customers:', error);
      }
    );
}

toggleStatus(item: any): void {
    // Toggles the status of a customer between 'active' and 'blocked'
    const newStatus = item.status === 'active' ? 'blocked' : 'active'; // Determine the new status
    const message = item.status === 'active'
        ? `Are you sure you want to block ${item.firstName} ${item.lastName}?` // Confirmation message for blocking
        : `Are you sure you want to activate ${item.firstName} ${item.lastName}?`; // Confirmation message for activating
  
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px', // Set dialog width
      data: { 
        heading: 'Warning!', // Dialog heading
        message: message, // Confirmation message
        firstName: item.firstName, // Pass first name for display
        lastName: item.lastName // Pass last name for display
      } 
    });
  
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        // If the user confirms, update the status
        item.status = newStatus; // Update the local status
        this.service.updateUserStatus(item.customerID, item.status, item.firstName, item.lastName).subscribe(
          (response) => {
            // Display a success dialog after the status update
            const dialogRef = this.dialog.open(DialogOkComponent, {
              width: '400px',
              data: { 
                header: `Success.`,
                message: `Status updated to '${newStatus}' for user:
               ${item.firstName} ${item.lastName}` // Success message with updated status and user name
              }
            });
            console.log(`Status updated to '${newStatus}' for user:`, item.customerID);
          },
          (error) => {
            // Log any errors during the status update
            console.error('Error updating status:', error);
            alert('Failed to update status. Please try again.'); // Alert the user about the failure
          }
        );
      } else {
        // If the user cancels, refresh the customer list
        this.getCustomers();
      }
    });
}
  
filterCustomers(): void {
    // Filters the list of customers based on the search query
    const query = this.searchQuery.trim().toLowerCase(); // Normalize the search query by trimming and converting to lowercase
    if (!query) {
      // If search query is empty, show all customers
      this.filteredCustomers = [...this.customers];
      return;
    }
  
    this.filteredCustomers = this.customers.filter((customer) => {
      // Check if the search query matches the first name, last name, or email (case-insensitive)
      return (
        customer.firstName?.toLowerCase().includes(query) ||
        customer.lastName?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query)
      );
    });
}

}
