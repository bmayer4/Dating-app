import { Component, OnInit } from '@angular/core';
import { AuthService } from './_services/auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from './_models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  jwtHelper = new JwtHelperService();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
      const token = localStorage.getItem('token');
      // needed this because for nav pic, we only had user data through members components
      // had to send user up from server on login
      const user: User = JSON.parse(localStorage.getItem('user'));
      if (token && user) {
        this.authService.decodedToken = this.jwtHelper.decodeToken(token);
        this.authService.currentUser = user;
        this.authService.changeMemberPhoto(user.photoUrl);
      } else {
        this.authService.logout();
      }
  }

}
