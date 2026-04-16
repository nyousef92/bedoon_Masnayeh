import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { exhaustMap } from 'rxjs/operators';
import { InputFieldComponent } from '../../shared/input-field/input-field.component';
import { HelperService } from '../../core/service/helper.service';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, InputFieldComponent],
  templateUrl: './login.html'
})
export class LoginComponent implements OnInit {

  fb = inject(FormBuilder);
  helper = inject(HelperService);
  auth = inject(AuthService);
  router = inject(Router);
  loginForm!: FormGroup;
  loginClick: Subject<void> = new Subject();

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      emailOrPhone: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.addEventListener();
  }


  addEventListener() {
    this.loginClick.pipe(exhaustMap(() => this.doLogin()))
      .subscribe(resp => {
        const body = this.loginForm.value;
        this.router.navigate([''], { state: { body } })
      });
  }

  getErrorMessage(controlName: string, controlKey: string) {
    if (this.loginForm.get(controlName)?.touched) {
      return this.loginForm.get(controlName)?.invalid ?
        this.helper.getErrorsMessage(this.loginForm, controlName, controlKey)
        : '';
    }
    return '';
  }

  doLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return of(null);
    }
    return this.auth.login(this.loginForm.value);
  }

}
