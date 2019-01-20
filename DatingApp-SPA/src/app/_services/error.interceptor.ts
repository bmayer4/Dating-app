import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    // returns observable
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError(error => {
                if (error instanceof HttpErrorResponse) {  // from api (like throwing error in api)
                    if (error.status === 401) {  // 401 like unauthorized login wouldnt meet other checks below (not model state error)
                        return throwError(error.statusText);  // and 401 doesnt have body so not available on error.error below
                    }
                    const applicationError = error.headers.get('Application-Error');
                    if (applicationError) {
                        console.error(applicationError);
                        return throwError(applicationError);
                    }

                    const serverError = error.error;  // .error is body. model state error will be type of object
                    let modelStateErrors = '';
                    // let modelStateErrorsArr = [];  instead of string, this works perfect w 2 errors of same key
                    if (serverError && typeof serverError === 'object') {
                        const keys = Object.keys(serverError);  // better than looping through object directly with for..in loop
                        for (const key of keys) {
                            if (serverError[key]) {
                                modelStateErrors += serverError[key] + '\n';
                                // modelStateErrorsArr = [...modelStateErrorsArr, ...serverError[key]];
                            }
                        }
                    }
                    // if not model state error, other error would be in serverError or string as last attempt
                    return throwError(modelStateErrors || serverError || 'Server Error');
                }
            })
        );
    }
}

export const ErrorInterceptorProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true  // doesn't replace our existing intercepors, just add to this array of them
};
