import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { OneToOneChatComponent } from './demo/ChatBoard/one-to-one-chat/one-to-one-chat.component';
import { GroupChatComponent } from './demo/ChatBoard/group-chat/group-chat.component';
import { WhatsAppComponent } from './ChatDemo/whats-app/whats-app.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: '/guest/login',
        pathMatch: 'full'
      },
      {
        path: 'default',
        loadComponent: () => import('./demo/default/default.component')
      },
      {
        path: 'typography',
        loadComponent: () => import('./demo/elements/typography/typography.component')
      },
      {
        path: 'color',
        loadComponent: () => import('./demo/elements/element-color/element-color.component')
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/sample-page/sample-page.component')
      },{
        path: 'OneToOne/:id',
        component: OneToOneChatComponent
      },{
        path: 'GroupChat',
        component: GroupChatComponent
      },
      {
        path:'WhatsApp',
        component:WhatsAppComponent
      }
      
    ]
  },
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: 'guest',
        loadChildren: () => import('./demo/pages/authentication/authentication.module').then((m) => m.AuthenticationModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
