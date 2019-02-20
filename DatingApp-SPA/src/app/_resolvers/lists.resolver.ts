import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AlertifyService } from '../_services/alertify.service';
import { User } from '../_models/user';
import { UserService } from '../_services/user.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PaginatedResult } from '../_models/pagination';


@Injectable({providedIn: 'root' })
export class ListsResolver implements Resolve<PaginatedResult<User[]>> {
    pageNumber = 1;
    pageSize = 5;
    likesParams = 'likers';

    constructor(private userService: UserService, private router: Router, private as: AlertifyService) {}

    resolve(route: ActivatedRouteSnapshot): Observable<PaginatedResult<User[]>> {
        return this.userService.getUsers(this.pageNumber, this.pageSize, null, this.likesParams).pipe(catchError(error => {
            this.as.error('Error retrieving data');
            this.router.navigate(['/']);
            return of(null);
        }));
    }
}