import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { UserService } from '../../service/user.service';
import { User } from '../../Models/user';
import { Service } from '../../service/service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../dialog/dialog.component';


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

  constructor(
    private dialog: MatDialog,
    private service: Service,
    private userService: UserService, 
    private router: Router,
    private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Subscribe to user changes
    this.service.cartCount$.subscribe(count => {
      console.log("count updated: ", count);
      this.cartCount = count;
      this.cdr.detectChanges()});

    this.cartCount = this.service.getCartCount();
    this.userService.user$.subscribe((user) => {this.user = user;});
  }
  
  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const navbar = document.querySelector('.navbar');
    if (navbar && !navbar.contains(event.target as Node)) {
      this.closeDropdown();
    }
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
