import { Directive, Input, ViewContainerRef, TemplateRef, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective implements OnInit {
  @Input() appHasRole: string[];

  constructor(private viewContainerRef: ViewContainerRef, private templateRef: TemplateRef<any>, private authService: AuthService) { }

  ngOnInit() {
    const userRoles = this.authService.decodedToken.role as string[];

    // if no roles clear the viewContainerRef
    if (!userRoles) {
      this.viewContainerRef.clear();
    }

    // if user has required role then render element
    if (this.authService.roleMatch(this.appHasRole)) {
        this.viewContainerRef.createEmbeddedView(this.templateRef); // templateRef is element were applying the structural directive to
     } else {
        this.viewContainerRef.clear();
     }

  }

}
