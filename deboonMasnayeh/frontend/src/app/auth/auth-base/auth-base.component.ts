import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "../../shared/header/header.component";

@Component({
  selector: 'app-auth-base',
  imports: [RouterOutlet, HeaderComponent],
  template: `<div class="auth-container">
    <app-header />
  <router-outlet></router-outlet>
</div>`,
})
export class AuthBaseComponent {

}
