import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, switchMap, catchError } from 'rxjs';
import { LocalStorageCacheService } from './local-storage-cache.service';
import { ToastService } from './toaster.service';

@Injectable({
  providedIn: 'root'
})
export class ApiErrorHandlerService {

  constructor(
    private router: Router,
    private toastService: ToastService,
    private injector: Injector,
    private ls:LocalStorageCacheService
  ) {}

  handleApiError<T>(error: any, retryRequest: () => Observable<T>): Observable<never> | Observable<T> {
    //const authService = this.injector.get(AuthService);

    const status = this.getStatusCode(error);
    const message = this.getErrorMessage(error);
    const errorUrl = error?.url || '';
    const isRefreshRequest = errorUrl.includes('/RefreshToken');

    switch (status) {
      case 400:
        this.toastService.showError(message || 'Bad Request: Please check your input.');
        break;

      case 401:
        if (isRefreshRequest) {
          //authService.logout(true);
          return throwError(() => error);
        }

        // if (this.ls.get<string|null>('accessToken','auth')) {
        //   return authService.refreshAccessToken().pipe(
        //     switchMap(() => retryRequest()),
        //     catchError((refreshErr) => {
        //       authService.logout(true);
        //       return throwError(() => refreshErr);
        //     })
        //   );
        // }
        
        this.toastService.showError(message || 'Unauthorized: Please login again.');
        //authService.logout(true);
        break;

      case 403:
        this.toastService.showError(message || 'Forbidden: You don’t have permission.');
        this.router.navigate(['/unauthorized']);
        break;

      case 404:
        this.toastService.showError(message || 'Resource not found.');
        break;

      case 500:
        this.toastService.showError(message || 'Server Error: Please try again later.');
        break;

      default:
        this.toastService.showError(message || 'An unexpected error occurred.');
        break;
    }

    return throwError(() => error);
  }

  private getStatusCode(error: any): number {
    if (error instanceof HttpErrorResponse) return error.status;
    if (error && 'responseCode' in error) return error.responseCode;
    if (error && 'status' in error) return error.status;
    return 0;
  }

  private getErrorMessage(error: any): string {
    if (error instanceof HttpErrorResponse) return error.error?.message || error.message || '';
    if (error && 'detailMessage' in error) return error.detailMessage;
    return '';
  }
}