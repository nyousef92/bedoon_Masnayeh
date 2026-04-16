import { Component, signal, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import { SessionService } from '../../core/service/session.service';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  dropdownOpen = signal(false);

  constructor(
    private authService: AuthService,
    private session: SessionService,
    private router: Router
  ) { }


  get userInitials(): string {
    const decoded = this.session.decodedToken$();
    const name: string = decoded?.name || decoded?.email || decoded?.sub || '';
    return name
      .split(' ')
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase() ?? '')
      .join('') || '?';
  }

  routToHome() {
    this.router.navigate(['']);
  }
  routToProfile() {
    this.dropdownOpen.set(false);
    if (this.session.isLoggedIn()) {
      this.router.navigate(['auth/profile']);
    } else {
      this.router.navigate(['auth/login']);
    }
  }

  routToMyOffers() {
    this.dropdownOpen.set(false);
    if (this.session.isLoggedIn()) {
      this.router.navigate(['my-offers']);
    } else {
      this.router.navigate(['auth/login']);
    }
  }
  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.dropdownOpen.update(v => !v);
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  logout(): void {
    this.dropdownOpen.set(false);
    this.authService.logout();
  }
}
