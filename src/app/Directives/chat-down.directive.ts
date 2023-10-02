import { Directive, Input } from '@angular/core';
import { WhatsAppComponent } from '../ChatDemo/whats-app/whats-app.component';

@Directive({
  selector: '[appChatDown]'
})
export class ChatDownDirective {
  @Input('appChatDown') // Update this to match the selector

  set upgradeComponents(upgrade: boolean) {
    if (upgrade) {
      setTimeout(() => {
        this.component.scrollToBottom();
      }, 0);
    }
  }
  constructor(public component: WhatsAppComponent) { }
}
