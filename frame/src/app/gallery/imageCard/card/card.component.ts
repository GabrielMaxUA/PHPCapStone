import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '../../../service/user.service'; // User service for handling user-related state
import { User } from '../../../Models/interfaces'; // Interface defining the structure of a user
import { MatDialog } from '@angular/material/dialog'; // Angular Material Dialog for modals (not used in this component but imported)

@Component({
  selector: 'app-card', // Selector to use this component in templates
  standalone: false, // Indicates that this component is part of a larger module
  templateUrl: './card.component.html', // Path to the HTML template
  styleUrl: './card.component.css' // Path to the CSS file
})

export class CardComponent {
  @Input() item: any; // Input property for the item being displayed in the card
  @Input() isAdmin: boolean = false; // Input to determine if the current user is an admin
  @Input() galleryType: 'nature' | 'staged' | 'architecture' = 'nature'; // Input for the type of gallery
  selectedImageIndex: number | null = null; // Tracks the selected image index (if applicable)
  
  @Output() imageClick = new EventEmitter<void>(); // Emits an event when an image is clicked
  @Output() priceChange = new EventEmitter<{pictureID: number, price: number}>(); // Emits an event when the price is updated
  @Output() deleteImage = new EventEmitter<string>(); // Emits an event to delete an image
  @Output() cartAdd = new EventEmitter<number>(); // Emits an event to add an item to the cart
  
  user: User | null = null; // Holds the current user's data

  constructor(private userService: UserService) {
    // Injecting UserService to access user-related information
  }

  // Get the image source based on the gallery type
  getImageSrc(): string {
    switch(this.galleryType) {
      case 'nature':
        return this.item.nGalleryImage || ''; // Return the nature gallery image URL
      case 'staged':
        return this.item.sGalleryImage || ''; // Return the staged gallery image URL
      case 'architecture':
        return this.item.aGalleryImage || ''; // Return the architecture gallery image URL
      default:
        return ''; // Return an empty string if no gallery type matches
    }
  }
  
  // Handle image click events
  onImageClick(): void {
    this.imageClick.emit(); // Emit the image click event
  }

  // Handle price submission
  onPriceSubmit(): void {
    this.priceChange.emit({
      pictureID: this.item.pictureID, // Pass the picture ID
      price: this.item.price // Pass the updated price
    });
  }

  // Handle delete action
  onDelete(): void {
    this.deleteImage.emit(this.item.pictureID); // Emit the delete image event with the picture ID
  }

  // Handle adding an item to the cart
  onAddtoCart(): void {
    console.log('Card component: Emitting pictureID:', this.item.pictureID); // Log the picture ID being added to the cart
    this.cartAdd.emit(this.item.pictureID); // Emit the cart add event with the picture ID
  }
}
