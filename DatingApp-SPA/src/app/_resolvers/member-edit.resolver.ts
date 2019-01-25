import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AlertifyService } from '../_services/alertify.service';
import { User } from '../_models/user';
import { UserService } from '../_services/user.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../_services/auth.service';


@Injectable({providedIn: 'root' })
export class MemberEditResolver implements Resolve<User> {

    constructor(private userService: UserService,
        private router: Router,
        private as: AlertifyService,
        private authService: AuthService) {}

    resolve(route: ActivatedRouteSnapshot): Observable<User> {
        return this.userService.getUser(this.authService.decodedToken.nameid).pipe(catchError(error => {
            this.as.error('Error retrieving your data');
            this.router.navigate(['/members']);
            return of(null);
        }));
    }
}
