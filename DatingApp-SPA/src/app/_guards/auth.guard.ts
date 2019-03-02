import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router, private as: AlertifyService) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // because auth guard is protecting child routes
    const roles = route.firstChild.data['roles'] as string[];  // allowed roles
    if (roles) {   // since data property would only be in admin route (and youd be logged in to get decoded token in roleMatch)
      const match = this.authService.roleMatch(roles);
      if (match) {
        return true;
      } else {
        this.router.navigate(['members']);
        this.as.error('Not authorized!');
        return false;
      }
    }

    if (this.authService.loggedIn()) {
      console.log('still called!');
      return true;
    }

    this.router.navigate(['/home']);
    return false;
  }

}
