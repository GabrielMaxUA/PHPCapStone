import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
    standalone: false
})

export class HeaderComponent {
  menuActive = false;

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

  toggleMenu() {
    this.menuActive = !this.menuActive;
    // Stop event propagation to prevent immediate closing
    event?.stopPropagation();
  }
}