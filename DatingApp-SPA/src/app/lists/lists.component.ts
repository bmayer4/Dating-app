import { Component, OnInit } from '@angular/core';
import { User } from '../_models/user';
import { Pagination, PaginatedResult } from '../_models/pagination';
import { AuthService } from '../_services/auth.service';
import { UserService } from '../_services/user.service';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from '../_services/alertify.service';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css']
})
export class ListsComponent implements OnInit {

  users: User[];
  pagination: Pagination;
  likesParams = 'likers';

  constructor(private authService: AuthService,
              private userService: UserService,
              private as: AlertifyService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.users = data['users'].result;
      this.pagination = data['users'].pagination;
    });
    this.loadUsers();
  }

  pageChanged(event: any): void {
    console.log(event);
    this.pagination.currentPage = event.page;
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers(this.pagination.currentPage, this.pagination.itemsPerPage, null, this.likesParams)
      .subscribe((res: PaginatedResult<User[]>)  => {
        this.users = res.result;
        this.pagination = res.pagination;
      },
      err => this.as.error(err));
  }

  changeLikes(likeType: string) {
    this.likesParams = likeType;
    this.loadUsers();
  }

}
