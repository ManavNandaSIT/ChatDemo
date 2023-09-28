import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthenticationRoutingModule } from './authentication-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import LoginComponent from './login/login.component';
import RegisterComponent from './register/register.component';

import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [LoginComponent, RegisterComponent],
  imports: [AuthenticationRoutingModule,CommonModule,FormsModule,ReactiveFormsModule, ToastrModule.forRoot()]
})
export class AuthenticationModule {}
