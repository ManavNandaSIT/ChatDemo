import { DatePipe } from '@angular/common';
import { Component, ElementRef, NgZone, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription, debounceTime, interval } from 'rxjs';
import { ApiUrlHelper } from 'src/Common/apiUrlHelper';
import { OldHistoryMessageMOdel, message, messageModelOneToOne } from 'src/Common/message';
import { ChatService } from 'src/app/Services/chat-service.service';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-whats-app',
  templateUrl: './whats-app.component.html',
  styleUrls: ['./whats-app.component.scss']
})
export class WhatsAppComponent implements OnInit , OnDestroy {
  // message: string = '';
  status: string = 'online';
  statusOptionsActive: boolean = false;
  totalUser:any;
  UserId:any;
  UserName:any;
  ReceiverId:any;
  filteredObjects: any[] = [];
  CountOfUnreadMessage:any;
  combinedData: any[] = [];

  //One To One
  EmptyList: boolean = true;
  @ViewChild('chatMessagesContainer') private chatMessagesContainer!: ElementRef;
  @ViewChild('SendMessage', { static: true }) yourElement!: ElementRef;
  //
  //New Code
  currentTime: Date = new Date();
  title = 'ClientApp';
  txtMessage: string = '';
  OneToOneChatMessage:any[] =[] ;
  message = new message();
  ReceivedMessage = '';
  ReceiverName: any;
  OldHistoryMessage: any;
  EmptyChatBool:boolean = false;
  EmptyMessageDate:any;
  StatusTyping:any;
  StatusTypingInfo:any;
  SendMessageCall=0;
  CheckMessageWrite=''; 
  OnceReceiverConnected:boolean = false;
  subscription!: Subscription;
  //


  constructor(private renderer: Renderer2, private el: ElementRef, private chatService: ChatService,  
    private _ngZone: NgZone,
    private service:CommonService,
    private apiUrl:ApiUrlHelper ,
    private route:Router,
    private toast: ToastrService,
    private datePipe:DatePipe
    ) {
      this.subscribeToEventsInitial();
      this.subscribeToEvents();
      this.getCurrentTime();
    }
    
  toggleStatusOptions() {
    this.statusOptionsActive = !this.statusOptionsActive;
  }
  
  scrollToBottom() {
    // const messagesContainer = this.el.nativeElement.querySelector('.messages');
    // messagesContainer.scrollTop = messagesContainer.scrollHeight;
    if (this.chatMessagesContainer) {
      const container = this.chatMessagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }

  ngOnDestroy(): void {
    this.totalUser=0;
  }
  ngOnInit(): void {
    this.UserId = localStorage.getItem('UserId');
    this.UserId = Number.parseInt(this.UserId);
    this.GetUserDataById();
    this.chatService.createConnection();
    var MessageModel = {
      FromUserId: this.UserId,
      ToUserId: this.ReceiverId
    }
    this.chatService.startConnection(true, MessageModel);
    this.chatService.registerOnServerEvents();

    this.GetUserDataById();
    setTimeout(() => {
      this.TypingStatus(this.CheckMessageWrite);
    }, 1000);
  
  }

//New Function One To One 

sameDates(startDate: Date, endDate: Date): boolean {
  return this.datePipe.transform(startDate, 'dd-MM') != this.datePipe.transform(endDate, 'dd-MM');
}
TypingStatus(message:string)

{ var MessageModel = {
  FromUserId: this.UserId,
  ToUserId: this.ReceiverId
}
   if(message='')
   {
     return;
   }
   else if(message==this.txtMessage)
    {
      this.chatService.SendStatusOfTyping(MessageModel,false);
    }
    else
    {
      return;
    }
}
MessageSet(event: any) {
     this.txtMessage = event.target.value;
     this.CheckMessageWrite=event.target.value;
  // clearTimeout(this.timout)
  var MessageModel = {
    FromUserId: this.UserId,
    ToUserId: this.ReceiverId
  }
  // this.timout = setTimeout(this.typingClose, 4000);
  if(this.txtMessage=='')
  {
    this.chatService.SendStatusOfTyping(MessageModel,false);
   
 }
  else {
    this.chatService.SendStatusOfTyping(MessageModel,true);
  }
}


//

  SetOfflineStatus()
  {
    this.UserId = localStorage.getItem('UserId');
    this.UserId = Number.parseInt(this.UserId);
     this.chatService.SetUserOffline(this.UserId );
  }

  //New
  SetUserTypinStatus(Status:boolean, event: any)
  {
    
    var MessageModel = {
      FromUserId: this.UserId,
      ToUserId: this.ReceiverId
    }
      if(Status)
      {
        this.MessageSet(event)
      }
      else{

        this.chatService.SendStatusOfTyping(MessageModel,Status)
      }
  }

  sendMessage(): void {
  
    debugger;
    var MessageModel = {
      FromUserId: this.UserId,
      ToUserId: this.ReceiverId,
      Message: this.txtMessage
    }
    if (this.txtMessage == '') {
      this.toast.error("Message Cannot Be Empty !!!");
      return;
    }
    
    this.chatService.SendMessageToParticularUser(MessageModel);
    this.txtMessage = '';
    this.EmptyList = false;
  

  }

  UpdateChatHistoryMessage() {
    var MessageModel = {
      FromUserId: this.UserId,
      ToUserId: this.ReceiverId
    }
   this.chatService.SendStatusOfTyping(MessageModel,false);
      this.route.navigate(['GroupChat']);
  }


  getCurrentTime(): void { this.currentTime = new Date(); }
  formatTime(time: Date): string { return this.datePipe.transform(time, 'mediumTime')!; }

  formatDate(date: Date): string { return this.datePipe.transform(date, 'mediumDate')!; }
  //

 
   private subscribeToEventsInitial(): void {   
   
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

  private subscribeToEvents(): void {
    debugger;
    this.chatService.OldMessageEmiiter.subscribe((Oldmessage: OldHistoryMessageMOdel) => {
      this._ngZone.run(async () => {
        debugger;
        this.OldHistoryMessage = Oldmessage;
        console.log(this.OldHistoryMessage);
        if (this.OldHistoryMessage == '' || this.OldHistoryMessage == null || this.OldHistoryMessage == undefined) {
          this.EmptyList = true;
        }
        else {
          this.EmptyList = false;
        }
      });
    })

    this.chatService.messageTypeStatusEmitter.subscribe((value) => {
    
        this.StatusTypingInfo = value;
        console.log(this.StatusTypingInfo);
        if(this.StatusTypingInfo.isUserTyping)
        {
          if (this.StatusTypingInfo.fromUserId == this.ReceiverId || this.StatusTypingInfo.fromUserId.fromUserId == this.UserId) {
            this.StatusTyping="Typing...";
         }
        }
        else{
          this.StatusTyping='';
        }
      
      
    console.log(this.StatusTypingInfo.fromUserId);

    });
    this.chatService.messageReceivedForOne.subscribe((message: messageModelOneToOne) => {
   
        if (message.fromUserId == this.ReceiverId || message.fromUserId == this.UserId) {
          // var data=
          
          // {
          //     FromUserId:message.toUserId,
          //     ToUserId:message.fromUserId
          // }
        
          this.OneToOneChatMessage.push(message);
          console.log(this.OneToOneChatMessage);

          if (this.OneToOneChatMessage.length == 0) {
            this.EmptyList = true;
          }
          else {
            this.EmptyList = false;
            // this.chatService.UpdateLiveStatusChat(data)

          }
        }
     

      });

      const source = interval(1000);
      this.subscription = source.subscribe(val => this.TypingStatus(this.CheckMessageWrite));

  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }
  

   GetReceiverData(item:any){
    this.OnceReceiverConnected = true;
     this.ReceiverId = item.userId;
     const apiUrl = this.apiUrl.apiUrl.Authentication.GetUserById;
     this.service.doPost(apiUrl, this.ReceiverId).pipe().subscribe({
       next: (response) => {
         this.ReceiverName = response.data.userName;
       }
     })
    //  this.subscribeToEvents();
     var MessageModel = {
      FromUserId: this.UserId,
      ToUserId: this.ReceiverId
    }
     this.OneToOneChatMessage = [];
    this.OldHistoryMessage ='';
     this.chatService.GetHistoryMessage(MessageModel);
   }

}
