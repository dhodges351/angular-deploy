import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { StateService } from '../../state.service';

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.css']
})
export class SidenavListComponent implements OnInit {
  @Output() sidenavClose = new EventEmitter();
  currentUserName:string = '';
  isAdmin: boolean = false;

  constructor(public auth: AuthService, public stateSvc: StateService) { 
  }

  ngOnInit() {
    this.stateSvc.currentUserName$
      .subscribe(
        userName => {
          this.currentUserName = userName;
          if (this.currentUserName == 'Bob Hodges' || this.currentUserName == 'Debra Hodges')
          {        
            this.isAdmin = true; 
          }
          else
          {
            this.isAdmin = false;
          }
      });
      if (this.currentUserName == null || this.currentUserName == '')
      {
        this.currentUserName = localStorage.getItem('Item 1');
      }
    
      if (this.currentUserName == 'Bob Hodges' || this.currentUserName == 'Debra Hodges')
      {        
        this.isAdmin = true; 
      }
      else
      {
        this.isAdmin = false;
      }
  }

  public onSidenavClose = () => {
    this.sidenavClose.emit();
  } 
}
