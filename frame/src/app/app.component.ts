import { Component } from '@angular/core';
import { Service } from './service/service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    standalone: false
})
export class AppComponent {
  title = 'frame';
  private inactivityTimer: any;
  private readonly INACTIVITY_TIMEOUT = 2 * 60 * 1000; //10 min

  constructor(private service: Service){}

  ngOnit(){
    this.setupActivityMonitor();
  }

  private setupActivityMonitor(){
    const resetTimer = () => {
    if(this.inactivityTimer){
      clearTimeout(this.inactivityTimer);
    }
    this.inactivityTimer = setTimeout(() => {
      this.service.logout();
    }, this.INACTIVITY_TIMEOUT);
    };

    ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => resetTimer);
    });

    resetTimer();
  }

  ngOnDestroy(){
    if(this.inactivityTimer){
      clearTimeout(this.inactivityTimer);
    }
    this.service.stopHeartbeat();
  }

}
