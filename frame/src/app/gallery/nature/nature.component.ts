import { Component } from '@angular/core';
import { Service } from '../../service/service';
import { UserService } from '../../service/user.service';
import { User } from '../../Models/user';

@Component({
    selector: 'app-nature',
    templateUrl: './nature.component.html',
    styleUrl: './nature.component.css',
    standalone: false
})
export class NatureComponent {
  selectedFile: File | null = null;
  isUploading: boolean = false;
  user: User | null = null;
  galleryItems: { pictureID: number, nGalleryImage: string; price: number }[] = [];
  price: number = 0.0;
  nGalleryImage: string = '';
  pictureID: number = 0;
  selectedImageIndex: number | null = null;

  allChanges: {
    price: number | null,
    nFile: File | null;
  } = {
    price: null,
    nFile: null
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
      if (category === 'natureGallery') {
        this.allChanges.nFile = input.files[0];
      } 
    }
    const priceInput = document.getElementById('price') as HTMLInputElement;
    if (priceInput && priceInput.value) {
      this.allChanges.price = parseFloat(priceInput.value);
    }
    console.log('Updated allChanges:', this.allChanges);
    this.isUploading = false;
  }

  submitChanges(): void {
    console.log('Submitting changes:', this.allChanges);
  
    const formData = new FormData();
  
    // Add file changes if any
    if (this.allChanges.nFile) {
      formData.append('nGallery', this.allChanges.nFile);
    }
  
    // Add price changes if any
    if (this.allChanges.price !== null) {
      formData.append('price', this.allChanges.price.toString());
    }
  
    this.service.submitGalleriesData(formData, "natureGallery").subscribe(
      (response: any) =>  {
         console.log('Response from server:', response);

         if (Array.isArray(response)) {
          // Case: Response is an array (e.g., loading all items)
          this.galleryItems = response.map((item: { pictureID: any; nGalleryImage: any; price: any }) => ({
            pictureID: item.pictureID,
            nGalleryImage: `https://triosdevelopers.com/~Max.Gabriel/frame/frameBase/${item.nGalleryImage}`,
            price: parseFloat(parseFloat(item.price).toFixed(2)),
          }));
        } 
        else if (response.pictureID && response.natureLow && response.price) {
        // Case: Response is a single object (e.g., after adding an item)
        const newItem = {
          pictureID: response.pictureID,
          nGalleryImage: `https://triosdevelopers.com/~Max.Gabriel/frame/frameBase/${response.natureLow}`, // Use archLow as the main image
          price: parseFloat(parseFloat(response.price).toFixed(2)),
        };
        this.galleryItems.push(newItem); // Add the new item to the list
      } else {
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
  
    this.service.submitPriceChange(formData, "natureGallery").subscribe(
      (response: any) => {
        if (Array.isArray(response)) {
          this.galleryItems = response.map((item: { pictureID: any; price: any; nGalleryImage: any }) => ({
            pictureID: item.pictureID,
            price: parseFloat(parseFloat(item.price).toFixed(2)), // Correct: ensures `price` is a number
            nGalleryImage: `https://triosdevelopers.com/~Max.Gabriel/frame/frameBase/${item.nGalleryImage}`,
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
    this.service.getNatureContent().subscribe(
      (response) => {
        this.galleryItems = response.map((item: { nGalleryImage: any; })=> {
          return {
            ...item,
            nGalleryImage: `https://triosdevelopers.com/~Max.Gabriel/frame/frameBase/${item.nGalleryImage}`
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
    this.service.deleteImage(pictureID, "natureGallery").subscribe(
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
      nFile: null
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

  
  // Open overlay with the selected image
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

  addToCart(pictureID: number){
    console.log('Nature component: Received pictureID:', pictureID);
    console.log('Current gallery items:', this.galleryItems);
    const item = this.galleryItems.find(item => Number(item.pictureID) === Number(pictureID));
    if(item){
      console.log('Found item:', item); // Debug log
      this.service.addToCart({
        pictureID: item.pictureID,
        nGalleryImage: item.nGalleryImage,
        price: item.price,
        quantity: 1
      });
    }
     else {
      console.error('Item not found for pictureID:', pictureID);
      console.log('Available pictureIDs:', this.galleryItems.map(item => item.pictureID));
    }
  }

}
