import { Component } from '@angular/core';
import { Service } from '../../service/service';
import { UserService } from '../../service/user.service';
import { User } from '../../user';

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
  galleryItems: { pictureID: number, aGalleryImage: string; price: number }[] = [];
  price: number = 0.0;
  aGalleryImage: string = '';
  pictureID: number = 0;
  selectedImageIndex: number | null = null;

  allChanges: {
    price: number | null,
    aFile: File | null;
  } = {
    price: null,
    aFile: null
  };

  constructor(private userService: UserService, private service: Service) {}
  ngOnInit(): void {
    // Subscribe to user changes
    this.userService.user$.subscribe((user) => {
      this.user = user;
    });
  this.loadGalleryData();
  

  }

  onFileSelected(event: Event, category: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      if (category === 'architectureGallery') {
        this.allChanges.aFile = input.files[0];
      } 
    }
    const priceInput = document.getElementById('price') as HTMLInputElement;
    if (priceInput && priceInput.value) {
      this.allChanges.price = parseFloat(priceInput.value);
    }
    console.log('Updated allChanges:', this.allChanges);
    this.isUploading = false;
  }

  // submitChanges(): void {
  //   console.log('Submitting changes:', this.allChanges);
  
  //   const formData = new FormData();
  
  //   // Add file changes if any
  //   if (this.allChanges.aFile) {
  //     formData.append('aGallery', this.allChanges.aFile);
  //   }
  
  //   // Add price changes if any
  //   if (this.allChanges.price !== null) {
  //     formData.append('price', this.allChanges.price.toString());
  //   }
  
  //   this.service.submitGalleriesData(formData, "architectureGallery").subscribe(
  //     (response: any) => {
  //       console.log('Response from server:', response);
  
  //       // Assuming the response is an array of gallery items
  //       if (Array.isArray(response)) {
  //         this.galleryItems = response.map((item: { pictureID: any; aGalleryImage: any; price: any }) => ({
  //           pictureID: item.pictureID,
  //           aGalleryImage: `http://localhost/frameBase/${item.aGalleryImage}`,
  //           price: parseFloat(parseFloat(item.price).toFixed(2)),
  //         }));
  //       } else {
  //         console.error('Unexpected response format:', response);
  //       }
  
  //       this.isUploading = false;
  
  //       // Reload gallery data if necessary
  //       this.loadGalleryData();
  //     },
  //     (error) => {
  //       console.error('Error submitting changes:', error);
  //       this.isUploading = false; // Ensure this is updated in case of an error
  //     }
  //   );
  // }
  

  submitChanges(): void {
    console.log('Submitting changes:', this.allChanges);
  
    const formData = new FormData();
  
    // Add file changes if any
    if (this.allChanges.aFile) {
      formData.append('aGallery', this.allChanges.aFile);
    }
  
    // Add price changes if any
    if (this.allChanges.price !== null) {
      formData.append('price', this.allChanges.price.toString());
    }
  
    this.service.submitGalleriesData(formData, "architectureGallery").subscribe(
      (response: any) => {
        console.log('Response from server:', response);
  
        if (Array.isArray(response)) {
          // Case: Response is an array (e.g., loading all items)
          this.galleryItems = response.map((item: { pictureID: any; aGalleryImage: any; price: any }) => ({
            pictureID: item.pictureID,
            aGalleryImage: `http://localhost/frameBase/${item.aGalleryImage}`,
            price: parseFloat(parseFloat(item.price).toFixed(2)),
          }));
        } 
        else if(response.pictureID && response.archLow && response.price) {
          // Case: Response is a single object (e.g., after adding an item)
          const newItem = {
            pictureID: response.pictureID,
            aGalleryImage: `http://localhost/frameBase/${response.archLow}`, // Use archLow as the main image
            price: parseFloat(parseFloat(response.price).toFixed(2)),
          };
          this.galleryItems.push(newItem); // Add the new item to the list
        } else {
          // Case: Unexpected format
          console.error('Unexpected response format:', response);
        }
  
        this.isUploading = false;
  
        // Reload gallery data if necessary
        this.loadGalleryData();
      },
      (error) => {
        console.error('Error submitting changes:', error);
        this.isUploading = false; // Ensure this is updated in case of an error
      }
    );
  }
  
  submitPriceChange(pictureID: any, price: any): void {
    const formData = new FormData();
    formData.append('pictureID', pictureID);
    formData.append('price', parseFloat(price).toFixed(2)); // Ensure 2 decimal places
  
    this.service.submitArchitectureGalleryChanges(formData).subscribe(
      (response: any) => {
        console.log('Response from backend:', response);
        if (Array.isArray(response)) {
          this.galleryItems = response.map((item: { pictureID: any; price: any; aGalleryImage: any }) => ({
            pictureID: item.pictureID,
            price: parseFloat(parseFloat(item.price).toFixed(2)), // Correct: ensures `price` is a number
            aGalleryImage: `http://localhost/frameBase/${item.aGalleryImage}`,
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
  

  loadGalleryData() {
    this.isUploading = true;
    this.service.getArchitectureContent().subscribe(
      (response) => {
        this.galleryItems = response.map(item => {
          return {
            ...item,
            aGalleryImage: `http://localhost/frameBase/${item.aGalleryImage}`
          };
        });
        this.isUploading = false;
        this.resetFields();
      },
      (error) => {
        console.error('Error loading gallery data:', error);
      }
    );
  }

  delete(pictureID:number){
    this.service.deleteImage(pictureID, 'architectureGallery').subscribe(
      (response)=>{
        console.log(response.message);
        this.loadGalleryData();
      },
      (error)=>{
        console.error('Error deleting image:', error.error)
      }
    );
  }

  resetFields(): void {
    this.allChanges = {
      price: null,
      aFile: null
    };
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  
    // Clear price input field
    const priceInput = document.getElementById('price') as HTMLInputElement;
    if (priceInput) {
      priceInput.value = '';
    }
  }

  openImageOverlay(index: number): void {
    this.selectedImageIndex = index;
  }
  
  // Close the overlay
  closeImageOverlay(): void {
    this.selectedImageIndex = null;
  }
  
  // Navigate through gallery images
  navigateGallery(direction: number): void {
    if (this.selectedImageIndex !== null) {
      const newIndex = this.selectedImageIndex + direction;
  
      // Ensure the index stays within bounds
      if (newIndex >= 0 && newIndex < this.galleryItems.length) {
        this.selectedImageIndex = newIndex;
      } else if (newIndex < 0) {
        // Loop back to the last image if navigating left from the first image
        this.selectedImageIndex = this.galleryItems.length - 1;
      } else if (newIndex >= this.galleryItems.length) {
        // Loop back to the first image if navigating right from the last image
        this.selectedImageIndex = 0;
      }
    }
  }
  
}
