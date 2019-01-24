import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';

// root module is proving service
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = environment.apiUrl + 'auth/';
  jwtHelper = new JwtHelperService();
  decodedToken: any;

constructor(private http: HttpClient) { }

login(model: any) {  // angular uses application/json as default content type in headers (what we send)
  return this.http.post(this.baseUrl + 'login', model)
    .pipe(map((response: any) => {
      if (response) {
        localStorage.setItem('token', response.token);
        this.decodedToken = this.jwtHelper.decodeToken(response.token);
        console.log(this.decodedToken);
      }
      // return response;  map doesnt return reponse for you
    }));
}

register(model: any) {
  return this.http.post(this.baseUrl + 'register', model);
}

loggedIn() {
  const token = localStorage.getItem('token');
  return !this.jwtHelper.isTokenExpired(token);
}

logout() {
  localStorage.removeItem('token');
}

}
