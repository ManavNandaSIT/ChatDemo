// Angular import
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/Services/chat-service.service';

@Component({
  selector: 'app-nav-right',
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent {
  UserId:any;

  constructor(private Service:ChatService , private route:Router){}

  LogOut(){
     this.UserId = localStorage.getItem('UserId');
     this.UserId = Number.parseInt(this.UserId);
    this.Service.SetUserOffline(this.UserId);
    localStorage.clear();
    this.route.navigate(['/guest/login']);
  }
}
