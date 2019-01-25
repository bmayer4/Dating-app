import { Component, OnInit } from '@angular/core';
import { User } from '../../_models/user';
import { UserService } from '../../_services/user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {
  users: User[];

  constructor(private route: ActivatedRoute, private userService: UserService) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.users = data['users'];
    });
  }

  // removed after adding resolver
  // loadUsers() {
  //   this.userService.getUsers()
  //     .subscribe((users: User[]) => this.users = users,
  //     err => this.as.error(err));   // private as: AlertifyService was injected
  // }

}
