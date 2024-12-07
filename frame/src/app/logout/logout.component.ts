
import { Router } from "@angular/router"
import { Service } from "../service/service"
import { Component } from "@angular/core"
import { UserService } from "../service/user.service";


@Component({
    selector: 'app-logout',
    templateUrl: './logout.component.html',
    styleUrl: './logout.component.css',
    standalone: false
})
export class LogoutComponent{
  constructor(private service: Service, private router: Router, private userService: UserService){
    // this.userService.clearUser(); // Clear user data
    // this.router.navigate(['about']); // Redirect 
  }
  ngOnInit(): void {
    //this.logout();
  }
  
  logout(): void {
    this.service.logout().subscribe(
      () => {
        localStorage.removeItem('token'); // Clear user token
        console.log('you are logout:');
        this.userService.clearUser(); // Clear user data
        this.router.navigate(['about']); // Redirect to 'about' page
      },
      (error) => {
        console.error('Error during logout:', error);
        alert('Failed to log out. Please try again.');
      }
    );
  }
  
}