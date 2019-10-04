import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { GalleryItem } from "../models/galleryitem";
import { MatDialog } from '@angular/material';
import { ModalGalleryComponent } from '../modal/modal-gallery.component';
import { FileUploader } from 'ng2-file-upload';
import { environment } from '../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';

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
  details: string = '';  
  createdAt: any;
  galleryItems: Array<GalleryItem>;
  data:any
  loggedInUser: string = '';

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
      width: '600px', data: { id: _id, title:'', author:'', details:'', image:'' },
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
          this.galleryItems = res;           
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
          this.galleryItems = res; 
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

}
