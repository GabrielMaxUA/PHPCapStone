import { Component, ElementRef, ViewChild } from '@angular/core';
import { Service } from '../../service/service';
import { UserService } from '../../service/user.service';
import { User, ProductEntry } from '../../Models/interfaces';
import { DialogOkComponent } from '../../dialog-ok/dialog-ok.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-architecture',
    templateUrl: './architecture.component.html',
    styleUrl: './architecture.component.css',
    standalone:false
})
export class ArchitectureComponent {
  selectedFile: File | null = null;
    isUploading: boolean = false;
    user: User | null = null;
    galleryItems: { pictureID: number, aGalleryImage: string; price: number, status?: string }[] = [];
    selectedImageIndex: number | null = null;
    
    // Array to store multiple product entries
    productEntries: ProductEntry[] = [
      { file: null, price: null, isValid: false } // Initialize the product entries array with a default empty entry
    ];
    @ViewChild('entriesContainer') 
    entriesContainer!: ElementRef; // Reference to the entries container for scrolling functionality
    
    constructor(
      private userService: UserService, // User service for session and user state management
      private service: Service, // Custom service for handling API requests
      private dialog: MatDialog // Angular Material Dialog for user interactions
    ) {}
    
    ngOnInit(): void {
      // Subscribe to user state changes
      this.userService.user$.subscribe((user) => {
        this.user = user; // Update the local user object
      });
      this.loadGalleryData(); // Load existing gallery data
    }
    
    // Add a new product entry
    addProductEntry() {
      const lastEntry = this.productEntries[this.productEntries.length - 1]; // Get the last entry in the list
      if (lastEntry.file && lastEntry.price) {
        // Add a new empty entry if the last entry is valid
        this.productEntries.push({ file: null, price: null, isValid: false });
        this.scrollToBottom(); // Scroll to the newly added entry
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
        this.productEntries[index].file = input.files[0]; // Assign the selected file
        this.validateEntry(index); // Validate the updated entry
      }
    }
    
    // Handle price change for an entry
    onPriceChange(index: number, value: number) {
      this.productEntries[index].price = value; // Update the price
      this.validateEntry(index); // Validate the updated entry
    }
    
    // Submit changes to the server
    submitChanges(): void {
      const validEntries = this.productEntries.filter(entry => entry.isValid); // Get only valid entries
      if (validEntries.length === 0) return; // Exit if no valid entries exist
    
      this.isUploading = true; // Set the uploading flag
      let completedUploads = 0; // Track completed uploads
    
      validEntries.forEach(entry => {
        const formData = new FormData();
        if (entry.file) formData.append('aGallery', entry.file); // Add file to the form data
        if (entry.price) formData.append('price', entry.price.toString()); // Add price to the form data
    
        // Submit the form data to the server
        this.service.submitGalleriesData(formData, "architectureGallery").subscribe({
          next: (response) => {
            console.log(response);
            completedUploads++;
            if (completedUploads === validEntries.length) {
              // Reload gallery data and reset the form once all uploads are complete
              this.loadGalleryData();
              this.resetForm();
            }
          },
          error: (error) => {
            console.error('Error submitting changes:', error);
            this.isUploading = false; // Reset the uploading flag on error
          }
        });
      });
    }
    
    // Reset the form to its initial state
    resetForm(): void {
      this.productEntries = [{ file: null, price: null, isValid: false }]; // Reset product entries
      this.isUploading = false; // Reset the uploading flag
    }
    
    // Load existing gallery data
    loadGalleryData() {
      this.isUploading = true; // Set the uploading flag
      this.service.getArchitectureContent().subscribe(
        (response) => {
          // Map gallery items to include the full image URL
          this.galleryItems = response.map(item => ({
            ...item,
            aGalleryImage: `${item.aGalleryImage}`
          }));
          this.isUploading = false; // Reset the uploading flag
        },
        (error) => {
          console.error('Error loading gallery data:', error); // Log errors
          this.isUploading = false; // Reset the uploading flag
        }
      );
    }
    
    // Delete an image from the gallery
    delete(pictureID: number) {
      this.service.deleteImage(pictureID, "architectureGallery").subscribe(
        (response) => {
          console.log(response.message); // Log success response
          this.loadGalleryData(); // Reload gallery data
        },
        (error) => {
          console.error('Error deleting image:', error.error); // Log errors
        }
      );
    }
    
    // Submit a price change for an image
    submitPriceChange(pictureID: any, price: any): void {
      const formData = new FormData();
      formData.append('pictureID', pictureID);
      formData.append('price', parseFloat(price).toFixed(2)); // Format price to two decimal places
    
      this.service.submitPriceChange(formData, "architectureGallery").subscribe(
        (response: any) => {
          if (Array.isArray(response)) {
            // Map updated gallery items to include the full image URL
            this.galleryItems = response.map((item: { pictureID: any; price: any; aGalleryImage: any }) => ({
              pictureID: item.pictureID,
              price: parseFloat(parseFloat(item.price).toFixed(2)),
              aGalleryImage: `${item.aGalleryImage}`,
            }));
            this.loadGalleryData(); // Reload gallery data
          } else {
            console.error('Unexpected response format:', response);
          }
        },
        (error) => {
          console.error('Error updating price:', error);
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
    
    // Navigate through the gallery images
    navigateGallery(direction: number): void {
      if (this.selectedImageIndex !== null) {
        const newIndex = this.selectedImageIndex + direction;
        if (newIndex >= 0 && newIndex < this.galleryItems.length) {
          this.selectedImageIndex = newIndex; // Move to the next/previous image
        } else if (newIndex < 0) {
          this.selectedImageIndex = this.galleryItems.length - 1; // Wrap around to the last image
        } else {
          this.selectedImageIndex = 0; // Wrap around to the first image
        }
      }
    }
    
    // Add an item to the cart
    addToCart(pictureID: number) {
      const item = this.galleryItems.find(item => Number(item.pictureID) === Number(pictureID));
      if (item) {
        console.log('Adding item:', item.status);
        this.service.addToCart({
          pictureID: item.pictureID,
          aGalleryImage: item.aGalleryImage,
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

    
    // Handle link click and decide action based on user authentication
    handleLinkClick(pictureID: number) {
      console.log('Nature component handling pictureID:', pictureID);
    
      if (this.user) {
        // If the user is logged in, add the item to the cart
        this.addToCart(pictureID);
      } else {
        // Show a warning dialog if the user is not logged in
        this.warningCall();
      }
    }
    
    // Display a warning dialog
    warningCall(): void {
      const header = 'Oops...';
      const message = 'Please sign in to process your request';
    
      const dialogRef = this.dialog.open(DialogOkComponent, {
        width: '400px',
        data: { header, message } // Pass dialog data
      });
    
      dialogRef.afterClosed().subscribe(result => {
        console.log('Dialog closed'); // Log dialog close event
      });
    }    

  }