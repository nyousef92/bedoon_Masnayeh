import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { LocalStorageCacheService } from './local-storage-cache.service';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import { SessionService } from './session.service';
import { environment } from '../../../environments/environment';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authUrl = environment.authUrl;
  private tokenExpirationTimer: any;
  private refreshInProgress$: Observable<any> | null = null;
  constructor(
    private session: SessionService,
    private apiService: ApiService,
    private ls: LocalStorageCacheService,
    private router: Router
  ) {
    this.restoreTokensFromStorage();
  }

  get refreshToken(): string | null {
    return this.session.refreshToken$();
  }

  private restoreTokensFromStorage(): void {
    try {
      const storedToken = this.ls.get<string | null>('accessToken', 'auth');
      const storedRefreshToken = this.ls.get<string | null>('refreshToken', 'auth');

      if (storedToken) {
        this.session.setToken(storedToken);
        const decoded = this.decodeToken(storedToken);
        if (decoded) {
          this.session.setDecodedToken(decoded);
          const expiresIn = decoded.exp * 1000 - Date.now();
          if (expiresIn > 0) {
            this.setTokenExpirationTimer(expiresIn);
          }
        }
      }

      if (storedRefreshToken) {
        this.session.setRefreshToken(storedRefreshToken);
      }
    } catch (e) {
      console.error("Error restoring session", e);
    }
  }


  private setTokenExpirationTimer(expiresIn: number): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    const refreshBuffer = 300000;
    const timeout = expiresIn - refreshBuffer;

    if (timeout > 0) {
      this.tokenExpirationTimer = setTimeout(() => {
        this.refreshAccessToken().subscribe();
      }, timeout);
    }
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  private handleTokenResponse(response: TokenResponse): void {
    const { accessToken, refreshToken } = response;
    this.session.setToken(accessToken);
    this.session.setRefreshToken(refreshToken);
    this.ls.set('accessToken', accessToken, 'auth');
    this.ls.set('refreshToken', refreshToken, 'auth');
    let decoded = this.decodeToken(accessToken);
    if (decoded?.exp) {
      const expiresIn = decoded.exp * 1000 - Date.now();
      this.setTokenExpirationTimer(expiresIn);
      this.session.setDecodedToken(decoded);
    }
  }

  login(loginPayload: any): Observable<TokenResponse | string> {
    const request = this.apiService.post<TokenResponse>(
      `${this.authUrl}/auth`,
      loginPayload
    );

    return request.pipe(
      tap((response: any) => {
        console.log(response);
        
        this.handleTokenResponse(response)}
      ),
      catchError((e) => {
        console.error(e);
        this.logout();
        return throwError(() => 'logout');
      })
    );
  }

  refreshAccessToken(): Observable<any> {
    if (this.refreshInProgress$) {
      return this.refreshInProgress$;
    }

    if (!this.refreshToken) {
      return throwError(() => 'No refresh token');
    }

    this.refreshInProgress$ = this.apiService.post<TokenResponse>(
      `${this.authUrl}/RefreshToken`,
      { refreshToken: this.refreshToken }
    ).pipe(
      tap((response: any) => {
        this.handleTokenResponse(response);
        this.refreshInProgress$ = null;
      }),
      catchError((err) => {
        this.refreshInProgress$ = null;
        return throwError(() => err);
      })
    );

    return this.refreshInProgress$;
  }


  logout() {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }

    this.session.setToken(null);
    this.session.setRefreshToken(null);
    this.session.setDecodedToken(null);
    this.ls.remove('accessToken', 'auth');
    this.ls.remove('refreshToken', 'auth');
    this.router.navigate(['/']);
  }

  isPageAllowed(pageName: string) {
    return true;
  }
}
