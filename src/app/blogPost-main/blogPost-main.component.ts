import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../api.service';
import { Blogpost } from "../models/blogpost";
import { MatDialog } from '@angular/material';
import { ModalComponent } from '../modal/modal.component';
import { BlogContent } from '../models/blogcontent';
import { Router, ActivatedRoute } from '@angular/router';
import { BlogPostListComponent } from '../blogPost-list/blogPost-list.component';
import { HomeComponent } from '../home/home.component';
import * as _ from 'underscore';
import { StateService } from '../state.service';

@Component({
  selector: 'app-blogPost-main',
  templateUrl: './blogPost-main.component.html',
  styleUrls: ['./blogPost-main.component.css']
})

export class BlogPostMainComponent implements OnInit {
  blogContent: BlogContent;
  id: string = '';
  title: string = '';
  image: string = '';
  category: string = '';
  content: string = '';
  createdAt: any;
  blogs: Array<Blogpost>;
  filteredBlogs: Array<Blogpost>;
  error: {};
  value:string = '';
  isShown: boolean = true;
  imageList:Array<string> = new Array<string>();
  likes: number = 0;
  dislikes: number = 0;  

  constructor(public stateSvc: StateService, router: Router, private route: ActivatedRoute, private apiService: ApiService, public dialog: MatDialog) 
  {
  }  

  openDialog(): void {
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '650px', data: { title: '' },
    });
    
    const sub = dialogRef.componentInstance.onAdd.subscribe(() => {      
    });

    dialogRef.afterClosed().subscribe(() => {
      const unsub = dialogRef.componentInstance.onAdd.unsubscribe(); 
      HomeComponent.homeApp.selectedIndex = 1;    
      BlogPostListComponent.blogPostListApp.ngOnInit();         
    });
  }

  ngOnInit() {
    this.apiService.getAllBlogContent()
      .subscribe(res => {
        console.log(res); 
        if (res)
        {
          let sortedArray = _.sortBy(res, 'createdAt').reverse(); 
          this.blogs = sortedArray;          
          this.blogContent = res.filter(o => o.currentBlog == true);
          this.blogContent = this.blogContent[0];
          this.title = this.blogContent.title;
          this.image = this.blogContent.image;
          this.category = this.blogContent.category;
          this.content = this.blogContent.content;
          this.value = this.content;
          this.createdAt = this.blogContent.createdAt;
          this.likes = this.blogContent.likes;
          this.dislikes = this.blogContent.dislikes;
          this.id = this.blogContent._id;
          
          this.imageList = new Array<string>();
          if (this.image && this.image.length > 0)
          {
            if (this.image.toString().indexOf(',') > 0)
            {
              var fileNames = this.image.toString().split(',');
              fileNames.forEach(element => {  
                if (element != ' ')
                {
                  this.imageList.push(element);            
                }   
              });
            }
            else
            {
              this.imageList.push(this.image);
            }
            this.isShown = true; 
          }

          if (this.image == null || this.image == '' || this.imageList.length == 0)
          {
            this.isShown = false;
          }          
          if (this.stateSvc.fromGalleryDetails)
          {
            HomeComponent.homeApp.selectedIndex = 2;
          }          
        }       
      }, err => {
        console.log(err);
    });     
  }  

  setCurrentBlog(id)
  {   
    this.apiService.getBlogContentDetails(id).subscribe(data => {
      this.blogContent = data;
      this.title = data.title;
      this.image = data.image;
      this.category = data.category;
      this.content = data.content;
      this.value = this.content;
      this.createdAt = data.createdAt;
      this.likes = data.likes;
      this.dislikes = data.dislikes;
      this.id = data._id;

      this.imageList = new Array<string>();
      if (this.image && this.image.length > 0)
      {
        if (this.image.toString().indexOf(',') > 0)
        {
          var fileNames = this.image.toString().split(',');
          fileNames.forEach(element => {  
            if (element != ' ')
            {
              this.imageList.push(element);            
            }   
          });
        }
        else
        {
          this.imageList.push(this.image);
        }
        this.isShown = true; 
      }

      if (this.image == null || this.image == '')
      {
        this.isShown = false;
      }          
    });
  }

  toggleLikes()
  {
    this.likes += 1;
    this.blogContent.likes = this.likes;
    this.apiService.updateBlogContent(this.blogContent._id, this.blogContent)
        .subscribe(res => {
          console.log('liked');
        }, (err) => {
          console.log(err);       
      }
    );       
  }

  toggleDislikes()
  {    
    this.dislikes += 1;
    this.blogContent.dislikes = this.dislikes;
    this.apiService.updateBlogContent(this.blogContent._id, this.blogContent)
        .subscribe(res => {
          console.log('disliked');
        }, (err) => {
          console.log(err);       
      }
    );      
  }
}