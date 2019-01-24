import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AlertifyService } from '../_services/alertify.service';
import { User } from '../_models/user';
import { UserService } from '../_services/user.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({providedIn: 'root' })
export class MemberDetailResolver implements Resolve<User> {

    constructor(private userService: UserService, private router: Router, private as: AlertifyService) {}

    resolve(route: ActivatedRouteSnapshot): Observable<User> {
        return this.userService.getUser(route.params['id']).pipe(catchError(error => {
            this.as.error('Error retrieving data');
            this.router.navigate(['/members']);
            return of(null);  // returns observable of null
        }));
    }
}
