import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiResponse } from '../../Common/CommonModel';


@Injectable({
  providedIn: 'root'
})
export class CommonService {

  //Constructor
  constructor(private http: HttpClient) { }

  
  //For HTTPGET Methods
  doGet(apiUrl: String): Observable<ApiResponse> {
    const url = `${environment.BaseURL}${apiUrl}`;
    return this.http.get<ApiResponse>(url);
  }

  //For HTTPDELETE methods
  doDelete(apiUrl: String, idtoDelete?: number): Observable<ApiResponse> {
    const url = (`${environment.BaseURL}${apiUrl}`);
    return this.http.delete<ApiResponse>(url);                                
  }

  //For HTTPPOST methods
  doPost(apiUrl: string, postData: any): Observable<ApiResponse> {
    const url = `${environment.BaseURL}${apiUrl}`;
    return this.http.post<ApiResponse>(url, postData);
  }

}
