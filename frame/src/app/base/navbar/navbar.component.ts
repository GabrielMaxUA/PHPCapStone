import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { UserService } from '../../service/user.service'; // Service to manage user-related data and state
import { User } from '../../Models/interfaces'; // Interface defining the structure of a user object
import { Service } from '../../service/service'; // Custom service for handling API requests
import { NavigationEnd, Router } from '@angular/router'; // Router and NavigationEnd for route navigation handling
import { MatDialog } from '@angular/material/dialog'; // Angular Material Dialog for confirmation pop-ups
import { DialogComponent } from '../../dialog/dialog.component'; // Custom dialog component
import { filter } from 'rxjs'; // RxJS operator for filtering router events

@Component({
    selector: 'app-navbar', // Custom HTML tag for this component
    templateUrl: './navbar.component.html', // Path to the component's HTML template
    styleUrls: ['./navbar.component.css'], // Path to the component's CSS file
    standalone: false // Indicates this component is part of a module
})
export class NavBarComponent implements OnInit {
  user: User | null = null; // Holds the current user data
  cartCount: number = 1; // Tracks the number of items in the cart
  isDropdownOpen = false; // Flag to control the dropdown menu state
  isInGalleryRoute = false; // Indicates if the current route is gallery-related
  isChildGalleryActive = false; // Tracks if a child route of '/gallery' is active
  isResponsiveMode = false; // Tracks if the screen width is in responsive mode

  constructor(
    private dialog: MatDialog, // Dialog service for confirmation prompts
    private service: Service, // Service for handling cart and authentication-related logic
    private userService: UserService, // Service for managing user state
    private router: Router, // Router for navigation handling
    private cdr: ChangeDetectorRef // Service to manually trigger change detection
  ) {
    // Subscribe to route changes to detect gallery routes and close the dropdown menu
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd) // Filter NavigationEnd events
    ).subscribe(() => {
      this.isInGalleryRoute = this.checkIfGalleryRoute(); // Update gallery route flag
      this.cdr.detectChanges(); // Trigger change detection
      this.isDropdownOpen = false; // Close the dropdown menu
    });
  }

  ngOnInit(): void {
    // Subscribe to cart count changes from the service
    this.service.cartCount$.subscribe(count => {
      console.log("Cart count updated: ", count);
      this.cartCount = count; // Update cart count
      this.cdr.detectChanges(); // Trigger change detection
    });

    this.checkResponsiveMode(); // Check and set responsive mode based on window width

    // Subscribe to route changes to detect child gallery routes
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isChildGalleryActive = this.router.url.startsWith('/gallery/') && this.router.url !== '/gallery';
      }
    });

    this.cartCount = this.service.getCartCount(); // Initialize cart count
    this.userService.user$.subscribe((user) => {
      this.user = user; // Update user state
      if (user) {
        // Refresh cart count when user logs in
        this.service.getCartItems(); // Trigger cart count update
      } else {
        this.cartCount = 0; // Reset cart count if no user is logged in
      }
    });

    this.isInGalleryRoute = this.checkIfGalleryRoute(); // Initialize gallery route flag
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route); // Check if the given route is active
  }

  checkIfGalleryRoute(): boolean {
    const galleryRoutes = ['/nature', '/architecture', '/staged', '/gallery'];
    return galleryRoutes.some(route => this.router.url.startsWith(route)); // Check if current route is gallery-related
  }

  isGalleryRoute(): boolean {
    return this.router.url.includes('gallery'); // Check if the URL includes 'gallery'
  }

  toggleDropdown(event: Event) {
    if (window.innerWidth <= 768) { // Only toggle dropdown in responsive mode
      event.preventDefault();
      this.isDropdownOpen = !this.isDropdownOpen; // Toggle dropdown state
      console.log('Dropdown state:', this.isDropdownOpen);
    }
  }

  closeDropdown() {
    this.isDropdownOpen = false; // Close the dropdown menu
  }

  shouldShowLink(route: string): boolean {
    if (window.innerWidth > 768) {
      return true; // Show all links on desktop
    }

    // On mobile
    if (this.isDropdownOpen) {
      return true; // Show all links when dropdown is open
    }

    if (this.isActive(route)) {
      return true; // Show the active link
    }

    if (route === '/gallery' && this.isInGalleryRoute) {
      return true; // Show gallery link in gallery-related routes
    }

    return false; // Hide other links
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const navbar = document.querySelector('.navbar'); // Get the navbar element
    if (navbar && !navbar.contains(event.target as Node)) {
      this.closeDropdown(); // Close dropdown if click is outside the navbar
    }
  }

  @HostListener('window:resize', [])
  onResize(): void {
    this.checkResponsiveMode(); // Update responsive mode on window resize
  }

  private checkResponsiveMode(): void {
    this.isResponsiveMode = window.innerWidth <= 768; // Check if in responsive mode (mobile)
  }

  logout(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      data: { heading: 'Attention', message: 'Are you sure you want to log out?' }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.service.logout().subscribe(
          () => {
            localStorage.removeItem('token'); // Clear user token from localStorage
            console.log('You are logged out');
            this.userService.clearUser(); // Clear user state
            this.router.navigate(['about']); // Redirect to 'about' page
          },
          (error) => {
            this.dialog.open(DialogComponent, {
              width: '400px',
              data: { heading: 'Oops...', message: 'Something went wrong...' }
            });
            console.error('Error during logout:', error);
            alert('Failed to log out. Please try again.');
          }
        );
      } else {
        console.log('Logout canceled.');
      }
    });
  }
}
