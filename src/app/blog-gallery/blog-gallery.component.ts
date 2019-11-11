import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { GalleryItem } from "../models/galleryitem";
import { MatDialog } from '@angular/material';
import { ModalGalleryComponent } from '../modal/modal-gallery.component';
import { environment } from '../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'underscore';
import { StateService } from '../state.service';
import { fileHelper } from '../models/fileHelper';

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
  public selected = "Great Britain Postmarks";

  constructor(public stateSvc: StateService, private router: Router, private route: ActivatedRoute, private apiService: ApiService, public dialog: MatDialog) 
  {     
    this.loggedInUser = localStorage.getItem('Item 1');   
    if (this.loggedInUser == null || this.loggedInUser == '' || this.loggedInUser.indexOf('@') > 0)
    {
      this.loggedInUser = localStorage.getItem('Item 2');
    }     
  }  

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
    if(confirm("Are you sure you want to delete this gallery item?")) {
      this.apiService.getGalleryItem(id).subscribe(data => {
        this.galleryItem = data; 
        if (this.galleryItem && this.galleryItem.image && this.galleryItem.image.length > 0)
        {
          var files = fileHelper.getFilesFromImageName(this.galleryItem.image);
          if (files.length > 0)
          {
            this.apiService.deleteS3Images(files)
              .subscribe(res => {
                console.log(res);
                this.apiService.deleteGalleryItem(id)
                  .subscribe(res1 => {
                    console.log(res1);
                    this.ngOnInit();   
                  }, err => {
                    console.log(err);
                });                  
              }, err => {
                console.log(err);
            });
          }          
        }
        else
        {          
          this.apiService.deleteGalleryItem(id)
            .subscribe(res1 => {
              console.log(res1);
              this.ngOnInit();               
            }, err => {
              console.log(err);
          });   
        }
      }); 
    }      
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
                var fileName = fileNames[0];
                element.image = fileName;
            }            
          }
      });      
    }
    this.stateSvc.fromGalleryDetailsCategory = "";   
  }
}