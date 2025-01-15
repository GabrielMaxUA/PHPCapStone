import { Component, OnInit } from '@angular/core';
import { UserService } from '../service/user.service'; // Service to manage user-related data and state
import { User } from '../Models/interfaces'; // Interface defining the structure of a user object
import { Service } from '../service/service'; // Custom service for handling API requests (bio and image uploads)

@Component({
    selector: 'app-about', // Custom HTML tag for this component
    templateUrl: './about.component.html', // Path to the component's HTML template
    styleUrl: './about.component.css', // Path to the component's CSS file
    standalone: false // Indicates this component is not standalone and part of a module
})
export class AboutComponent implements OnInit {
  bioText: string = ''; // Holds the user's bio text
  user: User | null = null; // Stores the current user object, initially null
  imageUrl: string = ''; // URL for the user's profile image
  selectedFile: File | null = null; // Holds the file selected for upload
  isUploading: boolean = false; // Flag to indicate if an image is being uploaded
  // Base URL for API requests; adjusted for production or development environments
  //baseUrl = 'http://localhost/frameBase';
  baseUrl = 'https://triosdevelopers.com/~Max.Gabriel/frame/frameBase'; 

  // Constructor injects the required services for dependency management
  constructor(private userService: UserService, private service: Service) {}

  // Lifecycle hook: called once the component is initialized
  ngOnInit(): void {
    // Subscribe to changes in the user state from the UserService
    this.userService.user$.subscribe((user) => {
      this.user = user; // Update the user object whenever it changes
    });

    // Fetch the user's bio and image on initialization
    this.getBio();
  }

  // Event handler for file selection
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0]; // Get the selected file from the input element
  }

  // Submits the bio and uploads the selected image if present
  submitBio(): void {
    // Check if a file is selected for upload
    if (this.selectedFile) {
      this.isUploading = true; // Set the uploading flag to true
      this.service.uploadMainImage(this.selectedFile).subscribe(
        (response: any) => {
          console.log('Image uploaded successfully:', response); // Log success response
          this.ngOnInit(); // Refresh the data by reinitializing the component
          this.isUploading = false; // Reset the uploading flag
        },
        (error) => {
          console.error('Error uploading image:', error); // Log error response
          this.isUploading = false; // Reset the uploading flag
        }
      );
    }

    // Save the user's bio using the service
    this.service.saveBio(this.bioText).subscribe(
      (response) => {
        console.log('Bio saved successfully:', response); // Log success response
      },
      (error) => {
        console.error('Error saving bio:', error); // Log error response
      }
    );
  }

  // Fetches the user's bio and main profile image from the backend
  getBio(): void {
    this.service.getBio().subscribe(
      (response) => {
        this.bioText = response.bioText; // Update the bio text
        this.imageUrl = `${this.baseUrl}/${response.mainImage}`; // Construct the image URL
      },
      (error: any) => {
        console.error('Error fetching bio:', error); // Log error response
      }
    );
  }
}
