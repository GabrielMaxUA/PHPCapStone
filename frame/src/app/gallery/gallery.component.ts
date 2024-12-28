import { Component } from '@angular/core';
import { User } from '../Models/user';
import { Service } from '../service/service';
import { UserService } from '../service/user.service';
import { DialogOkComponent } from '../dialog-ok/dialog-ok.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-gallery',
    templateUrl: './gallery.component.html',
    styleUrl: './gallery.component.css',
    standalone: false
})

export class GalleryComponent {
  selectedFile: File | null = null;
  isUploading: boolean = false;
  user: User | null = null;
  showDialog = false; // Whether the dialog is visible
  dialogMessage = ''; // Message to display in the dialog
  isUploadingNature: boolean = false;
  isUploadingArchitecture: boolean = false;
  isUploadingStaged: boolean = false;
  sImageUrl: string = '';
  nImageUrl: string = '';
  aImageUrl: string = '';
 
  nText: string = '';
  sText: string = '';
  aText: string = '';

  allChanges: {
    nText: string;
    nFile: File | null;
    aText: string;
    aFile: File | null;
    sText: string;
    sFile: File | null;
  } = {
    nText: '',
    nFile: null,
    aText: '',
    aFile: null,
    sText: '',
    sFile: null,
  };

  constructor(private userService: UserService, private service: Service, private dialog: MatDialog,  private router: Router) {}

  ngOnInit(): void {
    // Subscribe to user changes
    this.loadGalleryData();
    this.userService.user$.subscribe(user => {
      //console.log('User state updated:', user); // Debug log
      this.user = user;
    });
  }

  loadGalleryData(): void {
    this.service.getMainGalleriesPageContent().subscribe(
      (response) => {
        this.sText = response.sText;
        this.sImageUrl = `http://localhost/frameBase/${response.sImageMain}`;
        this.nText = response.nText;
        this.nImageUrl = `http://localhost/frameBase/${response.nImageMain}`;
        this.aText = response.aText;
        this.aImageUrl = `http://localhost/frameBase/${response.aImageMain}`;

        // Pre-fill allChanges with initial data
        this.allChanges.nText = this.nText;
        this.allChanges.aText = this.aText;
        this.allChanges.sText = this.sText;
      },
      (error) => {
        console.error('Error loading gallery data:', error);
      }
    );
  }

  onFileSelected(event: Event, category: string): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload an image.');
        return;
      }

      if (category === 'n') {
        this.allChanges.nFile = file;
        this.isUploadingNature = true;
      } else if (category === 'a') {
        this.allChanges.aFile = file;
        this.isUploadingArchitecture = true;
      } else if (category === 's') {
        this.allChanges.sFile = file;
        this.isUploadingStaged = true;
      }
    }
  }
  
  submitAllChanges(): void {
    console.log('Submitting changes:', this.allChanges);
  
    const formData = new FormData();
    formData.append('nText', this.nText || '');
    formData.append('aText', this.aText || '');
    formData.append('sText', this.sText || '');
  
    // Add file changes if any
    if (this.allChanges.nFile) {
      formData.append('nFile', this.allChanges.nFile, this.allChanges.nFile.name);
    }
    if (this.allChanges.aFile) {
      formData.append('aFile', this.allChanges.aFile, this.allChanges.aFile.name);
    }
    if (this.allChanges.sFile) {
      formData.append('sFile', this.allChanges.sFile, this.allChanges.sFile.name);
    }
  
    this.service.submitMainGalleryChanges(formData).subscribe({
      next: (response: any) => {
        console.log('Submitted successfully:', response);
        if (response.nImageUrl) {
          this.nImageUrl = response.nImageUrl;
          this.isUploadingNature = false;
        }
        if (response.aImageUrl) {
          this.aImageUrl = response.aImageUrl;
          this.isUploadingArchitecture = false;
        }
        if (response.sImageUrl) {
          this.sImageUrl = response.sImageUrl;``
          this.isUploadingStaged = false;
        }
        this.loadGalleryData();
      },
      error: (error) => {
        console.error('Error submitting changes:', error);
        // Reset loading states in case of error
        this.isUploadingNature = false;
        this.isUploadingArchitecture = false;
        this.isUploadingStaged = false;
      },
    });
  }
  

  handleLinkClick(event: MouseEvent): void {
    this.userService.user$.subscribe((user) => {
      this.user = user; // Update the local `user` property whenever the user changes
      console.log('User updated in GalleryComponent:', user);
    });
    // Prevent default link behavior
    event.preventDefault();
    // Log user details for debugging
    console.log('User:', this.user);
  
    // Non-logged-in users
    if (!this.user) {
      this.adultWarning(false); // Show warning for not logged in
    } 
    // Blocked users
    else if (this.user.status === 'blocked') {
      this.adultWarning(true); // Show warning for blocked users
    } 
    // Active users
    else if (this.user.status === 'active') {
      this.router.navigate(['/staged']); // Navigate programmatically
    } 
    // Fallback for unexpected cases
    else {
      console.error('Unexpected user status:', this.user.status);
    }
  }
  
  adultWarning(isBlocked: boolean): void {
    const message = isBlocked
      ? 'Sorry, you are not eligable from viewing this content.'
      : 'Please sign in to view the gallery adult content.';
  
    // Open the dialog
    const dialogRef = this.dialog.open(DialogOkComponent, {
      width: '400px',
      data: { message } // Pass the message dynamically
    });
  
    dialogRef.afterClosed().subscribe(() => {
      console.log('Dialog closed');
    });
  }
  


}
   

