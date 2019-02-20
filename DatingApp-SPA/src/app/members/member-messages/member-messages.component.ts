import { Component, OnInit, Input } from '@angular/core';
import { Message } from '../../_models/message';
import { AuthService } from 'src/app/_services/auth.service';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements OnInit {
  @Input() recipientId: number;
  messages: Message[];
  newMessage: any = {};

  constructor(public authService: AuthService, private userService: UserService, private as: AlertifyService) { }

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    const currentUserId = this.authService.currentUser.id;
    this.userService.getMessageThread(this.authService.decodedToken.nameid, this.recipientId)
    .pipe(tap(messages => {
      for (const message of messages) {
        if (message.isRead === false && message.recipientId === currentUserId) {
        this.userService.markAsRead(currentUserId, message.id);
        }
      }
    }))
    .subscribe((res: Message[]) => {
      this.messages = res;
    }, err => this.as.error(err));
  }

  sendMessage() {
    this.newMessage.recipientId = this.recipientId;
    this.userService.sendMessage(this.authService.decodedToken.nameid, this.newMessage).subscribe((res: Message) => {
      this.messages.push(res);
      this.newMessage.content = '';  // could have accessed form w viewchild and used reset()
    }, err => this.as.error(err));
  }

}
