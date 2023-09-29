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
  Emoji=false;
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
MessageSet(event: any,Emoji:boolean) {
  if(Emoji)
  {
    console.log(event);
  //  this.txtMessage='&#x'+event.emoji.unified+";";
  //  this.CheckMessageWrite='&#x'+event.emoji.unified+";";
   this.txtMessage+=event.emoji.native;
   this.CheckMessageWrite=event.emoji.native;
  }
     else
     {
      this.txtMessage = event.target.value;
      this.CheckMessageWrite=event.target.value;
     }
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
        this.MessageSet(event, false)
      }
      else{

        this.chatService.SendStatusOfTyping(MessageModel,Status)
      }
  }

  sendMessage(): void {
  this.Emoji = false;
    debugger;
    var MessageModel = {
      FromUserId: this.UserId,
      ToUserId: this.ReceiverId,
      Message: this.convertEmojiToUnicodeEmoji(this.txtMessage)
    }
    debugger;
    if(MessageModel.Message[0] === '?'){
      this.toast.error("Sorry We Are Working On This Emoji Cant Send !!");
      return;
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

  //  Adding Of Emoji Picker Code Below 
  convertUnicodeEmojiToEmoji(inputText: string): string {
    const regex = /&#x([0-9A-Fa-f]+);/g;
    // // const regex = /&#x(?:[0-9A-Fa-f]+(?:-[0-9A-Fa-f]+)+);/g;
    // const regex = /&#x([\uD800-\uDBFF][\uDC00-\uDFFF]);|&#x[\u2600-\u27BF];/g;
    return inputText.replace(regex, (match, hexCode) => {
      const codePoint = parseInt(hexCode, 16);
      return String.fromCodePoint(codePoint);
    });
  }

  convertEmojiToUnicodeEmoji(inputText: string) {
    // debugger;
    // Use regular expressions to find emoji characters and convert them to Unicode codes
    // const regex = /([\uD800-\uDBFF][\uDC00-\uDFFF])|[\u2600-\u27BF]/g;
    const regex = /([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2194-\u21AA]|[\u2300-\u27BF]|[\u2B05-\u2B07]|[\u2934\u2935]|[\u25AA\u25AB\u25FE\u25FD]|[\u25FB\u25FC]|[\u25FE]|[\u2600-\u26FF]|[\u2702-\u27B0]|[\u2B06]|[\u2934\u2935]|[\u2B05-\u2B07]|[\u303D]|[\u3297\u3299]|[\u2B05]|[\u2B06]|[\u2B07]|[\u2934]|[\u2935]|[\u25AA]|[\u25AB]|[\u2B05]|[\u2B06]|[\u2B07]|[\u2934]|[\u2935]|[\u303D]|[\u3297]|[\u3299]|[\u2B05-\u2B07]|[\u3297-\u3299]|[\u203C\u2049]|[\u2122\u2139\u2194-\u21AA]|[\u2B05-\u2B07]|[\u2B05-\u2B07]|[\u303D]|[\u3297]|[\u3299])/g;
    // const regex=/&#x([0-9A-Fa-f]+);/g;
    return inputText.replace(regex, (match) => {
      if (match.length === 2) {
        const highSurrogate = match.charCodeAt(0);
        const lowSurrogate = match.charCodeAt(1);
        const codePoint = ((highSurrogate - 0xD800) * 0x400) + (lowSurrogate - 0xDC00) + 0x10000;
        return `&#x${codePoint.toString(16)};`;
      } else {
        const codePoint:any = match.codePointAt(0);
        return `&#x${codePoint.toString(16)};`;
      }
    });
  }

  EmojiEnable()
  {
    this.Emoji=!this.Emoji;
  }


}
