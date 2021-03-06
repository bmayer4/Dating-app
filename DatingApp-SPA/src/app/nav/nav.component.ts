import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { NgForm } from '@angular/forms';
import { AlertifyService } from '../_services/alertify.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model: any = {};
  photoUrl: string;
  isCollapsed = true;

  // public so we can use it in our template, might be a lint issue
  constructor(public authService: AuthService, private as: AlertifyService, private router: Router) { }

  ngOnInit() {
    this.authService.currentPhotoUrl.subscribe(photoUrl => {
      this.photoUrl = photoUrl;    // simply using main from from behavior subject and sub to it
    });
  }

  login(loginForm: NgForm) {
    // console.log(loginForm); dont check if form is valid before sending, then nothing would happen, better to get error back and handle it
      this.authService.login(this.model).subscribe(next => {
        this.as.success('Logged in successfully');
        loginForm.control.reset();
      }, err => {
        this.as.error(err);
      }, () => {
        this.router.navigate(['/members']);  // could have put this in next option
      });
  }

  logout() {
    this.authService.logout();
    this.as.message('logged out');
    this.router.navigate(['/home']);
  }

  loggedIn() {
    return this.authService.loggedIn();
  }

}
