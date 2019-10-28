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
  category: string = '';
  title:string = '';  
  details:string = '';
  value:string = '';
  imageList:Array<string> = new Array<string>();

  constructor(public stateSvc: StateService, private router: Router, private route: ActivatedRoute, private apiService: ApiService, private formBuilder: FormBuilder) 
  { }  

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.getGalleryItemDetails(this.id);    
  }

  getGalleryItemDetails(id) {
    this.apiService.getGalleryItem(id).subscribe(data => {      
      this.blogGalleryItem = data;
      if (this.blogGalleryItem)
      {
          if (this.blogGalleryItem.image && this.blogGalleryItem.image.length > 0)
          {
            if (this.blogGalleryItem.image.toString().indexOf(',') > 0)
            {
                var fileNames = this.blogGalleryItem.image.toString().split(',');
                fileNames.forEach(element => {
                  var fileName = element;
                  if (fileName.length > 0)
                  {
                    this.imageList.push(fileName);
                  }
                 });
             }      
          }
      }
      this.title = data.title;
      this.category = data.category;
      this.image = data.image;
      this.details = data.details;
      this.value = this.details;
    });
  }

  returnToGallery()
  {    
    this.stateSvc.fromGalleryDetails = true;
    this.stateSvc.fromGalleryDetailsCategory = this.category;
    this.router.navigate(['/home']);
  }

}
