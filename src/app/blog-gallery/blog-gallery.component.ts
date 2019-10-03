import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { GalleryItem } from "../models/galleryitem";
import { MatDialog } from '@angular/material';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-blog-gallery',
  templateUrl: './blog-gallery.component.html',
  styleUrls: ['./blog-gallery.component.css']
})
export class BlogGalleryComponent implements OnInit {
  galleryItem: GalleryItem;
  title: string = '';
  author: string = '';
  image: string = '';
  details: string = '';  
  createdAt: any;
  galleryItems: Array<GalleryItem>;

  // products = [
  //   { name: "Product A", description: "some description", picture: { uri: 'https://dummyimage.com/600x150/000/fff' } },
  //   { name: "Product B", description: "some description", picture: { uri: 'https://dummyimage.com/300x300/000/fff' } },
  //   { name: "Product C", description: "some description", picture: { uri: 'https://dummyimage.com/300x400/000/fff' } },
  //   { name: "Product D", description: "some description", picture: { uri: 'https://dummyimage.com/600x500/000/fff' } }]
  

  constructor(private apiService: ApiService, public dialog: MatDialog) 
  {     
  }

  ngOnInit() {
    // this.galleryItem = new GalleryItem();
    // this.galleryItem.title = "N048.5I NCH Perfin 1870";
    // this.galleryItem.author = "Bob Hodges";
    // this.galleryItem.image = "assets/images/N048.5I NCH Perfin 1870.jpg";
    // this.galleryItem.details = "Another very fine stamp.";

    // this.apiService.saveGalleryItem(this.galleryItem)
    //   .subscribe(res => {            
    //   }, (err) => {
    //   console.log(err);
    // });

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

 
  addGalleryItem() {
    this.galleryItems.push({ title: Math.random().toString(36).substring(7), details: Math.random().toString(36).substring(50), author: 'Bob Hodges', image: { uri: 'assets/images/greenguy.jpg' } });
  }

}
