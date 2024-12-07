import { Component } from '@angular/core';
import { User } from '../user';
import { MatDialog } from '@angular/material/dialog';
import { Service } from '../service/service';
import { DialogComponent } from '../dialog/dialog.component';
import { DialogOkComponent } from '../dialog-ok/dialog-ok.component';

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

  constructor(private service: Service, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.getCustomers();
  }

  getCustomers(): void {
    this.service.getCustomers().subscribe(
      (data: User[]) => {
        this.customers = data;
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
        ? 'Are you sure you want to block this user?'
        : 'Are you sure you want to activate this user?';
  
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      data: { message: message } // Pass the message dynamically
    });
  
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        item.status = newStatus;
        this.service.updateUserStatus(item.customerID, item.status).subscribe(
          (response) => {
            const dialogRef = this.dialog.open(DialogOkComponent, {
              width: '400px',
              data: { message: `Status updated to '${newStatus}' for user:`, item } // Pass the message dynamically
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
  

  // toggleStatus(item: any): void {
  //   this.selectedItem = item; // Save the selected item
  //   this.dialogMessage =
  //     item.status === 'active'
  //       ? 'Are you sure you want to block this user?'
  //       : 'Are you sure you want to activate this user?';
  //   this.showDialog = true; // Show the dialog
  // }

  // handleDialogResult(confirmed: boolean): void {
  //   this.showDialog = false; // Hide the dialog

  //   if (confirmed) {
  //     // Proceed with the status update
  //     const newStatus = this.selectedItem.status === 'active' ? 'blocked' : 'active';
  //     this.selectedItem.status = newStatus;

  //     this.service.updateUserStatus(this.selectedItem.customerID, this.selectedItem.status).subscribe(
  //       (response) => {
  //         console.log('Status updated successfully:', response);
  //         alert('Status updated successfully.');
  //       },
  //       (error) => {
  //         console.error('Error updating status:', error);
  //         alert('Failed to update status. Please try again.');
  //       }
  //     );
  //   } else {
  //     console.log('Action canceled.');
  //   }
  // }

}
