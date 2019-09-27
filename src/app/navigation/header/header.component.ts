import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { StateService } from '../../state.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentUserName:string = '';
  
  constructor(public auth: AuthService, public stateSvc: StateService) {
  }

  ngOnInit() {  
    this.stateSvc.currentUserName$
      .subscribe(
        userName => {
          this.currentUserName = userName;
      });
      if (this.currentUserName == null || this.currentUserName == '')
      {
        this.currentUserName = localStorage.getItem('Item 1');
      }
  }

  @Output() public sidenavToggle = new EventEmitter();  

  public onToggleSidenav = () => {
    this.sidenavToggle.emit();    
  }  

}
