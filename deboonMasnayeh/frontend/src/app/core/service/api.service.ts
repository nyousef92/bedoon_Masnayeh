import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiErrorHandlerService } from './api-error-handler.service';
import { SessionService } from './session.service';
import { ApiResponse } from '../intefaces/api-response';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(
    private http: HttpClient,
    private apiErrorService: ApiErrorHandlerService,
    private session: SessionService
  ) { }

  public get headersValue(): { [key: string]: string } {
    const baseHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    return this.session.token$()
      ? { ...baseHeaders, Authorization: `Bearer ${this.session.token$()}` }
      : baseHeaders;
  }

  public get headers(): HttpHeaders {
    return new HttpHeaders(this.headersValue);
  }


  private handleRequest<T>(request: () => Observable<ApiResponse<T>>) {
    return request().pipe(
      tap((response: ApiResponse<T>) => {
        const isFail = !!response && ((!!response.responseCode && response.responseCode !== 200) || (!!response.status && response.status !== 200))
        if (isFail) {
          this.apiErrorService.handleApiError(response, request);
        }
      }),
      catchError(error => {
        return this.apiErrorService.handleApiError(error, request)
      }),
      map(response => response.data)
    );
  }

  getBlob<T>(url: string, options: any = {}): Observable<any> {
    const httpOptions: any = {
      headers: this.headers,
      observe: 'body',
      ...options
    };
    return this.http.get<ApiResponse<T>>(url, httpOptions);
  }

  get<T>(url: string): Observable<T> {
    return this.handleRequest(() =>
      this.http.get<ApiResponse<T>>(url, { headers: this.headers })
    );
  }

  getRaw<T>(url: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(url, { headers: this.headers }).pipe(
      tap((response) => {
        const isFail = !!response && ((!!response.responseCode && response.responseCode !== 200) || (!!response.status && response.status !== 200));
        if (isFail) {
          this.apiErrorService.handleApiError(response, () => this.getRaw<T>(url));
        }
      }),
      catchError(error => this.apiErrorService.handleApiError(error, () => this.getRaw<T>(url)))
    );
  }

  upload<T>(url: string, formData: FormData): Observable<T> {
    // Do not set Content-Type — browser sets it automatically with the multipart boundary
    const headers = new HttpHeaders(
      this.session.token$() ? { Authorization: `Bearer ${this.session.token$()}` } : {}
    );
    return this.handleRequest(() =>
      this.http.post<ApiResponse<T>>(url, formData, { headers })
    );
  }

  post<T>(url: string, body: any): Observable<T> {
    return this.handleRequest(() =>
      this.http.post<ApiResponse<T>>(url, body, { headers: this.headers })
    );
  }

  put<T>(url: string, body: any = null): Observable<T> {
    return this.handleRequest(() =>
      this.http.put<ApiResponse<T>>(url, body, { headers: this.headers })
    );
  }

  delete<T>(url: string): Observable<T> {
    return this.handleRequest(() =>
      this.http.delete<ApiResponse<T>>(url, { headers: this.headers })
    )
  }
}
