import { Component } from '@angular/core';
import { User } from '../Models/interfaces';
import { Service } from '../service/service';
import { UserService } from '../service/user.service';
import { DialogOkComponent } from '../dialog-ok/dialog-ok.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogComponent } from '../dialog/dialog.component';

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
  //baseUrl = 'http://localhost/frameBase'; //  base URL here
  baseUrl = 'https://triosdevelopers.com/~Max.Gabriel/frame/frameBase'; // base URL here
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
  isChildRouteActive = false;

  constructor(private userService: UserService, private service: Service, private dialog: MatDialog, 
     private router: Router,  private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
  // Initialization logic when the component is created
  this.loadGalleryData(); // Load gallery data (text and images)

  // Subscribe to user changes to update the local `user` property
  this.userService.user$.subscribe(user => {
    this.user = user; // Assign the current user details to the `user` property
  });

  // Listen to route changes and check if there is an active child route
  this.router.events.subscribe(() => {
    const child = this.activatedRoute.firstChild;
    this.isChildRouteActive = !!child; // Set to true if a child route exists
  });
}

loadGalleryData(): void {
  // Fetch main gallery page content from the server
  this.service.getMainGalleriesPageContent().subscribe(
    (response) => {
      // Populate the gallery texts and image URLs with the response data
      this.sText = response.sText;
      this.sImageUrl = `${this.baseUrl}/${response.sImageMain}`;
      this.nText = response.nText;
      this.nImageUrl = `${this.baseUrl}/${response.nImageMain}`;
      this.aText = response.aText;
      this.aImageUrl = `${this.baseUrl}/${response.aImageMain}`;

      // Pre-fill allChanges object with the initial data from the server
      this.allChanges.nText = this.nText;
      this.allChanges.aText = this.aText;
      this.allChanges.sText = this.sText;
    },
    (error) => {
      // Log any error that occurs while loading gallery data
      console.error('Error loading gallery data:', error);
    }
  );
}

onFileSelected(event: Event, category: string): void {
  // Handle file selection for uploading new images
  const input = event.target as HTMLInputElement;
  
  if (input.files && input.files.length > 0) {
    const file = input.files[0];

    // Validate the file type before proceeding
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload an image.');
      return;
    }

    // Assign the selected file to the appropriate category
    if (category === 'n') {
      this.allChanges.nFile = file;
      this.isUploadingNature = true; // Indicate that the nature gallery image is being uploaded
    } else if (category === 'a') {
      this.allChanges.aFile = file;
      this.isUploadingArchitecture = true; // Indicate that the architecture gallery image is being uploaded
    } else if (category === 's') {
      this.allChanges.sFile = file;
      this.isUploadingStaged = true; // Indicate that the staged gallery image is being uploaded
    }
  }
}

submitAllChanges(): void {
  // Submit all changes (text and images) to the server
  console.log('Submitting changes:', this.allChanges);

  const formData = new FormData();

  // Add gallery texts to the form data
  formData.append('nText', this.nText || '');
  formData.append('aText', this.aText || '');
  formData.append('sText', this.sText || '');

  // Add the selected files to the form data
  if (this.allChanges.nFile) {
    formData.append('nFile', this.allChanges.nFile, this.allChanges.nFile.name);
  }
  if (this.allChanges.aFile) {
    formData.append('aFile', this.allChanges.aFile, this.allChanges.aFile.name);
  }
  if (this.allChanges.sFile) {
    formData.append('sFile', this.allChanges.sFile, this.allChanges.sFile.name);
  }

  // Submit the form data to the server
  this.service.submitMainGalleryChanges(formData).subscribe({
    next: (response: any) => {
      console.log('Submitted successfully:', response);

      // Update image URLs and reset upload states if response contains updated URLs
      if (response.nImageUrl) {
        this.nImageUrl = response.nImageUrl;
        this.isUploadingNature = false;
      }
      if (response.aImageUrl) {
        this.aImageUrl = response.aImageUrl;
        this.isUploadingArchitecture = false;
      }
      if (response.sImageUrl) {
        this.sImageUrl = response.sImageUrl;
        this.isUploadingStaged = false;
      }

      // Reload gallery data to reflect the changes
      this.loadGalleryData();
    },
    error: (error) => {
      console.error('Error submitting changes:', error);

      // Reset upload states in case of error
      this.isUploadingNature = false;
      this.isUploadingArchitecture = false;
      this.isUploadingStaged = false;
    },
  });
}

handleLinkClick(event: MouseEvent): void {
  event.preventDefault(); // Prevent default link behavior

  // Update the user state
  this.userService.user$.subscribe((user) => {
    this.user = user;
    console.log('User updated in GalleryComponent:', user);
  });

  console.log('User:', this.user);

  // Handle user states for accessing the staged gallery
  if (!this.user) {
    // Show warning for non-logged-in users
    this.adultWarning(false);
  } else if (this.user?.type === 'admin') {
    // Allow admin users to navigate directly
    this.router.navigate(['/gallery/staged']);
  } else if (this.user.status === 'blocked') {
    // Show warning for blocked users
    this.adultWarning(true);
  } else if (this.user.status === 'active') {
    // Active users see a confirmation dialog before proceeding
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      data: { heading: 'ADULT WARNING!', message: 'You are about to enter the staged gallery. Do you want to proceed?' }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        // Navigate to the staged gallery if confirmed
        this.router.navigate(['/gallery/staged']);
      } else {
        console.log('Chose to stay in gallery canceled.');
      }
    });
  } else {
    // Handle unexpected user statuses
    console.error('Unexpected user status:', this.user.status);
  }
}

adultWarning(isBlocked: boolean): void {
  // Display a warning dialog for blocked or non-logged-in users
  const header = isBlocked ? 'ACCESS DENIED' : 'LOGIN REQUIRED';
  const message = isBlocked 
    ? 'Sorry, you are not eligible for viewing this content.'
    : 'Please sign in to view the gallery adult content.';

  // Open the dialog with the appropriate message
  const dialogRef = this.dialog.open(DialogOkComponent, {
    width: '400px',
    data: { header, message }
  });

  // Log dialog closure
  dialogRef.afterClosed().subscribe(() => {
    console.log('Dialog closed');
  });
}

}
   

