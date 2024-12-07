import { Component } from '@angular/core';
import { User } from '../user';
import { Service } from '../service/service';
import { UserService } from '../service/user.service';

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
  constructor(private userService: UserService, private service: Service) {}
  ngOnInit(): void {
    // Subscribe to user changes
    this.userService.user$.subscribe((user) => {
      this.user = user;
    });

    this.loadGalleryData();

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
      if (category === 'n') {
        this.allChanges.nFile = input.files[0];
      } else if (category === 'a') {
        this.allChanges.aFile = input.files[0];
      } else if (category === 's') {
        this.allChanges.sFile = input.files[0];
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
      formData.append('aFile', this.allChanges.aFile);
    }
    if (this.allChanges.sFile) {
      formData.append('sFile', this.allChanges.sFile);
    }
  
    this.service.submitMainGalleryChanges(formData).subscribe({
      next: (response: any) => {
        console.log('Submitted successfully:', response);
        if (response.nImageUrl) this.nImageUrl = response.nImageUrl;
        if (response.aImageUrl) this.aImageUrl = response.aImageUrl;
        if (response.sImageUrl) this.sImageUrl = response.sImageUrl;
        this.loadGalleryData();
      },
      error: (error) => {
        console.error('Error submitting changes:', error);
      },
    });
  }
  

}
