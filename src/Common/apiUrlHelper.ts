import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiUrlHelper {
  public apiUrl = {
     Authentication:{
      Login:  'UserDetail/IsUserIsValidToLogin',
      SignUp:  'UserDetail/InsertUpdateUserDetail',
      GetAllActiveUser:'UserDetail/GetAllActiveUsers',
      GetUserById: 'UserDetail/GetUserDetailById' ,
      UpdateStatusOnlineOffline:'UserDetail/SetUserOnline'
     }
  };
}
