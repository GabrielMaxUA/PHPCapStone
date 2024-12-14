import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../../../Models/user';

@Component({
  selector: 'app-card',
  standalone: false,
  
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})

export class CardComponent {
  @Input() item: any; // You might want to create an interface for this
  @Input() isAdmin: boolean = false;
  @Input() galleryType: 'nature' | 'staged' | 'architecture' = 'nature';
  
  @Output() imageClick = new EventEmitter<void>();
  @Output() priceChange = new EventEmitter<{pictureID: string, price: number}>();
  @Output() deleteImage = new EventEmitter<string>();
  @Output() cartAdd = new EventEmitter<number>();

  getImageSrc(): string {
    // console.log('Gallery Type:', this.galleryType); // Debug log
    // console.log('Item:', this.item); // Debug log
    switch(this.galleryType) {
      case 'nature':
        return this.item.nGalleryImage || '';
      case 'staged':
        return this.item.sGalleryImage || '';
      case 'architecture':
        return this.item.aGalleryImage || '';
      default:
       
        return '';
    }
  }
  
  onImageClick(): void {
    this.imageClick.emit();
  }

  onPriceSubmit(): void {
    this.priceChange.emit({
      pictureID: this.item.pictureID,
      price: this.item.price
    });
  }

  onDelete(): void {
    this.deleteImage.emit(this.item.pictureID);
  }

  onAddtoCart(): void {
    console.log('Card component: Emitting pictureID:', this.item.pictureID);
    this.cartAdd.emit(this.item.pictureID);
  }
}