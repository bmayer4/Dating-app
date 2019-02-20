import { Component, OnInit } from '@angular/core';
import { Message } from '../_models/message';
import { Pagination, PaginatedResult } from '../_models/pagination';
import { AuthService } from '../_services/auth.service';
import { UserService } from '../_services/user.service';
import { AlertifyService } from '../_services/alertify.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  messages: Message[];
  pagination: Pagination;
  messageContainer = 'Unread';

  constructor(private authService: AuthService,
    private userService: UserService,
    private as: AlertifyService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.messages = data['messages'].result;
      this.pagination = data['messages'].pagination;
    });
  }

  loadMessages() {
    this.userService.getMessages(this.authService.decodedToken.nameid, this.pagination.currentPage,
      this.pagination.itemsPerPage, this.messageContainer)
      .subscribe((res: PaginatedResult<Message[]>) => {
        this.messages = res.result;
        this.pagination = res.pagination;
      },
        err => this.as.error(err));
  }

  deleteMessage(id: number) {
    this.as.confirm('Are you sure you want to delete this message?', () => {
        this.userService.deleteMessage(this.authService.decodedToken.nameid, id).subscribe(() => {
          this.messages = this.messages.filter(m => m.id !== id);
          this.as.success('Message deleted');
      }, err => this.as.error(err));
    });
  }

  pageChanged(event: any): void {
    console.log(event);
    this.pagination.currentPage = event.page;
    this.loadMessages();
  }

}
