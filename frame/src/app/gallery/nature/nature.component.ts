// nature.component.ts
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Service } from '../../service/service';
import { UserService } from '../../service/user.service';
import { User, ProductEntry } from '../../Models/interfaces';
import { DialogOkComponent } from '../../dialog-ok/dialog-ok.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-nature',
  templateUrl: './nature.component.html',
  styleUrls: ['./nature.component.css'],
  standalone: false
})
export class NatureComponent {
  selectedFile: File | null = null;
  isUploading: boolean = false;
  user: User | null = null;
  galleryItems: { pictureID: number, nGalleryImage: string; price: number, status?: string }[] = [];
  selectedImageIndex: number | null = null;
  baseUrl = 'http://localhost/frameBase';
  //baseUrl = 'https://triosdevelopers.com/~Max.Gabriel/frame/frameBase'; // Add your base URL here
  // Array to store multiple product entries
  productEntries: ProductEntry[] = [
    { file: null, price: null, isValid: false }
  ];
  @ViewChild('entriesContainer')
  entriesContainer!: ElementRef;
  
  constructor(private userService: UserService, private service: Service, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.userService.user$.subscribe((user) => {
      this.user = user;
    });
    this.loadGalleryData();
  }

  // Add new product entry
  addProductEntry() {
    const lastEntry = this.productEntries[this.productEntries.length - 1];
    if (lastEntry.file && lastEntry.price) {
      this.productEntries.push({ file: null, price: null, isValid: false });
      this.scrollToBottom()
    }
  }

  // Remove product entry
  removeProductEntry(index: number) {
    if (this.productEntries.length > 1) {
      this.productEntries.splice(index, 1);
    }
  }

  // Validate entry
  validateEntry(index: number) {
    const entry = this.productEntries[index];
    entry.isValid = entry.file !== null && entry.price !== null && entry.price > 0;
    
    // Add new entry if this is the last one and it's valid
    if (index === this.productEntries.length - 1 && entry.isValid) {
      this.addProductEntry();
    }
  }

  onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.productEntries[index].file = input.files[0];
      this.validateEntry(index);
    }
  }

  onPriceChange(index: number, value: number) {
    this.productEntries[index].price = value;
    this.validateEntry(index);
  }

  submitChanges(): void {
    const validEntries = this.productEntries.filter(entry => entry.isValid);
    if (validEntries.length === 0) return;

    this.isUploading = true;
    let completedUploads = 0;

    validEntries.forEach(entry => {
      const formData = new FormData();
      if (entry.file) formData.append('nGallery', entry.file);
      if (entry.price) formData.append('price', entry.price.toString());
      console.log(entry.file)
      this.service.submitGalleriesData(formData, "natureGallery").subscribe({
        
        next: (response) => {
          console.log(response);
          completedUploads++;
          if (completedUploads === validEntries.length) {
            this.loadGalleryData();
            this.resetForm();
          }
        },
        error: (error) => {
          console.error('Error submitting changes:', error);
          this.isUploading = false;
        }
      });
    });
  }

  resetForm(): void {
    this.productEntries = [{ file: null, price: null, isValid: false }];
    this.isUploading = false;
  }

  // Existing methods remain the same
  loadGalleryData() {
    this.isUploading = true;
    this.service.getNatureContent().subscribe(
      (response) => {
        this.galleryItems = response.map(item => ({
          ...item,
          nGalleryImage: `${this.baseUrl}/${item.nGalleryImage}`
        }));
        this.isUploading = false;
      },
      (error) => {
        console.error('Error loading gallery data:', error);
        this.isUploading = false;
      }
    );
  }

  delete(pictureID: number) {
    this.service.deleteImage(pictureID, "natureGallery").subscribe(
      (response) => {
        console.log(response.message);
        this.loadGalleryData();
      },
      (error) => {
        console.error('Error deleting image:', error.error);
      }
    );
  }

  submitPriceChange(pictureID: any, price: any): void {
    const formData = new FormData();
    formData.append('pictureID', pictureID);
    formData.append('price', parseFloat(price).toFixed(2));
  
    this.service.submitPriceChange(formData, "natureGallery").subscribe(
      (response: any) => {
        if (Array.isArray(response)) {
          this.galleryItems = response.map((item: { pictureID: any; price: any; nGalleryImage: any }) => ({
            pictureID: item.pictureID,
            price: parseFloat(parseFloat(item.price).toFixed(2)),
            nGalleryImage: `${this.baseUrl}/${item.nGalleryImage}`,
          }));
          this.loadGalleryData();
        } else {
          console.error('Unexpected response format:', response);
        }
      },
      (error) => {
        console.error('Error updating price:', error);
      }
    );
  }

  openImageOverlay(index: number): void {
    this.selectedImageIndex = index;
  }

  closeImageOverlay(): void {
    this.selectedImageIndex = null;
  }

  navigateGallery(direction: number): void {
    if (this.selectedImageIndex !== null) {
      const newIndex = this.selectedImageIndex + direction;
      if (newIndex >= 0 && newIndex < this.galleryItems.length) {
        this.selectedImageIndex = newIndex;
      } else if (newIndex < 0) {
        this.selectedImageIndex = this.galleryItems.length - 1;
      } else {
        this.selectedImageIndex = 0;
      }
    }
  }

  addToCart(pictureID: number) {
    const item = this.galleryItems.find(item => Number(item.pictureID) === Number(pictureID));
    if (item) {
      this.service.addToCart({
        pictureID: item.pictureID,
        nGalleryImage: item.nGalleryImage,
        price: item.price,
        quantity: 1,
      });
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = this.entriesContainer?.nativeElement;
      if (container) {
        // Find all unfilled entry rows
        const unfilledEntries = container.querySelectorAll('.entry-row:not(.filled)');
        if (unfilledEntries.length > 0) {
          // Get the first unfilled entry
          const firstUnfilled = unfilledEntries[0];
          // Calculate position to ensure the unfilled entry is visible
          const scrollPosition = firstUnfilled.offsetTop - container.clientHeight + firstUnfilled.clientHeight;
          container.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  }

  handleLinkClick(pictureID: number) {
    console.log('Nature component handling pictureID:', pictureID);
    
    if (this.user) {
      // User is logged in, proceed with adding to cart
      this.addToCart(pictureID);
    } else {
      // User is not logged in, show warning dialog
      this.warningCall();
    }
  }
  
  warningCall(): void {
    const message = 'Please sign in to process your request';
  
    // Open the dialog
    const dialogRef = this.dialog.open(DialogOkComponent, {
      width: '400px',
      data: { message } 
    });
  
    // Optional: handle dialog close
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }

}