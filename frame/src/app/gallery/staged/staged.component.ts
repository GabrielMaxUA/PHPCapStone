import { ChangeDetectorRef, Component } from '@angular/core';
import { Service } from '../../service/service';
import { UserService } from '../../service/user.service';
import { User } from '../../Models/user';

@Component({
    selector: 'app-staged',
    templateUrl: './staged.component.html',
    styleUrl: './staged.component.css',
    standalone: false
})
export class StagedComponent {
    selectedColorFile: File | null = null;
    selectedBlackFile: File | null = null;
    colorPrice: number | null = null;
    blackPrice: number | null = null;
    isUploading: boolean = false;
    user: User | null = null;
    
    sGalleryImage: string = '';
    pictureID: number = 0;
    selectedImageIndex: number | null = null;
    galleryItems: { pictureID: number; sGalleryImage: string; price: number; type: string }[] = [];
    filteredGalleryItems: { pictureID: number; sGalleryImage: string; price: number; type: string }[] = [];
   
    
    allChanges: {
      price: number | null,
      sFile: File | null;
    } = {
      price: null,
      sFile: null
    };
  
    constructor(private userService: UserService, private service: Service, private cdr: ChangeDetectorRef) {}
    ngOnInit(): void {
      // Subscribe to user changes
      this.userService.user$.subscribe((user) => {
        this.user = user;
      });

    this.loadGalleryData();
    }


    onFileSelected(event: Event, category: 'color' | 'black'): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
          if (category === 'color') {
            this.selectedColorFile = input.files[0];
          } else if (category === 'black') {
            this.selectedBlackFile = input.files[0];
          }
        }
      }
  
  submitGalleryChanges(): void {
    const formData = new FormData();
  
    if (this.selectedColorFile) {
      formData.append('colorImage', this.selectedColorFile);
      if (this.colorPrice !== null) {
        formData.append('colorPrice', this.colorPrice.toString());
      }
    }
  
    if (this.selectedBlackFile) {
      formData.append('blackImage', this.selectedBlackFile);
      if (this.blackPrice !== null) {
        formData.append('blackPrice', this.blackPrice.toString());
      }
    }
  
    if (!this.selectedColorFile && !this.selectedBlackFile) {
      alert('Please upload at least one image.');
      return;
    }
  
    this.service.submitGalleriesData(formData, 'stagedGallery').subscribe(
      (response: any) => {
        console.log('Response from server:', response);
  
        if (Array.isArray(response)) {
          this.galleryItems = response.map((item) => ({
            pictureID: item.pictureID,
            sGalleryImage: `https://triosdevelopers.com/~Max.Gabriel/frame/frameBase/${item.sGalleryImage}`,
            price: parseFloat(parseFloat(item.price).toFixed(2)),
            type: item.type
          }));
          this.filteredGalleryItems = [...this.galleryItems];
        } else if (response.pictureID && response.stagedLow && response.price && response.type) {
          const newItem = {
            pictureID: response.pictureID,
            sGalleryImage: `https://triosdevelopers.com/~Max.Gabriel/frame/frameBase/${response.stagedLow}`,
            price: parseFloat(parseFloat(response.price).toFixed(2)),
            type: response.type
          };
          this.galleryItems.push(newItem);
          this.filteredGalleryItems = [...this.galleryItems];
        }
        this.resetFormFields();
        // this.cdr.detectChanges(); // Notify Angular of the changes
  
        this.loadGalleryData();
      },
      (error) => {
        console.error('Error submitting changes:', error);
      }
    );
  }

  // Check if the form is valid
  isFormValid(): boolean {
    return !!this.selectedColorFile || !!this.selectedBlackFile;
  }

  resetFormFields(): void {
    // Clear selected files
    this.selectedColorFile = null;
    this.selectedBlackFile = null;
  
    // Clear price fields
    this.colorPrice = null;
    this.blackPrice = null;
  
    // Reset file input elements
    const colorInput = document.getElementById('fileInputColor') as HTMLInputElement;
    const blackInput = document.getElementById('fileInputBlack') as HTMLInputElement;
  
    if (colorInput) {
      colorInput.value = '';
    }
    if (blackInput) {
      blackInput.value = '';
    }
  
    console.log('Form fields have been reset.');
  }
  
    submitPriceChange(pictureID: any, price: any): void {
      const formData = new FormData();
      formData.append('pictureID', pictureID);
      formData.append('price', parseFloat(price).toFixed(2)); // Ensure 2 decimal places
    
      this.service.submitPriceChange(formData, "stagedGallery").subscribe(
        (response: any) => {
          if (Array.isArray(response)) {
            this.galleryItems = response.map((item: { pictureID: any; price: any; sGalleryImage: any, type: any}) => ({
              pictureID: item.pictureID,
              price: parseFloat(parseFloat(item.price).toFixed(2)), // Correct: ensures `price` is a number
              sGalleryImage: `https://triosdevelopers.com/~Max.Gabriel/frame/frameBase/${item.sGalleryImage}`,
              type: item.type
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
      this.service.getStagedContent().subscribe(
        (response) => {
          console.log('Raw response:', response);
          this.galleryItems = response.map((item: { sGalleryImage: any; }) => {
            return {
              ...item,
              sGalleryImage: `https://triosdevelopers.com/~Max.Gabriel/frame/frameBase/${item.sGalleryImage}`
            };
          });
          this.isUploading = false;
          this.resetFilter();
        },
        (error) => {
          console.error('Error loading gallery data:', error);
        }
      );
    }
  
    delete(pictureID:number){
      this.service.deleteImage(pictureID, "stagedGallery").subscribe(
        (response)=>{
          console.log(response.message);
          this.loadGalleryData();
        },
        (error)=>{
          console.error('Error deleting image:', error.error)
        }
      );
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
      if (newIndex >= 0 && newIndex < this.filteredGalleryItems.length) {
        this.selectedImageIndex = newIndex;
      } else if (newIndex < 0) {
        // Loop back to the last image if navigating left from the first image
        this.selectedImageIndex = this.filteredGalleryItems.length - 1;
      } else if (newIndex >= this.filteredGalleryItems.length) {
        // Loop back to the first image if navigating right from the last image
        this.selectedImageIndex = 0;
      }
    }
  }

  filterGallery(type: 'black' | 'color'): void {
    console.log('Filtering for type:', type);
    console.log('Current gallery items:', this.galleryItems);
    this.filteredGalleryItems = this.galleryItems.filter((item) => item.type === type);
    console.log('Filtered items:', this.filteredGalleryItems);
    this.cdr.detectChanges();
  }

  resetFilter(): void {
    console.log('Resetting filter:', this.galleryItems);
    this.filteredGalleryItems = [...this.galleryItems];
    this.cdr.detectChanges(); 
  }

  addToCart(pictureID: number){
    console.log('Nature component: Received pictureID:', pictureID);
    console.log('Current gallery items:', this.galleryItems);
    const item = this.galleryItems.find(item => Number(item.pictureID) === Number(pictureID));
    if(item){
      console.log('Found item:', item); // Debug log
      this.service.addToCart({
        pictureID: item.pictureID,
        sGalleryImage: item.sGalleryImage,
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
