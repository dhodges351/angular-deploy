import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { GalleryItem } from '../models/galleryitem';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { StateService } from '../state.service';

@Component({
  selector: 'app-blog-gallery-details',
  templateUrl: './blog-gallery-details.component.html',
  styleUrls: ['./blog-gallery-details.component.css']
})

export class BlogGalleryDetailsComponent implements OnInit {
  public blogGalleryItem: GalleryItem;   
  id: string = '';  
  image: string = '';
  title:string = '';  
  details:string = '';
  value:string = '';

  constructor(public stateSvc: StateService, private router: Router, private route: ActivatedRoute, private apiService: ApiService, private formBuilder: FormBuilder) 
  { }  

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.getGalleryItemDetails(this.id);    
  }

  getGalleryItemDetails(id) {
    this.apiService.getGalleryItem(id).subscribe(data => {      
      this.blogGalleryItem = data;
      this.title = data.title;
      this.image = data.image;
      this.details = data.details;
      this.value = this.details;
    });
  }

  returnToGallery()
  {
    this.stateSvc.fromGalleryDetails = true;
    this.router.navigate(['/home']);
  }

}
