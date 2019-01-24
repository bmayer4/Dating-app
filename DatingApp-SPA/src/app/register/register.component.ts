import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  model: any = {};
  @Output() cancelRegister = new EventEmitter();

  constructor(private authService: AuthService, private as: AlertifyService) { }

  ngOnInit() {
  }

  register(registerForm: NgForm) {
      this.authService.register(this.model).subscribe(() => {
        this.as.success('registration successful');
        // **********not done here..redirect to login!?
        registerForm.control.reset();
      }, err => {
        this.as.error(err);
      });
  }

  cancel() {
    this.cancelRegister.emit(false);
  }

}
