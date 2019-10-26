import { Injectable } from '@angular/core';
import { Observable, of, throwError, Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';
import { catchError, tap, map, filter } from 'rxjs/operators';
import { Contact } from './models/contact.model';
import { environment } from './../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

const httpOptions1 = {
  headers: new HttpHeaders({'enctype': 'multipart/form-data'})
};

const apiUrl = environment.apiUrl;
const blogPostUrl = apiUrl + '/blogposts';
const blogContentUrl = apiUrl + '/blogcontents';
const commentUrl = apiUrl + '/comments';
const galleryUrl = apiUrl + '/gallery';
const uploadUrl = apiUrl + '/upload';

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${JSON.stringify(error.error)} `);
    }
    // return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later.');
  };
  
  private extractData(res: Response) {
    let body = res;
    return body || { };
  }  

  getBlogPosts(): Observable<any> {
    return this.http.get(blogPostUrl, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }
  
  getBlogPost(id: string): Observable<any> {
    const url = `${blogPostUrl}/${id}`;
    return this.http.get(url, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }
  
  postBlogPost(data): Observable<any> {
    return this.http.post(blogPostUrl, data, httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  updateBlogPost(id: string, data): Observable<any> {    
    return this.http.put(blogPostUrl + '/' + id, data, httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  deleteBlogPost(id: string): Observable<{}> {
    const url = `${blogPostUrl}/${id}`;
    return this.http.delete(url, httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  saveContact(contact: Contact): Observable<any>{
    return this.http.post(apiUrl + '/contacts',  
    {
      firstname: contact.firstname,
      lastname: contact.lastname,
      email: contact.email,
      subject: contact.subject,
      message: contact.message
    }, 
    httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  } 

  saveBlogContent(data): Observable<any>{
    return this.http.post(blogContentUrl, data, 
    httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }  

  getAllBlogContent(): Observable<any> {
    return this.http.get(blogContentUrl, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }

  updateBlogContent(id: string, data): Observable<any> {
    return this.http.put(blogContentUrl + '/' + id, data, httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  deleteBlogContent(id: string): Observable<{}> {   
    const url = `${blogContentUrl}/${id}`;
    return this.http.delete(url, httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  getBlogContentDetails(id: string): Observable<any> {   
    const url = `${blogContentUrl}/${id}`;
    return this.http.get(url, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }

  saveComment(data): Observable<any>{
    return this.http.post(commentUrl, data, 
    httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  getCommentDetails(id: string): Observable<any> {   
    const url = `${commentUrl}/${id}`;
    return this.http.get(url, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }

  updateComment(id: string, data): Observable<any> {
    return this.http.put(commentUrl + '/' + id, data, httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  deleteComment(id: string): Observable<{}> {   
    const url = `${commentUrl}/${id}`;
    return this.http.delete(url, httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  getComments(): Observable<any> {
    return this.http.get(commentUrl, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }

  saveGalleryItem(data): Observable<any>{
    return this.http.post(galleryUrl, data, 
    httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  getGalleryItem(id: string): Observable<any> {   
    const url = `${galleryUrl}/${id}`;
    return this.http.get(url, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }

  updateGalleryItem(id: string, data): Observable<any> {
    return this.http.put(galleryUrl + '/' + id, data, httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  deleteGalleryItem(id: string): Observable<{}> {   
    const url = `${galleryUrl}/${id}`;
    return this.http.delete(url, httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  getGalleryItems(): Observable<any> {
    return this.http.get(galleryUrl, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }  

  public upload(files): Observable<any> {  
    const formData: FormData = new FormData(); 
    files.forEach(file => {
      // create a new multipart-form for every file 
      formData.append('file', file, file.name);           
    });   
    return this.http.post(uploadUrl, formData).pipe(
      map(this.extractData),
      catchError(this.handleError)); 
  }
}