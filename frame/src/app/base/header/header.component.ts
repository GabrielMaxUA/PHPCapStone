import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  menuActive: boolean = false;

  toggleMenu() {
    this.menuActive = !this.menuActive;
  }
}
