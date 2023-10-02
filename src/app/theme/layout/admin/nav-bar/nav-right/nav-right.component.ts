// Angular import
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/Services/chat-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nav-right',
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent {
  UserId:any;

  constructor(private Service:ChatService , private route:Router){}

  LogOut() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You Really Want To LogOut!',
      showCancelButton: true,
      confirmButtonText: 'Yes!',
      cancelButtonText: 'No!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.UserId = localStorage.getItem('UserId');
          this.UserId = Number.parseInt(this.UserId);
          this.Service.SetUserOffline(this.UserId);
          localStorage.clear();
          this.route.navigate(['/guest/login']);
        Swal.fire('Deleted!', 'User Logged Out Succesfully.', 'success');
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        return;
      }
    });
    

  }
  
}
