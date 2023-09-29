export class message {
        clientuniqueid: any
        type: any
        message: any
        date: any
}


export class messageModelOneToOne {
        fromUserId: any
        toUserId: any
        Message: any
        messageStatus: any
        imageString: any
        createdDate: any
}



export class OldHistoryMessageMOdel {
        ChatId: any
        FromUserId: any
        ToUserId: any
        MessageType: any
        Message: any
        StatusOfMessage: any
        HubCenter: any
        ViewedOn: any
        CreatedDate: any
        FromUserName: any
        MessageStatus: any
        UserName: any
        IsUserTyping: any
}


export class MessageCountModel {
        NoOfUnreadMessages: any
        FromUserId: any
}