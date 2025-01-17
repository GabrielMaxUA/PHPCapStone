import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { Service } from '../../service/service';
import { User } from '../../Models/interfaces';
import { UserService } from '../../service/user.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
    standalone: false
})

export class HeaderComponent {
  menuActive = false;
  cartCount: number = 1;
  isResponsiveMode = false;
  user: User | null = null;
  
  constructor( private service: Service, private cdr: ChangeDetectorRef,
    private userService: UserService){}


ngOnInit(){
  this.cartCount = this.service.getCartCount();
  this.userService.user$.subscribe((user) => {
    this.user = user;
    if (user) {
      this.service.getCartItems();
    } else {
      this.cartCount = 0;
    }
  });
  this.service.cartCount$.subscribe(count => {
    this.cartCount = count;
    this.cdr.detectChanges();
  });

  this.checkResponsiveMode();
}

  @HostListener('window:resize', [])
  onResize(): void {
    this.checkResponsiveMode();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Get references to the menu button and aside element
    const menuButton = document.querySelector('.menu');
    const aside = document.querySelector('aside');
    
    // Check if click is outside both menu button and aside
    if (menuButton && aside && 
        !menuButton.contains(event.target as Node) && 
        !aside.contains(event.target as Node)) {
      this.menuActive = false;
    }
  }

  private checkResponsiveMode(): void {
    this.isResponsiveMode = window.innerWidth <= 768;
  }
 
}