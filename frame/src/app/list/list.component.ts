import { Component } from '@angular/core';
import { Service } from '../service/service';
import { User } from '../user';
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent {

  customers: User[] = [];
  errorMessage: string = '';

constructor(private service: Service){}
ngOnInit(): void {
  this.getCustomers();
}

getCustomers(): void {
  this.service.getCustomers().subscribe({
    next: (data) => (this.customers = data),
    error: (error) =>
      (this.errorMessage = 'Could not fetch contacts. Please try again.'),
  });
}
}
