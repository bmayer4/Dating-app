import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';

// root module is proving service
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = environment.apiUrl + 'auth/';
  jwtHelper = new JwtHelperService();
  decodedToken: any;
  currentUser: User;
  photoUrl = new BehaviorSubject<string>('../../assets/user.png');
  currentPhotoUrl = this.photoUrl.asObservable();  // components can subscribe to this now

constructor(private http: HttpClient) { }

changeMemberPhoto(photoUrl: string) {
  this.photoUrl.next(photoUrl);   // changes value of behavior subject and currentPhotoUrl will change too
}

login(model: any) {  // angular uses application/json as default content type in headers (what we send)
  return this.http.post(this.baseUrl + 'login', model)
    .pipe(map((response: any) => {
      if (response) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.decodedToken = this.jwtHelper.decodeToken(response.token);
        this.currentUser = response.user;
        this.changeMemberPhoto(response.user.photoUrl);
        console.log(this.decodedToken);
      }
      // return response;  map doesnt return reponse for you
    }));
}

register(user: User) {
  return this.http.post(this.baseUrl + 'register', user);
}

loggedIn() {
  const token = localStorage.getItem('token');
  return !this.jwtHelper.isTokenExpired(token);
}

logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  this.decodedToken = null;
  this.currentUser = null;
}

}
