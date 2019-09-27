import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit {
  profileJson: string = null;
  userName: string = '';
  userEmail: string = '';  
  
  constructor(public auth: AuthService, private router: Router) 
  {    
  } 

  ngOnInit() 
  { 
    this.auth.userProfile$.subscribe(
      profile => this.profileJson = JSON.stringify(profile, null, 2)
    );
    
    var jObj = JSON.parse(this.profileJson);
    if (jObj)
    {
      this.userName = jObj.name;
      this.userEmail = jObj.email;
    }    
  }   
}
