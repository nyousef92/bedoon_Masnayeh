import { Injectable, signal } from '@angular/core';
import { LocalStorageCacheService } from './local-storage-cache.service';


@Injectable({
  providedIn: 'root'
})
export class SessionService {
  constructor(
    private ls: LocalStorageCacheService
  ) { }

  private refreshToken = signal<string | null>(null);
  readonly refreshToken$ = this.refreshToken.asReadonly();
  setRefreshToken(token: string | null) {
    this.refreshToken.set(token);
  }

  private decodedToken = signal<any>(null);
  readonly decodedToken$ = this.decodedToken.asReadonly();
  setDecodedToken(token: any) {
    this.decodedToken.set(token);
  }

  private token = signal<string | null>(null);
  public token$ = this.token.asReadonly();
  setToken(token: string | null) {
    this.token.set(token);
  }

  isLoggedIn(): boolean {
    const token = this.token$() || this.ls.get<string | null>('accessToken','auth');
    return !!(token);
  }
}
