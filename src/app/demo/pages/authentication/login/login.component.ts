import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CommonService } from 'src/app/Services/common.service';
import { ApiUrlHelper } from 'src/Common/apiUrlHelper';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export default class LoginComponent implements OnInit {

  LoginForm:any;
  LoginResponse:any;
  showPassword: boolean = false;

  constructor(private route:Router , private service:CommonService , private apiHelper:ApiUrlHelper , private toast:ToastrService ){
  }
  ngOnInit(): void {
    this.LoginForm = new FormGroup({
      UserEmail: new FormControl('' , [Validators.required, Validators.email , Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
      UserPassword: new FormControl('' , [Validators.required ])
    })
  }

    // Get Method For Apply Validations
    get LoginValidations(){
      return this.LoginForm.controls;
   }
 
   // Checking If User Added Correct Values
   submitted=false;
   UserValidCheck(){
     this.submitted = true;
     if(this.LoginForm.valid){
       this.LoginUser();
     }
   }

  LoginUser(){
    if(this.LoginForm){

      var LoginModel ={
        UserEmail: this.LoginForm.value.UserEmail,
        Password: this.LoginForm.value.UserPassword
      }

      const apiUrl = this.apiHelper.apiUrl.Authentication.Login;
      const apiUrltoSetOfflineOnline=this.apiHelper.apiUrl.Authentication.UpdateStatusOnlineOffline;
      this.service.doPost(apiUrl , LoginModel).pipe().subscribe({
        next: (response)=>{
          this.LoginResponse = response;
          console.log(this.LoginResponse);
          if(this.LoginResponse.success){
          
            localStorage.setItem('UserId' , this.LoginResponse.data);
            localStorage.setItem('UserEmail',LoginModel.UserEmail);
            this.toast.success(this.LoginResponse.message);
            this.service.doPost(apiUrltoSetOfflineOnline,this.LoginResponse.data).pipe().subscribe({
              next:(response)=>
              {
                if(response.success)
                {
                  this.route.navigate(['/default']);
                }
              }
             
            })
         
          }
          else{
            this.toast.error(this.LoginResponse.message);
 
          }
        }
      })

    }
   
  }
}
