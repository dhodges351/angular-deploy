import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { GalleryItem } from "../models/galleryitem";
import { MatDialog } from '@angular/material';
import { ModalGalleryComponent } from '../modal/modal-gallery.component';
import { FileUploader } from 'ng2-file-upload';
import { environment } from '../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'underscore';

const URL = environment.apiUrl + '/upload';

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

  constructor(private router: Router, private route: ActivatedRoute, private apiService: ApiService, public dialog: MatDialog) 
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
    let sortedArray = _.sortBy(res, 'title').reverse(); 
    this.galleryItems = sortedArray;         
    this.galleryItems = res.filter(o => o.category == this.selected);
  }

}
