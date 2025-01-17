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

  // Array to store multiple product entries
  productEntries: ProductEntry[] = [
  { file: null, price: null, isValid: false } // Initial product entry with no file, price, or validation
];

@ViewChild('entriesContainer')
entriesContainer!: ElementRef; // Reference to the container for scrolling functionality

constructor(
  private userService: UserService, // Service for handling user-related operations
  private service: Service, // Service for API calls and business logic
  private dialog: MatDialog // Angular Material dialog for showing modals
) {}

ngOnInit(): void {
  // Subscribe to user state changes
  this.userService.user$.subscribe((user) => {
    this.user = user;
  });

  this.loadGalleryData(); // Load existing gallery data on component initialization
}

// Add a new product entry
addProductEntry() {
  const lastEntry = this.productEntries[this.productEntries.length - 1]; // Get the last entry
  if (lastEntry.file && lastEntry.price) {
    // Add a new entry only if the last entry is valid
    this.productEntries.push({ file: null, price: null, isValid: false });
    this.scrollToBottom(); // Scroll to the new entry
  }
}

// Remove a product entry
removeProductEntry(index: number) {
  if (this.productEntries.length > 1) {
    // Prevent removing the last remaining entry
    this.productEntries.splice(index, 1);
  }
}

// Validate an entry
validateEntry(index: number) {
  const entry = this.productEntries[index];
  // Check if the file and price are valid
  entry.isValid = entry.file !== null && entry.price !== null && entry.price > 0;

  if (index === this.productEntries.length - 1 && entry.isValid) {
    // Add a new entry if the last one is valid
    this.addProductEntry();
  }
}

// Handle file selection for an entry
onFileSelected(event: Event, index: number): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    // Assign the selected file to the entry
    this.productEntries[index].file = input.files[0];
    this.validateEntry(index); // Validate the entry after file selection
  }
}

// Handle price change for an entry
onPriceChange(index: number, value: number) {
  this.productEntries[index].price = value; // Update the price for the entry
  this.validateEntry(index); // Validate the entry after price change
}

// Submit valid product entries to the server
submitChanges(): void {
  const validEntries = this.productEntries.filter(entry => entry.isValid); // Get valid entries
  if (validEntries.length === 0) return; // Exit if no valid entries

  this.isUploading = true; // Set uploading flag
  let completedUploads = 0; // Track completed uploads

  validEntries.forEach(entry => {
    const formData = new FormData();
    if (entry.file) formData.append('nGallery', entry.file); // Append file to form data
    if (entry.price) formData.append('price', entry.price.toString()); // Append price to form data

    this.service.submitGalleriesData(formData, "natureGallery").subscribe({
      next: (response) => {
        console.log(response);
        completedUploads++; // Increment completed uploads
        if (completedUploads === validEntries.length) {
          // Reload gallery data and reset form after all uploads
          this.loadGalleryData();
          this.resetForm();
        }
      },
      error: (error) => {
        console.error('Error submitting changes:', error); // Log error
        this.isUploading = false; // Reset uploading flag
      }
    });
  });
}

// Reset the form to its initial state
resetForm(): void {
  this.productEntries = [{ file: null, price: null, isValid: false }]; // Reset product entries
  this.isUploading = false; // Reset uploading flag
}

// Load gallery data
loadGalleryData() {
  this.isUploading = true; // Set uploading flag
  this.service.getNatureContent().subscribe(
    (response) => {
      // Map gallery items to include full image URLs
      this.galleryItems = response.map(item => ({
        ...item,
        nGalleryImage: `${item.nGalleryImage}`
      }));
      this.isUploading = false; // Reset uploading flag
    },
    (error) => {
      console.error('Error loading gallery data:', error); // Log error
      this.isUploading = false; // Reset uploading flag
    }
  );
}

// Delete an image from the gallery
delete(pictureID: number) {
  this.service.deleteImage(pictureID, "natureGallery").subscribe(
    (response) => {
      console.log(response.message); // Log success message
      this.loadGalleryData(); // Reload gallery data after deletion
    },
    (error) => {
      console.error('Error deleting image:', error.error); // Log error
    }
  );
}

// Submit a price change for a specific image
submitPriceChange(pictureID: any, price: any): void {
  const formData = new FormData();
  formData.append('pictureID', pictureID); // Add picture ID
  formData.append('price', parseFloat(price).toFixed(2)); // Add price (formatted to two decimal places)

  this.service.submitPriceChange(formData, "natureGallery").subscribe(
    (response: any) => {
      if (Array.isArray(response)) {
        // Update gallery items with new data
        this.galleryItems = response.map((item: { pictureID: any; price: any; nGalleryImage: any }) => ({
          pictureID: item.pictureID,
          price: parseFloat(parseFloat(item.price).toFixed(2)),
          nGalleryImage: `${item.nGalleryImage}`,
        }));
        this.loadGalleryData(); // Reload gallery data
      } else {
        console.error('Unexpected response format:', response); // Handle unexpected response
      }
    },
    (error) => {
      console.error('Error updating price:', error); // Log error
    }
  );
}

// Open the image overlay for a specific index
openImageOverlay(index: number): void {
  this.selectedImageIndex = index;
}

// Close the image overlay
closeImageOverlay(): void {
  this.selectedImageIndex = null;
}

// Navigate through the gallery
navigateGallery(direction: number): void {
  if (this.selectedImageIndex !== null) {
    const newIndex = this.selectedImageIndex + direction;
    if (newIndex >= 0 && newIndex < this.galleryItems.length) {
      this.selectedImageIndex = newIndex; // Navigate to the next/previous image
    } else if (newIndex < 0) {
      this.selectedImageIndex = this.galleryItems.length - 1; // Wrap to the last image
    } else {
      this.selectedImageIndex = 0; // Wrap to the first image
    }
  }
}

// Add an item to the cart
addToCart(pictureID: number) {
  const item = this.galleryItems.find(item => Number(item.pictureID) === Number(pictureID));
  if (item) {
    this.service.addToCart({
      pictureID: item.pictureID,
      nGalleryImage: item.nGalleryImage,
      price: item.price,
      quantity: 1, // Default quantity
    });
  }
}

// Scroll to the bottom of the entries container
private scrollToBottom(): void {
  setTimeout(() => {
    const container = this.entriesContainer?.nativeElement;
    if (container) {
      const unfilledEntries = container.querySelectorAll('.entry-row:not(.filled)');
      if (unfilledEntries.length > 0) {
        const firstUnfilled = unfilledEntries[0];
        const scrollPosition = firstUnfilled.offsetTop - container.clientHeight + firstUnfilled.clientHeight;
        container.scrollTo({
          top: scrollPosition,
          behavior: 'smooth' // Smooth scrolling
        });
      }
    }
  });
}

// Handle link click based on user authentication
handleLinkClick(pictureID: number) {
  console.log('Nature component handling pictureID:', pictureID);

  if (this.user) {
    // Add to cart if user is logged in
    this.addToCart(pictureID);
  } else {
    // Show warning if user is not logged in
    this.warningCall();
  }
}

// Show a warning dialog for unauthenticated users
warningCall(): void {
  const header = 'Oops...';
  const message = 'Please sign in to process your request';

  const dialogRef = this.dialog.open(DialogOkComponent, {
    width: '400px',
    data: { header, message } // Dialog data
  });

  dialogRef.afterClosed().subscribe(result => {
    console.log('Dialog closed'); // Log dialog close event
  });
}

}