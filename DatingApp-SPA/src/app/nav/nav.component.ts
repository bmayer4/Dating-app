import { Component } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { NgForm } from '@angular/forms';
import { AlertifyService } from '../_services/alertify.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  model: any = {};

  // public so we can use it in our template, might be a lint issue
  constructor(public authService: AuthService, private as: AlertifyService, private router: Router) { }

  login(loginForm: NgForm) {
    // console.log(loginForm); dont check if form is valid before sending, then nothing would happen, better to get error back and handle it
      this.authService.login(this.model).subscribe(next => {
        this.as.success('Logged in successfully');
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
