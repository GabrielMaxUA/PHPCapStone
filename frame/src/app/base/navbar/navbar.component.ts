import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { UserService } from '../../service/user.service';
import { User } from '../../Models/interfaces';
import { Service } from '../../service/service';
import { NavigationEnd, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../dialog/dialog.component';
import { filter } from 'rxjs';


@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css'],
    standalone: false
})

export class NavBarComponent implements OnInit {
  user: User | null = null;
  cartCount: number = 1;
  isDropdownOpen = false;
  isInGalleryRoute = false;
  isChildGalleryActive = false;
  isResponsiveMode = false;

  constructor(
    private dialog: MatDialog,
    private service: Service,
    private userService: UserService, 
    private router: Router,
    private cdr: ChangeDetectorRef) {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.isInGalleryRoute = this.checkIfGalleryRoute();
        this.cdr.detectChanges();
        this.isDropdownOpen = false;
      });
    }

  ngOnInit(): void {
    // Subscribe to user changes
    this.service.cartCount$.subscribe(count => {
      console.log("Cart count updated: ", count);
      this.cartCount = count;
      this.cdr.detectChanges()
    });

    this.checkResponsiveMode();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Check if the current route is a child of "/gallery"
        this.isChildGalleryActive = this.router.url.startsWith('/gallery/') && this.router.url !== '/gallery';
      }
    });

    this.cartCount = this.service.getCartCount();
    this.userService.user$.subscribe((user) => {
      this.user = user;
      if (user) {
        // Refresh cart count when user logs in
        this.service.getCartItems(); // This will trigger cartCount$ update
      } else {
        this.cartCount = 0;
      }
    });

    this.isInGalleryRoute = this.checkIfGalleryRoute();
  }
  
  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }


  checkIfGalleryRoute(): boolean {
    const galleryRoutes = ['/nature', '/architecture', '/staged', '/gallery'];
    return galleryRoutes.some(route => this.router.url.startsWith(route));
  }

  isGalleryRoute(): boolean {
    return this.router.url.includes('gallery');
  }

  toggleDropdown(event: Event) {
    if (window.innerWidth <= 768) {
      event.preventDefault();
      this.isDropdownOpen = !this.isDropdownOpen;
      console.log('Dropdown state:', this.isDropdownOpen);
    }
  }

  closeDropdown() {
    this.isDropdownOpen = false;
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
      return true; // Show active link
    }

    // Show gallery link when in gallery-related routes
    if (route === '/gallery' && this.isInGalleryRoute) {
      return true;
    }

    return false;
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const navbar = document.querySelector('.navbar');
    if (navbar && !navbar.contains(event.target as Node)) {
      this.closeDropdown();
    }
  }
  
  @HostListener('window:resize', [])
  onResize(): void {
    this.checkResponsiveMode();
  }

  private checkResponsiveMode(): void {
    this.isResponsiveMode = window.innerWidth <= 1024; // Match media query max-width
  }
  
  logout(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      data: { message: 'Are you sure you want to log out?' }
    });
  
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.service.logout().subscribe(
          () => {
            localStorage.removeItem('token'); // Clear user token
            console.log('You are logged out');
            this.userService.clearUser(); // Clear user data
            this.router.navigate(['about']); // Redirect to 'about' page
          },
          (error) => {
            const dialogRef = this.dialog.open(DialogComponent, {
              width: '400px',
              data: { message: 'Something went wrong...' }
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
