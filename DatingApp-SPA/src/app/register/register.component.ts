import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgForm, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { User } from '../_models/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter();
    // model: any = {};
  user: User;
  registerForm: FormGroup;
  // Partial<T> allows us to leave off required fields of class (makes them all optional)
  bsConfig: Partial<BsDatepickerConfig> = { containerClass: 'theme-blue' };

  constructor(private authService: AuthService, private as: AlertifyService, private fb: FormBuilder, private router: Router) { }

  ngOnInit() {
    // confirm password function will be on the fromgroup itself, not the form controls
    // this.registerForm = new FormGroup({
    //   username: new FormControl('', Validators.required),
    //   password: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(10)]),
    //   confirmPassword: new FormControl('', Validators.required)
    // }, this.passwordMatchValidator);
    this.createRegisterForm();  // easier syntax than above
  }

  createRegisterForm() {
    this.registerForm = this.fb.group({
      gender: ['male'],
      username: ['', Validators.required],
      dateOfBirth: [null, Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(10)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    // value from this gets added to errors property on formGroup (each form control has an errors property also)
    return g.get('password').value === g.get('confirmPassword').value ? null : {'mismatch': true};
  }

  // commenting this out after adding reactive forms
  // register(registerForm: NgForm) {
  //     this.authService.register(this.model).subscribe(() => {
  //       this.as.success('registration successful');
  //       // **********not done here..redirect to login!?
  //       registerForm.control.reset();
  //     }, err => {
  //       this.as.error(err);
  //     });
  // }


  register() {
    console.log(this.registerForm);
    if (this.registerForm.valid) {
      this.user = Object.assign({}, this.registerForm.value);  // clones reg form into empty objecy, which is returned into users
      this.authService.register(this.user).subscribe(() => {
        this.as.message('Registration successful');
      }, err => this.as.error(err),
      () => {
        this.authService.login(this.user).subscribe(() => {  // user has username and password in it we need
          this.router.navigate(['/members']);
        }, err => this.as.error(err));
      });
    }
}

  cancel() {
    this.cancelRegister.emit(false);
  }

}
