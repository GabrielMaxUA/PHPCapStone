// import { Component } from '@angular/core';
// import { Router } from '@angular/router';
// import { UserService } from '../service/user.service';

import { Router } from "@angular/router"
import { Service } from "../service/service"
import { Component } from "@angular/core"

// @Component({
//   selector: 'app-logout',
//   template: '',
// })
// export class LogoutComponent {
//   constructor(private userService: UserService, private router: Router) {
//     this.userService.clearUser(); // Clear user data
//     this.router.navigate(['about']); // Redirect 
//   }
// }

@Component({
  selector:'app-logout',
  template:'',
})
export class LogoutComponent{
  constructor(private service: Service, private router: Router){}
  logout(){
    this.service.logout().subscribe(() => {
      localStorage.removeItem('token');
      this.router.navigate(['about']);
    })
  }
}