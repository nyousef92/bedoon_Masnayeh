import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { SessionService } from '../../core/service/session.service';

@Component({
  selector: 'app-offers-base',
  imports: [RouterModule, HeaderComponent],
  template: `
    <app-header />
    <nav class="bg-white border-b border-border px-6 flex gap-1">
      <a routerLink="/"
         routerLinkActive="border-b-2 border-primary text-primary font-medium"
         [routerLinkActiveOptions]="{ exact: true }"
         class="px-4 py-3 text-sm text-text-secondary hover:text-primary transition-colors">
        All Offers
      </a>
      @if (session.isLoggedIn()) {
        <a routerLink="/my-offers"
           routerLinkActive="border-b-2 border-primary text-primary font-medium"
           class="px-4 py-3 text-sm text-text-secondary hover:text-primary transition-colors">
          My Offers
        </a>
      }
    </nav>
    <router-outlet></router-outlet>
  `
})
export class OffersBase {

  constructor(
    public session: SessionService,
  ) { }

}
