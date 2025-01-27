import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { Service } from '../../service/service';
import { UserService } from '../../service/user.service';
import { User, UploadEntry } from '../../Models/interfaces';
import { DialogOkComponent } from '../../dialog-ok/dialog-ok.component';
import { MatDialog } from '@angular/material/dialog';



@Component({
  selector: 'app-staged',
  templateUrl: './staged.component.html',
  styleUrls: ['./staged.component.css'],
  standalone: false,
})

export class StagedComponent {
  user: User | null = null;
  isUploading: boolean = false;
  
  galleryItems: { pictureID: number; sGalleryImage: string; price: number; type: string, status?: string }[] = [];
filteredGalleryItems: { pictureID: number; sGalleryImage: string; price: number; type: string }[] = [];
selectedImageIndex: number | null = null;

// Arrays for dynamic uploads
colorUploads: UploadEntry[] = [{ file: null, price: null, isValid: false }];
blackUploads: UploadEntry[] = [{ file: null, price: null, isValid: false }];

@ViewChild('entriesContainer')
entriesContainer!: ElementRef;

constructor(
  private userService: UserService,
  private service: Service,
  private dialog: MatDialog,
  private cdr: ChangeDetectorRef
) {}

ngOnInit(): void {
  this.userService.user$.subscribe((user) => {
    console.log('User state changed:', user);
    this.user = user;
    if (user) {
      this.loadGalleryData();
    }
  });
}

/** Add new upload entry for color or black */
addUploadEntry(type: 'color' | 'black'): void {
  const uploads = type === 'color' ? this.colorUploads : this.blackUploads;
  const lastEntry = uploads[uploads.length - 1];
  if (lastEntry.file && lastEntry.price) {
    uploads.push({ file: null, price: null, isValid: false });
    this.scrollToBottom();
  }
}

/** Remove upload entry */
removeUploadEntry(type: 'color' | 'black', index: number): void {
  const uploads = type === 'color' ? this.colorUploads : this.blackUploads;
  if (uploads.length > 1) {
    uploads.splice(index, 1);
  }
}

/** Validate upload entry */
validateEntry(type: 'color' | 'black', index: number): void {
  const uploads = type === 'color' ? this.colorUploads : this.blackUploads;
  const entry = uploads[index];
  entry.isValid = !!entry.file && !!entry.price && entry.price > 0;

  if (index === uploads.length - 1 && entry.isValid) {
    this.addUploadEntry(type);
  }
}

/** Handle file selection */
onFileSelected(event: Event, type: 'color' | 'black', index: number): void {
  const input = event.target as HTMLInputElement;
  const uploads = type === 'color' ? this.colorUploads : this.blackUploads;

  if (input.files && input.files.length > 0) {
    uploads[index].file = input.files[0];
    this.validateEntry(type, index);
  }
}

/** Handle price changes */
onPriceChange(type: 'color' | 'black', index: number, value: number): void {
  const uploads = type === 'color' ? this.colorUploads : this.blackUploads;
  uploads[index].price = value;
  this.validateEntry(type, index);
}

/** Submit valid uploads */
submitGalleryChanges(): void {
  const formData = new FormData();
  
  // Get valid uploads
  const validColorUploads = this.colorUploads.filter(entry => entry.isValid);
  const validBlackUploads = this.blackUploads.filter(entry => entry.isValid);
  
  // Add count parameters
  formData.append('colorCount', validColorUploads.length.toString());
  formData.append('blackCount', validBlackUploads.length.toString());
  
  // Append color images with indexed names
  validColorUploads.forEach((entry, index) => {
    formData.append(`colorImage_${index}`, entry.file!);
    formData.append(`colorImagePrice_${index}`, entry.price?.toString() || '0');
  });

  // Append black images with indexed names
  validBlackUploads.forEach((entry, index) => {
    formData.append(`blackImage_${index}`, entry.file!);
    formData.append(`blackImagePrice_${index}`, entry.price?.toString() || '0');
  });

  if (validColorUploads.length + validBlackUploads.length === 0) {
    alert('Please add valid images with prices.');
    return;
  }

  this.isUploading = true;
  
  // Single request with all images
  this.service.submitGalleriesData(formData, 'stagedGallery').subscribe({
    next: (response) => {
      console.log('Upload successful:', response);
      this.loadGalleryData();
      this.resetFormFields();
    },
    error: (error) => {
      console.error('Error submitting changes:', error);
      this.isUploading = false;
    },
    complete: () => {
      this.isUploading = false;
    }
  });
}

/** Reset form fields */
resetFormFields(): void {
  this.colorUploads = [{ file: null, price: null, isValid: false }];
  this.blackUploads = [{ file: null, price: null, isValid: false }];
  this.isUploading = false;
}

/** Load gallery data */
loadGalleryData(): void {
  console.log('Starting to load gallery data');
  this.isUploading = true;

  this.service.getStagedContent().subscribe({
    next: (response) => {
      this.galleryItems = response.map((item) => ({
        ...item,
        sGalleryImage: `${item.sGalleryImage}`,
      }));
      this.filteredGalleryItems = [...this.galleryItems];
      this.isUploading = false;
      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error('Error loading gallery data:', error);
      this.isUploading = false;
    }
  });
}

/** Submit price change */
submitPriceChange(pictureID: any, price: any): void {
  const formData = new FormData();
  formData.append('pictureID', pictureID);
  formData.append('price', parseFloat(price).toFixed(2));
  console.log("submiting: " ,formData);
  this.service.submitPriceChange(formData, 'stagedGallery').subscribe(
    (response: any) => {
      console.log("submiting: " ,response);
      if (Array.isArray(response)) {
        this.galleryItems = response.map((item: { pictureID: number; price: number; sGalleryImage: string; type: string }) => ({
          pictureID: item.pictureID,
          price: parseFloat(item.price.toFixed(2)),
          sGalleryImage: `${item.sGalleryImage}`,
          type: item.type,
        }));
        this.filteredGalleryItems = [...this.galleryItems];
      } else if (response.pictureID) {
        const index = this.galleryItems.findIndex((item) => item.pictureID === response.pictureID);
        if (index !== -1) {
          this.galleryItems[index].price = parseFloat(response.price.toFixed(2));
          this.filteredGalleryItems = [...this.galleryItems];
        }
      }
    },
    (error) => {
      console.error('Error updating price:', error);
    }
  );
}

/** Delete an image */
delete(pictureID: number): void {
  this.service.deleteImage(pictureID, 'stagedGallery').subscribe(
    (response) => {
      console.log(response.message);
      this.loadGalleryData();
    },
    (error) => {
      console.error('Error deleting image:', error.error);
    }
  );
}

/** Open image overlay */
openImageOverlay(index: number): void {
  this.selectedImageIndex = index;
}

/** Close image overlay */
closeImageOverlay(): void {
  this.selectedImageIndex = null;
}

/** Navigate gallery images */
navigateGallery(direction: number): void {
  if (this.selectedImageIndex !== null) {
    const newIndex = this.selectedImageIndex + direction;
    this.selectedImageIndex =
      newIndex < 0
        ? this.filteredGalleryItems.length - 1
        : newIndex >= this.filteredGalleryItems.length
        ? 0
        : newIndex;
  }
}

/** Filter gallery by type */
filterGallery(type: 'black' | 'color'): void {
  this.filteredGalleryItems = this.galleryItems.filter((item) => item.type === type);
  this.cdr.detectChanges();
}

/** Reset gallery filter */
resetFilter(): void {
  this.filteredGalleryItems = [...this.galleryItems];
  this.cdr.detectChanges();
}

/** Add to cart */
addToCart(pictureID: number): void {
  const item = this.galleryItems.find((item) => item.pictureID === pictureID);
  if (item) {
    this.service.addToCart({
      pictureID: item.pictureID,
      sGalleryImage: item.sGalleryImage,
      price: item.price,
      quantity: 1,
    });
  }
}

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
          behavior: 'smooth'
        });
      }
    }
  });
}

handleLinkClick(pictureID: number) {
  console.log('Nature component handling pictureID:', pictureID);

  if (this.user) {
    this.addToCart(pictureID);
  } else {
    this.warningCall();
  }
}

warningCall(): void {
  const header = 'Oops...';
  const message = 'Please sign in to process your request';

  const dialogRef = this.dialog.open(DialogOkComponent, {
    width: '400px',
    data: { header, message }
  });

  dialogRef.afterClosed().subscribe(result => {
    console.log('Dialog closed');
  });
}

}
