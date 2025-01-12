import { Component, OnInit } from '@angular/core';
import { UserService } from '../service/user.service';
import { User } from '../Models/interfaces';
import { Service } from '../service/service';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrl: './about.component.css',
    standalone: false
})

export class AboutComponent implements OnInit {
  bioText: string = '';
  user: User | null = null;
  imageUrl: string = '';
  selectedFile: File | null = null;
  isUploading: boolean = false;
baseUrl = 'http://localhost/frameBase'; // Add your base URL here
//baseUrl = 'https://triosdevelopers.com/~Max.Gabriel/frame/frameBase'; // Add your base URL here
  constructor(private userService: UserService, private service: Service) {}

  ngOnInit(): void {
    // Subscribe to user changes
    this.userService.user$.subscribe((user) => {
      this.user = user;
    });

    this.getBio();

  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  submitBio(): void{
    if(this.selectedFile){
      this.isUploading = true;
      this.service.uploadMainImage(this.selectedFile).subscribe(
        (response:any)=>{
          console.log('Image uploaded. Success', response);
          this.ngOnInit()
          this.isUploading = false;
        },
        (error) => {
          console.error('Error uploading image: ', error);
          this.isUploading = false;
        }
      )
    }

    this.service.saveBio(this.bioText).subscribe(
      (response) => {
        console.log('response from back:', response);
      },
      (error) => {
        console.error('Error saving bio:', error);
      }
    );
  }//save bio

  getBio(){
    this.service.getBio().subscribe(
      (response)=>{
        this.bioText = response.bioText,
        this.imageUrl = `${this.baseUrl}/${response.mainImage}`
        //this.imageUrl = `https://triosdevelopers.com/~Max.Gabriel/frame/frameBase/${response.mainImage}`
      },
      (error: any) => {
        console.error('Error getting data:', error);
      }
    );
  }
}
