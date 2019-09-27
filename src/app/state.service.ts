import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class StateService {

// BehaviorSubject to store UserName
private currentUserNameStore = new Subject<any>();

// Make UserName store Observable
public currentUserName$ = this.currentUserNameStore.asObservable();

constructor() { }

 // Setter to update UserName
setCurrentUserName(userName: string) {
    this.currentUserNameStore.next(userName);
  }
}