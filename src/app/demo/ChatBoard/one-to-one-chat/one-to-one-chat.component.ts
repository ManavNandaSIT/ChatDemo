import { AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { CommonService } from 'src/app/Services/common.service';
import { DatePipe } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { ApiUrlHelper } from 'src/Common/apiUrlHelper';
import { ChatService } from 'src/app/Services/chat-service.service';
import { ToastrService } from 'ngx-toastr';
import { OldHistoryMessageMOdel, message, messageModelOneToOne } from 'src/Common/message';


@Component({
  selector: 'app-one-to-one-chat',
  templateUrl: './one-to-one-chat.component.html',
  styleUrls: ['./one-to-one-chat.component.scss']
})
export class OneToOneChatComponent implements OnInit   {
  ReceiverId: any;
  EmptyList: boolean = true;
  @ViewChild('chatMessagesContainer') private chatMessagesContainer!: ElementRef;
  @ViewChild('SendMessage', { static: true }) yourElement!: ElementRef;

  constructor(private route: ActivatedRoute, private api: ApiUrlHelper,
    private chatService: ChatService,
    private _ngZone: NgZone,
    private service: CommonService,
    private apiUrl: ApiUrlHelper,
    private datePipe: DatePipe,
    private toast: ToastrService,
    private routeservice: Router,
   

  ) {
    this.subscribeToEvents();
    this.getCurrentTime();

  }






  ngOnInit(): void {
   
  
    this.ReceiverId = parseInt(this.route.snapshot.paramMap.get('id') ?? "");
    this.SenderId = localStorage.getItem('UserId');
    this.SenderId = Number.parseInt(this.SenderId);
    this.chatService.createConnection();
    var MessageModel = {
      FromUserId: this.SenderId,
      ToUserId: this.ReceiverId
    }
    this.chatService.startConnection(true, MessageModel);
    this.chatService.registerOnServerEvents();
    this.GetReceiverData();
    this.GetUserDataById();
    setTimeout(() => {
      this.TypingStatus(this.CheckMessageWrite);
    }, 1000);

  }


  currentTime: Date = new Date();
  title = 'ClientApp';
  txtMessage: string = '';
  totalUser: any;
  uniqueID: string = new Date().getTime().toString();
  OneToOneChatMessage: any = [];
  message = new message();
  UserId: any;
  UserName: any;
  SenderId: any;
  ReceivedMessage = '';
  ReceiverName: any;
  OldHistoryMessage: any;
  EmptyChatBool:boolean = false;
  EmptyMessageDate:any;
  StatusTyping:any;
  StatusTypingInfo:any;

  SendMessageCall=0;
  CheckMessageWrite='';

   subscription!: Subscription;
   Emoji=false;

  // EmptyChatList() {
  //   this.OneToOneChatMessage = '';
  // }

  sameDates(startDate: Date, endDate: Date): boolean {
    return this.datePipe.transform(startDate, 'dd-MM') != this.datePipe.transform(endDate, 'dd-MM');
  }
  TypingStatus(message:string)
  
  { var MessageModel = {
    FromUserId: this.SenderId,
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

    this.txtMessage=event.emoji.native;

     this.CheckMessageWrite=event.emoji.native;

    }

       else

       {

        this.txtMessage = event.target.value;

        this.CheckMessageWrite=event.target.value;

       }

       

    // clearTimeout(this.timout)

    var MessageModel = {

      FromUserId: this.SenderId,

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

 EmojiEnable()
 {
   this.Emoji=!this.Emoji;
 }

// Define a class variable to hold the timeout ID
// private typingTimeout: any;

// MessageSet(event: any) {
//   this.txtMessage = event.target.value;
//   var MessageModel = {
//     FromUserId: this.SenderId,
//     ToUserId: this.ReceiverId
//   };

//   // Clear the existing timeout, if any
//   if (this.typingTimeout) {
//     clearTimeout(this.typingTimeout);
//   }

//   if (this.txtMessage == '') {
//     this.chatService.SendStatusOfTyping(MessageModel, false);
//   } else {
//     // Set a new timeout to send "typing" status after 1000 milliseconds (1 second)
//     this.typingTimeout = setTimeout(() => {
//       console.log("Inner Call");
//       if(this.txtMessage==this.yourElement.nativeElement.value)
//       {
//         console.log("True Call");
//         this.chatService.SendStatusOfTyping(MessageModel, true);
//       }
//       else{
//         console.log("False Call");
//         this.chatService.SendStatusOfTyping(MessageModel, false);
//       }
    
//     }, 1000);
//   }
// }




  // 
  

//  typingClose(){
//   console.log("hello");
  
//   var MessageModel = {
//     FromUserId: this.SenderId,
//     ToUserId: this.ReceiverId
//   }
//   this.chatService.SendStatusOfTyping(MessageModel,false)
//  }

  SetUserTypinStatus(Status:boolean, event: any)
  {
    
    var MessageModel = {
      FromUserId: this.SenderId,
      ToUserId: this.ReceiverId
    }
      if(Status)
      {
        this.MessageSet(event , false)
      }
      else{

        this.chatService.SendStatusOfTyping(MessageModel,Status)
      }
  }


  sendMessage(): void {
    // this.ImageIsAppend=false;
    // + " " + "imagePortion" +  " " + this.ImageSelected64
    this.Emoji=false;
    var MessageModel = {
      FromUserId: this.SenderId,
      ToUserId: this.ReceiverId,
      Message: this.convertEmojiToUnicodeEmoji(this.txtMessage) 
    }
    debugger;
    if (this.txtMessage == '') {
      this.toast.error("Message Cannot Be Empty !!!");
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
      FromUserId: this.SenderId,
      ToUserId: this.ReceiverId
    }
   this.chatService.SendStatusOfTyping(MessageModel,false);
      this.routeservice.navigate(['GroupChat']);


  }


  getCurrentTime(): void { this.currentTime = new Date(); }
  formatTime(time: Date): string { return this.datePipe.transform(time, 'mediumTime')!; }

  formatDate(date: Date): string { return this.datePipe.transform(date, 'mediumDate')!; }

  private subscribeToEvents(): void {
    this.chatService.OldMessageEmiiter.subscribe((Oldmessage: OldHistoryMessageMOdel) => {
      this._ngZone.run(async () => {
        this.OldHistoryMessage = Oldmessage;
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
      
      debugger;
        if (message.fromUserId == this.ReceiverId || message.fromUserId == this.UserId) {
          // var data=
          
          // {
          //     FromUserId:message.toUserId,
          //     ToUserId:message.fromUserId
          // }

          this.OneToOneChatMessage.push(message);
       


          if (this.OneToOneChatMessage.length == 0) {
            this.EmptyList = true;
          }
          else {
            this.EmptyList = false;
            // this.chatService.UpdateLiveStatusChat(data)

          }
        }

      });

      const source = interval(10000);
      this.subscription = source.subscribe(val => this.TypingStatus(this.CheckMessageWrite));

  }

  private GetUserDataById() {
    this.UserId = localStorage.getItem('UserId');
    this.UserId = Number.parseInt(this.UserId);
    const apiUrl = this.apiUrl.apiUrl.Authentication.GetUserById;
    this.service.doPost(apiUrl, this.UserId).pipe().subscribe({
      next: (response) => {
        this.UserName = response.data.userName;
      }
    })
  }

  GetReceiverData() {
    const apiUrl = this.apiUrl.apiUrl.Authentication.GetUserById;
    this.service.doPost(apiUrl, this.ReceiverId).pipe().subscribe({
      next: (response) => {
        this.ReceiverName = response.data.userName;
      }
    })
  }
  scrollToBottom(): void {
    if (this.chatMessagesContainer) {
      const container = this.chatMessagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  GetOldMessages() {
    this.UserId = localStorage.getItem('UserId');
    this.UserId = Number.parseInt(this.UserId);
    var MessageModel = {
      FromUserId: this.UserId,
      ToUserId: this.ReceiverId
    }
    this.chatService.GetHistoryMessage(MessageModel);
  }

  ngOnDestroy() {
    var MessageModel = {
      FromUserId: this.SenderId,
      ToUserId: this.ReceiverId
    }
    this.ReceiverId = 0;
    this.StatusTyping='';
    this.chatService.SendStatusOfTyping(MessageModel,false);
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

  convertUnicodeEmojiToEmoji(inputText: string): string {

    const regex = /&#x([0-9A-Fa-f]+);/g;
  
    // // const regex = /&#x(?:[0-9A-Fa-f]+(?:-[0-9A-Fa-f]+)+);/g;
  
    // const regex = /&#x([\uD800-\uDBFF][\uDC00-\uDFFF]);|&#x[\u2600-\u27BF];/g;
  
    return inputText.replace(regex, (match, hexCode) => {
  
      const codePoint = parseInt(hexCode, 16);
  
      return String.fromCodePoint(codePoint);
  
    });
  
  }
}
