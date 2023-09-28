import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { NavigationItem } from './theme/layout/admin/navigation/navigation';
import { NavBarComponent } from './theme/layout/admin/nav-bar/nav-bar.component';
import { NavLeftComponent } from './theme/layout/admin/nav-bar/nav-left/nav-left.component';
import { NavRightComponent } from './theme/layout/admin/nav-bar/nav-right/nav-right.component';
import { NavigationComponent } from './theme/layout/admin/navigation/navigation.component';
import { NavLogoComponent } from './theme/layout/admin/nav-bar/nav-logo/nav-logo.component';
import { NavContentComponent } from './theme/layout/admin/navigation/nav-content/nav-content.component';
import { NavGroupComponent } from './theme/layout/admin/navigation/nav-content/nav-group/nav-group.component';
import { NavCollapseComponent } from './theme/layout/admin/navigation/nav-content/nav-collapse/nav-collapse.component';
import { NavItemComponent } from './theme/layout/admin/navigation/nav-content/nav-item/nav-item.component';
import { SharedModule } from './theme/shared/shared.module';
import { ConfigurationComponent } from './theme/layout/admin/configuration/configuration.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { OneToOneChatComponent } from './demo/ChatBoard/one-to-one-chat/one-to-one-chat.component';
import { ChatService } from './Services/chat-service.service';
import { CommonService } from './Services/common.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WhatsAppComponent } from './ChatDemo/whats-app/whats-app.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiPickerComponent } from "./ChatBoard/emoji-picker/emoji-picker.component";
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { GroupChatComponent } from './demo/ChatBoard/group-chat/group-chat.component';
// import { OneToOneChatComponent } from './demo/ChatBoard/one-to-one-chat/one-to-one-chat.component';

@NgModule({
    declarations: [
        AppComponent,
        AdminComponent,
        NavBarComponent,
        NavLeftComponent,
        NavRightComponent,
        NavigationComponent,
        NavLogoComponent,
        NavContentComponent,
        NavGroupComponent,
        NavItemComponent,
        NavCollapseComponent,
        ConfigurationComponent,
        GuestComponent,
        // GroupChatComponent,
        OneToOneChatComponent,
        WhatsAppComponent
    ],
    providers: [NavigationItem, ChatService, CommonService, DatePipe],
    bootstrap: [AppComponent],
    imports: [BrowserModule, AppRoutingModule, SharedModule, BrowserAnimationsModule, HttpClientModule, ToastrModule.forRoot(), EmojiPickerComponent]
})
export class AppModule {}
