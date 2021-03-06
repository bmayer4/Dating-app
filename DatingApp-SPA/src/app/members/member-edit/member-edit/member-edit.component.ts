import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/_models/user';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/_services/auth.service';
import { Photo } from 'src/app/_models/photo';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent implements OnInit {
  @ViewChild('editForm') editForm: NgForm;  // allows us to access form, (could have passed it into method)
  user: User;
  photoUrl: string;

  @HostListener('window:beforeunload', ['$event'])  // for closing browser during edit
  unloadNotification($event: any) {
    if (this.editForm.dirty) {
      $event.returnValue = true;
    }
  }

  constructor(private authService: AuthService,
              private userService: UserService,
              private as: AlertifyService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.user = data['user'];
    });
    this.authService.currentPhotoUrl.subscribe(photoUrl => {
      this.photoUrl = photoUrl;  // simply using main from from behavior subject and sub to it
    });
  }

  updateUser() {
    const tokenId = this.authService.decodedToken.nameid;
    this.userService.updateUser(tokenId, this.user).subscribe(next => {
      this.as.success('Profile updated successfully');
      this.editForm.reset(this.user);  // param sets the form (no param clears it out)
    },
    err => this.as.error(err));
  }

  updateMainPhoto(photoUrl: string) {
    // this.user.photoUrl = photoUrl;   not doing this, keeping it for ref
    // console.log('main photo is now: ', photoUrl);
  }

}
