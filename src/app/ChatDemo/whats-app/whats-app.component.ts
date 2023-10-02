import { DatePipe } from '@angular/common';
import { Component, ElementRef, NgZone, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription, debounceTime, interval } from 'rxjs';
import { ApiUrlHelper } from 'src/Common/apiUrlHelper';
import { OldHistoryMessageMOdel, message, messageModelOneToOne } from 'src/Common/message';
import { WhatsUpConstant } from 'src/app/Constants/CommonConstant';
import { ChatService } from 'src/app/Services/chat-service.service';
import { CommonService } from 'src/app/Services/common.service';
import { NgxSpinnerService } from "ngx-spinner";
import { UserStatusEnum } from 'src/app/CommanEnum/StatusEnum';

@Component({
  selector: 'app-whats-app',
  templateUrl: './whats-app.component.html',
  styleUrls: ['./whats-app.component.scss']
})
export class WhatsAppComponent implements OnInit, OnDestroy {
  status: string = 'online';
  statusOptionsActive: boolean = false;
  totalUser: any;
  UserId: any;
  UserName: any;
  ReceiverId: any;
  filteredObjects: any[] = [];
  CountOfUnreadMessage: any;
  combinedData: any[] = [];

  //One To One
  EmptyList: boolean = true;
  @ViewChild('chatMessagesContainer') private chatMessagesContainer!: ElementRef;
  @ViewChild('SendMessage', { static: true }) yourElement!: ElementRef;
  currentTime: Date = new Date();
  title = 'ClientApp';
  txtMessage: string = '';
  OneToOneChatMessage: any[] = [];
  message = new message();
  ReceivedMessage = '';
  ReceiverName: any;
  OldHistoryMessage: any;
  EmptyChatBool: boolean = false;
  EmptyMessageDate: any;
  StatusTyping: any;
  StatusTypingInfo: any;
  SendMessageCall = 0;
  CheckMessageWrite = '';
  OnceReceiverConnected: boolean = false;
  subscription!: Subscription;
  Emoji = false;
  BasedOnSelection:string='text';
  Image=false;
  ImageSelected64:string='';
  ImageFromDB:any;
  ImageIsAppend=false;
  MessageContainImage:boolean=false;
   MessageStatusType=1;
   ImageTag:any;
   imageSrc: any;
   sellersPermitFile: any;
   sellersPermitString: string='';
   WhatsupConstants:any =[];
   UserStatusEnum:any;
   UserStatusBasedOnUser:string='';
   SearchedString:string = '';
   

  constructor(private renderer: Renderer2, private el: ElementRef, private chatService: ChatService,
    private _ngZone: NgZone,
    private service: CommonService,
    private apiUrl: ApiUrlHelper,
    private route: Router,
    private toast: ToastrService,
    private datePipe: DatePipe,
    private sanitizer: DomSanitizer,
    private spinner: NgxSpinnerService
  ) {
    this.subscribeToEventsInitial();
    this.subscribeToEvents();
    this.getCurrentTime();
  }

  toggleStatusOptions() {
    this.statusOptionsActive = !this.statusOptionsActive;
  }

  scrollToBottom() {
    if (this.chatMessagesContainer) {
      const container = this.chatMessagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }

  ngOnDestroy(): void {
    this.totalUser = 0;
  }

  ngOnInit(): void {
    
    this.WhatsupConstants = WhatsUpConstant;
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
    this.UserStatusEnum=UserStatusEnum

  }

  // Group Of Chat In That Day
  sameDates(startDate: Date, endDate: Date): boolean {
    return this.datePipe.transform(startDate, 'dd-MM') != this.datePipe.transform(endDate, 'dd-MM');
  }

  // Typing Indicator Function
  TypingStatus(message: string) {
    var MessageModel = {
      FromUserId: this.UserId,
      ToUserId: this.ReceiverId
    }
    if (message = '') {
      return;
    }
    else if (message == this.txtMessage) {
      this.chatService.SendStatusOfTyping(MessageModel, false);
    }
    else {
      return;
    }
  }

  // Message Set Function
  MessageSet(event: any, Emoji: boolean) {
    if (Emoji) {
      this.txtMessage += event.emoji.native;
      this.CheckMessageWrite = event.emoji.native;
    }
    else {
      this.txtMessage = event.target.value;
      this.CheckMessageWrite = event.target.value;
    }
    var MessageModel = {
      FromUserId: this.UserId,
      ToUserId: this.ReceiverId
    }
    if (this.txtMessage == '') {
      this.chatService.SendStatusOfTyping(MessageModel, false);
    }
    else {
      this.chatService.SendStatusOfTyping(MessageModel, true);
    }

  }

  // Set user Oflline If Logout
  SetOfflineStatus() {
    this.UserId = localStorage.getItem('UserId');
    this.UserId = Number.parseInt(this.UserId);
    this.chatService.SetUserOffline(this.UserId);
  }

  // User Typing Status Reflector
  SetUserTypinStatus(Status: boolean, event: any) {

    var MessageModel = {
      FromUserId: this.UserId,
      ToUserId: this.ReceiverId
    }
    if (Status) {
      this.MessageSet(event, false)
    }
    else {

      this.chatService.SendStatusOfTyping(MessageModel, Status)
    }
  }

  // Sending Of Message
  sendMessage(): void {
    this.getCurrentTime()
    this.ImageIsAppend=false;
    this.Emoji = false;
    if(this.ImageSelected64!='')
    {
       this.MessageStatusType=2;
    }
    var MessageModel = {  
      FromUserId: this.UserId,
      ToUserId: this.ReceiverId,
      Message: this.convertEmojiToUnicodeEmoji(this.txtMessage) + " " + "imagePortion" +  " " + this.ImageSelected64 ,
      MessageStatus:this.MessageStatusType,
      ImageString:this.ImageSelected64,
      CreatedDate:this.currentTime
    }
    this.chatService.SendMessageToParticularUser(MessageModel);
    this.txtMessage = '';
    this.EmptyList = false;
    this.ImageSelected64='';
    this.MessageStatusType=1;
    this.CheckMessageWrite='';
  }

  UpdateChatHistoryMessage() {
    var MessageModel = {
      FromUserId: this.UserId,
      ToUserId: this.ReceiverId
    }
    this.chatService.SendStatusOfTyping(MessageModel, false);
    this.route.navigate(['/groupchat']);
  }

  // Some Time Fetching As Per Need Functions
  getCurrentTime(): void { this.currentTime = new Date(); }
  formatTime(time: Date): string { return this.datePipe.transform(time, 'mediumTime')!; }
  formatDate(date: Date): string { return this.datePipe.transform(date, 'mediumDate')!; }

  // Method For Fetching All The Users And Their Unread Messages
  private subscribeToEventsInitial(): void {
    this.chatService.UserStatusBasedOnChoice.subscribe((value:string)=>
    {
       this._ngZone.run(()=>
       {
          this.UserStatusBasedOnUser=value;
       })

    })
    this.chatService.UnreadMessageOfUser.subscribe((value) => {
      this._ngZone.run(() => {
        if (typeof value === 'object') {
          this.CountOfUnreadMessage = Object.values(value);
        }
      });
    });
    this.chatService.selectData.pipe(debounceTime(10)).subscribe((value) => {
      this._ngZone.run(() => {
        if (typeof value === 'object') {
          this.totalUser = Object.values(value);
          this.filteredObjects = this.totalUser.filter((obj: { userId: any; }) => obj.userId !== this.UserId);
          this.combinedData = this.filteredObjects.map(user => {
            const unreadMessage = this.CountOfUnreadMessage.find((message: { fromUserId: any; }) => message.fromUserId === user.userId);
            return {
              ...user,
              ...unreadMessage
            };
          });
          console.log(this.combinedData);
        }
      })
    });
  }

  // Fetching Logged In User Data
  private GetUserDataById() {
    const apiUrl = this.apiUrl.apiUrl.Authentication.GetUserById;
    this.service.doPost(apiUrl, this.UserId).pipe().subscribe({
      next: (response) => {
        this.UserName = response.data.userName;
        this.UserStatusBasedOnUser = response.data.userStatus;
        console.log(this.UserStatusBasedOnUser);
        console.log(response);
      }
    })
  }

  // Method For Fetching History Messages , Typing Indicator , One To One Chat Handling
  private subscribeToEvents(): void {
    this.chatService.OldMessageEmiiter.subscribe((Oldmessage: OldHistoryMessageMOdel) => {
      this._ngZone.run(async () => {
        this.OldHistoryMessage = Oldmessage;
        this.spinner.hide();
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
      if (this.StatusTypingInfo.isUserTyping) {
        if (this.StatusTypingInfo.fromUserId == this.ReceiverId || this.StatusTypingInfo.fromUserId.fromUserId == this.UserId) {
          this.StatusTyping = "Typing...";
        }
      }
      else {
        this.StatusTyping = '';
      }
    });
    this.chatService.messageReceivedForOne.subscribe((message: messageModelOneToOne) => {
      if (message.fromUserId == this.ReceiverId || message.fromUserId == this.UserId) {
        this.getCurrentTime();
        this.OneToOneChatMessage.push(message);
        if (this.OneToOneChatMessage.length == 0) {
          this.EmptyList = true;
        }
        else {
          this.EmptyList = false;
        }
      }
    });
    const source = interval(100);
    setTimeout(() => {
      this.subscription = source.subscribe(val => this.TypingStatus(this.CheckMessageWrite));
    }, 1000);
  }

 
  // fetching Receiver Data
  GetReceiverData(item: any) {
    this.OnceReceiverConnected = true;
    this.ReceiverId = item.userId;
    const apiUrl = this.apiUrl.apiUrl.Authentication.GetUserById;
    this.service.doPost(apiUrl, this.ReceiverId).pipe().subscribe({
      next: (response) => {
        this.ReceiverName = response.data.userName;
      }
    })
    var MessageModel = {
      FromUserId: this.UserId,
      ToUserId: this.ReceiverId
    }
    this.OneToOneChatMessage = []; 
    this.OldHistoryMessage = null;
    this.spinner.show();
    this.chatService.GetHistoryMessage(MessageModel);
  }


  //  Adding Of Emoji Picker Code Below 

  // Method For Conversion of Unicode To Emoji And Also Image
   convertUnicodeEmojiToEmoji(inputText: string): string {
    const regex = /&#x([0-9A-Fa-f]+);|\?/g;
  
    if (inputText.includes("imagePortion")) {
      this.MessageContainImage = true;
      const MessageFromDB: string[] = inputText.split("imagePortion");
      this.ImageFromDB = MessageFromDB[1];
      return MessageFromDB[0].replace(regex, (match, hexCode) => {
        if (hexCode) {
          const codePoint = parseInt(hexCode, 16);
          return String.fromCodePoint(codePoint);
        } else if (match === '?') {
          return ''; 
        } else {
          return match; 
        }
      });
    } else {
      return inputText.replace(regex, (match, hexCode) => {
        if (hexCode) {
          const codePoint = parseInt(hexCode, 16);
          return String.fromCodePoint(codePoint);
        } else if (match === '?') {
          return ''; 
        } else {
          return match; 
        }
      });
    }
  }
  
  // Below Method Used To Convert Emoji To Unicode
  convertEmojiToUnicodeEmoji(inputText: string) {
    const regex = /([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2194-\u21AA]|[\u2300-\u27BF]|[\u2B05-\u2B07]|[\u2934\u2935]|[\u25AA\u25AB\u25FE\u25FD]|[\u25FB\u25FC]|[\u25FE]|[\u2600-\u26FF]|[\u2702-\u27B0]|[\u2B06]|[\u2934\u2935]|[\u2B05-\u2B07]|[\u303D]|[\u3297\u3299]|[\u2B05]|[\u2B06]|[\u2B07]|[\u2934]|[\u2935]|[\u25AA]|[\u25AB]|[\u2B05]|[\u2B06]|[\u2B07]|[\u2934]|[\u2935]|[\u303D]|[\u3297]|[\u3299]|[\u2B05-\u2B07]|[\u3297-\u3299]|[\u203C\u2049]|[\u2122\u2139\u2194-\u21AA]|[\u2B05-\u2B07]|[\u2B05-\u2B07]|[\u303D]|[\u3297]|[\u3299])/g;
    return inputText.replace(regex, (match) => {
      if (match.length === 2) {
        const highSurrogate = match.charCodeAt(0);
        const lowSurrogate = match.charCodeAt(1);
        const codePoint = ((highSurrogate - 0xD800) * 0x400) + (lowSurrogate - 0xDC00) + 0x10000;
        return `&#x${codePoint.toString(16)};`;
      } else {
        const codePoint: any = match.codePointAt(0);
        return `&#x${codePoint.toString(16)};`;
      }
    });
  }

  // For Enabling Emoji Board In FrontView
  EmojiEnable()
  {
    this.BasedOnSelection='text';
    this.Emoji=!this.Emoji;
  }


  // Image Functionalities Below 

  // For Enabling Add Image 
  ImageEnable()
  {
    if(this.BasedOnSelection=='text')
    {
      this.BasedOnSelection='file';
    }
    else if(this.BasedOnSelection=='file')
    {
      this.BasedOnSelection='text';
    }
    this.Image=!this.Image;  
  }

  // For handling Image
handleInputChange(files:any) {
  var file = files;
  var pattern = /image-*/ ;
  var reader = new FileReader();
  reader.onloadend = this._handleReaderLoaded.bind(this);
  reader.readAsDataURL(file);
}

_handleReaderLoaded(e:any) {
  let reader = e.target;
  var base64result = reader.result.substr(reader.result.indexOf(',') + 1);
  this.ImageSelected64=  base64result;
  //  this.VideoSrc=base64result;
  this.BasedOnSelection='text';
  this.ImageIsAppend=true;
}

// Conversion Of base64Imagecode To Image
getImageUrl(image:any): SafeResourceUrl {
  if(image=='')
  {
    return false;
  }
  else
  {
    const imageUrl = `data:image/png/gif;base64,${image}`;
    return  this.sanitizer.bypassSecurityTrustResourceUrl(imageUrl);
  }
  }

  // For Image File Selection
  ImageFileSelected(event:any)
  {

    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
        this.sellersPermitFile = file;
        this.handleInputChange(file); //turn into base64
    }
    else {
      alert("No file selected");
    }
  }

  // Updation of user Status
  UpdateStatusOfUserBasedChoice(UserStatus:UserStatusEnum)
  { 
    this.statusOptionsActive = false;
     this.chatService.UpdateStatusOfUserBasedChoice(this.UserId,UserStatus);
  }

  // Search User Functionality
  SearchUser(SearchString:any){
    var SearchedUsername = SearchString.target.value;
    console.log(SearchedUsername);
    this.combinedData = this.combinedData.filter(x=>x.userName==SearchedUsername);
    console.log(this.combinedData);
  }

}
