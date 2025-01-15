// Import necessary Angular modules and RxJS components
import { Injectable } from '@angular/core';
import {
  HttpInterceptor, // Interface for intercepting HTTP requests
  HttpRequest, // Represents an outgoing HTTP request
  HttpHandler, // Allows the request to be passed to the next interceptor or backend
  HttpEvent, // Represents the HTTP response event
} from '@angular/common/http';
import { Observable } from 'rxjs'; // Observable for handling asynchronous operations

// Decorator to make this service injectable across the application
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  /**
   * Intercepts outgoing HTTP requests and modifies them before sending.
   * @param request - The outgoing HTTP request
   * @param next - The HTTP handler that sends the request to the next interceptor or backend
   * @returns An observable of the modified HTTP event
   */
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Clone the request and add the `withCredentials` property to include cookies in cross-origin requests
    const modifiedRequest = request.clone({
      withCredentials: true, // Ensures cookies are included in cross-origin HTTP requests
    });

    // Pass the modified request to the next handler in the chain
    return next.handle(modifiedRequest);
  }
}
