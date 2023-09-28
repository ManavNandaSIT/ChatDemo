import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { CommonService } from 'src/app/Services/common.service';
import { ApiUrlHelper } from 'src/Common/apiUrlHelper';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export default class RegisterComponent implements OnInit {
  constructor(private route:Router , private  service: CommonService , private apiUrl:ApiUrlHelper , private toast:ToastrService){}

  SignUpForm:any;
  SignUpResponse:any;
  ngOnInit(): void {
    this.SignUpForm = new FormGroup({
      FirstName: new FormControl('' , [Validators.required]),
      LastName :new FormControl('' , [Validators.required]) ,
      UserName: new FormControl('' , [Validators.required]),  
      EmailId :new FormControl('' , [Validators.required , Validators.email]), 
      Password: new FormControl('' , [Validators.required , Validators.pattern('(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$"')])
    })
  }

  SignUpUser(){
    var SignUpModel = {
      FirstName : this.SignUpForm.value.FirstName,
      LastName: this.SignUpForm.value.LastName,
      UserName: this.SignUpForm.value.UserName,
      UserAge: 0,
      UserEmail: this.SignUpForm.value.EmailId,
      UserPassword: this.SignUpForm.value.Password
    }
    
    const apiUrl = this.apiUrl.apiUrl.Authentication.SignUp;
    this.service.doPost(apiUrl , SignUpModel).pipe().subscribe({
      next: (response)=>{
        this.SignUpResponse = response;
        if(this.SignUpResponse.success){
          this.toast.success(this.SignUpResponse.message);
          this.route.navigate(['/guest/login']);
        }
        else{
          this.toast.error(this.SignUpResponse.message);
        }
      }
    })
  }
}
