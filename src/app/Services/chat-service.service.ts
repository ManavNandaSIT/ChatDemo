
import { DebugElement, EventEmitter, Injectable } from '@angular/core';
import { MessageCountModel, OldHistoryMessageMOdel, message, messageModelOneToOne } from '../../Common/message';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { CommonService } from '../Services/common.service';
import { ApiUrlHelper } from '../../Common/apiUrlHelper';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { UserStatusEnum } from '../CommanEnum/StatusEnum';



@Injectable()
export class ChatService {
  messageReceived = new EventEmitter<message>();
  messageTypeStatusEmitter=new EventEmitter<OldHistoryMessageMOdel>();
  messageReceivedForOne = new EventEmitter<messageModelOneToOne>();
  UnreadMessageCount = new EventEmitter<MessageCountModel>();
  OldMessageEmiiter = new EventEmitter<OldHistoryMessageMOdel>();
  connectionEstablished = new EventEmitter<Boolean>();
  ActiveUserList: any
  private data = new BehaviorSubject<any>({});
  LatestMessage: any
  OldMessageHistory: any = [];
  private LastMessage = new BehaviorSubject<any>({});
  private UnreadMessageCountByUser = new BehaviorSubject<any>({})
  private TypingStatus=new BehaviorSubject<any>({});
  LastMessageFromUser = this.LastMessage.asObservable();
  statusOfUserTyping:any;

  TypingMessage=this.TypingStatus.asObservable();
  selectData = this.data.asObservable();
  UnreadMessageOfUser = this.UnreadMessageCountByUser.asObservable();
  Id: any;
  UnreadMessageCountNumber: any;
  UserStatusBasedOnChoice = new EventEmitter<String>();




  private connectionIsEstablished = false;
  private _hubConnection!: HubConnection;

  constructor(private service: CommonService, private api: ApiUrlHelper, private route: Router) {
    this.createConnection();
    this.registerOnServerEvents();
    this.startConnection(false, "");
  }

  sendMessage(message: message) {
    this._hubConnection.invoke('NewMessage', message);
  }
  public createConnection() {
    this.Id = localStorage.getItem("UserId") == null ? 0 : localStorage.getItem("UserId");

    this.Id = Number.parseInt(this.Id);

    this._hubConnection = new HubConnectionBuilder()

      .withUrl(`${environment.ConnectionStringToChat}` + this.Id)

      .build();

  }
  GetMessageCount() {
    this._hubConnection.send('GetUnreadMessageCount', this.Id);
  }

  LiveUserStatus() {
    this._hubConnection.send('LiveUserDetail', localStorage.getItem("UserId"));
  }
  GetUserList(Username:string) {
    this._hubConnection.send('GetALlUserList',Username);
  }

  SendMessageToParticularUser(message: any) {
    this._hubConnection.send('SendMessageToParticularUser', message)
  }

  async GetHistoryMessage(Data: any) {
    if (Data) {
      if (this._hubConnection.state != "Connecting") {
        this._hubConnection.send('GetHistoryMessage', Data);
      }
      else {
        setTimeout(() => {
          this._hubConnection.send('GetHistoryMessage', Data);
        }, 1000);
      }
    }
    else {
      this.SendLoginUserId();
      this.route.navigate(['/whatsapp']);
    }
  }


  SendStatusOfTyping(message:any,status:boolean)
  {
  
    this._hubConnection.send('SendStatusOfTyping',message,status);
  }
  UpdateLiveStatusChat(Data:any)
  {
      this._hubConnection.send('UpdateLiveStatusChat',Data);
  }

  UpdateStatusOfUserBasedChoice(UserId:number,UserStatus:UserStatusEnum)
  {
    this._hubConnection.send('UpdateStatusOfUserBasedChoice',UserId,UserStatus);
  }

  
  SetUserOffline(UserId:any)
  {
      this._hubConnection.send('SetUserOffline',UserId);
  }

  SendLoginUserId() {
    this.Id = localStorage.getItem("UserId") == null ? 0 : localStorage.getItem("UserId");
    this.Id = Number.parseInt(this.Id);

    this._hubConnection.send('GetUserId', this.Id);
  }

  startConnection(fromOneToOne: boolean, Data: any): void {
    this._hubConnection
      .start()
      .then(() => {
        this.connectionIsEstablished = true;
        this.connectionEstablished.emit(true);
        setInterval(() => {
          this.GetUserList('');
          this.GetMessageCount();
        }, 5000);
        // this.GetUserList();   
        // this.GetMessageCount(); 
        // if (fromOneToOne) {

          this.GetHistoryMessage(Data);

        // }
        // else {
        //   this.route.navigate(['GroupChat']);
        // }
      })
      .catch(err => {
        setTimeout(() => { this.startConnection(false, ""); }, 5000);
      });

  }

  registerOnServerEvents(): void {
    this._hubConnection.on('MessageReceived', async (data: any) => {
      this.messageReceived.emit(data);
    });

  
   
    this._hubConnection.on('GetALlUserList', async (data: any) => {
      this.ActiveUserList = data;
      this.data.next(this.ActiveUserList);
    });


    this._hubConnection.on('GetHistoryMessage', async (oldMessage: OldHistoryMessageMOdel) => {
      this.OldMessageHistory = oldMessage;
      this.OldMessageEmiiter.emit(this.OldMessageHistory);

    })
    
    this._hubConnection.on('SendStatusOfTyping', async (Typinstatus: OldHistoryMessageMOdel) => {
     this.statusOfUserTyping=Typinstatus
           this.TypingStatus.next( this.statusOfUserTyping);
           this.messageTypeStatusEmitter.emit( this.statusOfUserTyping);
    })
  
    this._hubConnection.on('UpdateStatusOfUserBasedChoice',async (data:any)=>
    {
       this.UserStatusBasedOnChoice.emit(data);
    });

    this._hubConnection.on('SendMessageToParticularUser', async (LatestMessageFromDB: any) => {
      this.LatestMessage = LatestMessageFromDB;
      this.LastMessage.next(this.LatestMessage);
      this.messageReceivedForOne.emit(this.LatestMessage);
      this.GetMessageCount();
    });


    this._hubConnection.on('GetUnreadMessageCount', async (UnreadMessageCount: MessageCountModel) => {
      this.UnreadMessageCountNumber = UnreadMessageCount;
      this.UnreadMessageCountByUser.next(this.UnreadMessageCountNumber);
    });
  }

}    
