import { Component } from '@angular/core';
import { Service } from '../service/service';

@Component({
    selector: 'app-products',
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.css'],
    standalone: false
})
export class ProductsComponent {
  constructor(private service: Service) {}

  addInput(): void {
    // Add JavaScript logic for dynamic inputs here
  }

  validateForm(): boolean {
    // Add JavaScript validation logic here
    return true;
  }
}
