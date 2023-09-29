import { CommonModule } from '@angular/common';
import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import { ApiUrlHelper } from 'src/Common/apiUrlHelper';
import { message } from 'src/Common/message';
import { ChatService } from 'src/app/Services/chat-service.service';
import { CommonService } from 'src/app/Services/common.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-group-chat',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.scss']
})
export class GroupChatComponent implements OnInit , OnDestroy {
  EmptyList:Boolean = true;
  title = 'ClientApp';  
  txtMessage: string = '';  
  totalUser:any;
  uniqueID: string = new Date().getTime().toString();  
  messages = new Array<message>();  
  message = new message();  
  UserId:any;
  UserName:any;
  ReceiverId:any;
  filteredObjects: any[] = [];
  CountOfUnreadMessage:any;
  combinedData: any[] = [];


  constructor(  
    private chatService: ChatService,  
    private _ngZone: NgZone,
    private service:CommonService,
    private apiUrl:ApiUrlHelper ,
    private route:Router,
    // private spinner:NgxSpinnerService
  
  ) {  

  }  
  
  ngOnDestroy(): void {
    this.totalUser=0;
  
  }
  ngOnInit(): void {
    this.UserId = localStorage.getItem('UserId');
    this.UserId = Number.parseInt(this.UserId);
    this.GetUserDataById();
    this.subscribeToEvents();
  }
  SetOfflineStatus()
  {
    this.UserId = localStorage.getItem('UserId');
    this.UserId = Number.parseInt(this.UserId);
    debugger;
     this.chatService.SetUserOffline(this.UserId );
  }
  MessageSet(event:any)
  {
    this.txtMessage=event.target.value;
  }
  sendMessage(): void {  
    if (this.txtMessage) {  
      this.message = new message();  
      this.message.clientuniqueid = this.uniqueID;  
      this.message.type = "sent";  
      this.message.message = this.txtMessage;  
      this.message.date = new Date();  
      this.messages.push(this.message);  
      if(this.messages == undefined , this.messages == null ){
        this.EmptyList = true;
      }
      else{
        this.EmptyList = false;
      }
      this.chatService.sendMessage(this.message);  
      this.txtMessage = '';  
    }  
  }  
   private subscribeToEvents(): void {  
    this.chatService.messageReceived.subscribe((message: message) => {  
      this._ngZone.run(() => {  
        if (message.clientuniqueid !== this.uniqueID) {  
          message.type = "received";  
          this.messages.push(message);  

          if(this.messages == undefined , this.messages == null ){
            this.EmptyList = true;
          }
          else{
            this.EmptyList = false;
          }
        }  
      });  
    });  
    this.chatService.UnreadMessageOfUser.subscribe((value) => {  
      this._ngZone.run(() => {  
        if(typeof value==='object')
        {
          this.CountOfUnreadMessage=Object.values(value);
        }       
      });  
    });  
   
  this.chatService.selectData.pipe( debounceTime(10)).subscribe((value)=>  {
  this._ngZone.run(()=>
  {
    if (typeof value === 'object') {
      this.totalUser = Object.values(value);
      this.filteredObjects =  this.totalUser.filter((obj: { userId: any; }) => obj.userId !== this.UserId);
      this.combinedData = this.filteredObjects.map(user => {
        const unreadMessage = this.CountOfUnreadMessage.find((message: { fromUserId: any; }) => message.fromUserId === user.userId);
        return {
          ...user,
          ...unreadMessage
        };
      });
    }
  })
     
  
    });
  }

  private GetUserDataById(){
  const apiUrl = this.apiUrl.apiUrl.Authentication.GetUserById;
    this.service.doPost(apiUrl,this.UserId).pipe().subscribe({
      next:(response)=>{
        this.UserName = response.data.userName;
      }
    })
    
  }

  public GetReceiverData(item:any){
   this.ReceiverId = item.userId;
  
    this.route.navigate([`OneToOne/${this.ReceiverId}`]);
  }
}
