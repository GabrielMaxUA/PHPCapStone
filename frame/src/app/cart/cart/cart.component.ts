import { Component } from '@angular/core';
import { Service } from '../../service/service';
import { CartItem } from '../../Models/cartItem';

@Component({
  selector: 'app-cart',
  standalone: false,
  
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  cartItems: CartItem[]= [];
  total: number = 0;

  constructor(private service: Service){}

  ngOnInit(): void {
    this.loadCartItems();
    this.calculateTotal();
  }

  loadCartItems():void {
    console.log("getting items: ", this.cartItems)
    this.cartItems = this.service.getCartItems();
    this.calculateTotal();
  }


  removeItem(pictureID: number): void {
    this.service.removeFromCart(pictureID);
    this.loadCartItems();
  }

  clearCart(): void{
    this.service.clearCart();
    this.loadCartItems();
  }

  private calculateTotal(): void {
    this.total = this.cartItems.reduce((sum, item) => {
      // Ensure price is treated as a number
      const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      return sum + itemPrice;
    }, 0);

    // Round to 2 decimal places
    this.total = Math.round(this.total * 100) / 100;
    console.log('Calculated total:', this.total); // Debug log
  }

}
