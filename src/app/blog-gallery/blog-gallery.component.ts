import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { GalleryItem } from "../models/galleryitem";
import { MatDialog } from '@angular/material';
import { ModalGalleryComponent } from '../modal/modal-gallery.component';
import { FileUploader } from 'ng2-file-upload';
import { environment } from '../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'underscore';
import { StateService } from '../state.service';

const URL = environment.apiUrl + '/upload';
declare var TextDecoder;

@Component({
  selector: 'app-blog-gallery',
  templateUrl: './blog-gallery.component.html',
  styleUrls: ['./blog-gallery.component.css']
})

export class BlogGalleryComponent implements OnInit {
  galleryItem: GalleryItem;
  id: string = '';
  title: string = '';
  author: string = '';
  image: string = '';
  category: string = '';
  details: string = '';  
  createdAt: any;
  galleryItems: Array<GalleryItem>;
  data:any
  loggedInUser: string = '';
  public selectedIndex = 0;
  public selected = "General";

  constructor(public stateSvc: StateService, private router: Router, private route: ActivatedRoute, private apiService: ApiService, public dialog: MatDialog) 
  {     
    this.loggedInUser = localStorage.getItem('Item 1');   
    if (this.loggedInUser == null || this.loggedInUser == '' || this.loggedInUser.indexOf('@') > 0)
    {
      this.loggedInUser = localStorage.getItem('Item 2');
    }     
  }

  public uploader: FileUploader = new FileUploader({ url: URL, itemAlias: 'photo' });

  openDialog(_id): void {
    const dialogRef = this.dialog.open(ModalGalleryComponent, {     
      width: '700px', data: { id: _id, title:'', category: '', author:'', details:'', image:'' },
    });
    
    const sub = dialogRef.componentInstance.onAdd.subscribe(() => { 
    });   

    dialogRef.afterClosed().subscribe(result => {   
      const unsub = dialogRef.componentInstance.onAdd.unsubscribe();    
      this.apiService.getGalleryItems()
      .subscribe(res => {
        console.log(res); 
        if (res)
        {           
          this.processGalleryItems(res);        
        }       
        }, err => {
          console.log(err);
      }); 
    });
  }

  ngOnInit() { 
    this.apiService.getGalleryItems()
      .subscribe(res => {
        console.log(res); 
        if (res)
        {   
          this.processGalleryItems(res);
        }       
      }, err => {
        console.log(err);
    });
  } 


  deleteItem(id)
  {
    this.apiService.deleteGalleryItem(id)
    .subscribe(res => {
      this.ngOnInit();   
      }, (err) => {
        console.log(err);
      }
    );
  }

  editItem(id)
  {    
    this.openDialog(id);
  }

  onChange() {
    console.log(this.selected);
    this.apiService.getGalleryItems()
      .subscribe(res => {
        console.log(res); 
        if (res)
        {           
          this.processGalleryItems(res);
        }       
      }, err => {
        console.log(err);
    });    
  }

  processGalleryItems(res)
  {    
    if (this.stateSvc.fromGalleryDetailsCategory != "")
    {
      this.selected = this.stateSvc.fromGalleryDetailsCategory;
    }          
    this.galleryItems = res.filter(o => o.category == this.selected); 
    if (this.galleryItems && this.galleryItems.length > 0)
    {
      let sortedArray = _.sortBy(this.galleryItems, 'title'); 
      this.galleryItems = sortedArray;

      this.galleryItems.forEach(element => {
        if (element.image && element.image.length > 0)
        {
            if (element.image.toString().indexOf(',') > 0)
            {
                var fileNames = element.image.toString().split(',');
                var fileName = fileNames[0].replace(' ','');
                element.image = 'https://gourmet-philatelist-assets.s3.amazonaws.com/folder/' + fileName;
            }
          }
      });      
    }
    this.stateSvc.fromGalleryDetailsCategory = "";   
  }
}