import { ActivatedRoute, Router } from '@angular/router';
import { Component, Inject, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { DOCUMENT } from '@angular/common'; 
import { fileHelper } from '../models/fileHelper';

@Component({
  selector: 'app-blog-content-list',
  templateUrl: './blog-content-list.component.html',
  styleUrls: ['./blog-content-list.component.css']
})

export class BlogContentListComponent implements OnInit {
  allBlogContent: any;
  displayedColumns = ['image', 'title', 'category', 'content', 'edit', 'delete'];  
  dataSource: any;

  constructor(@Inject(DOCUMENT) document, private route: ActivatedRoute, private api: ApiService, private router: Router) 
  {
  }

  ngOnInit() {
    this.api.getAllBlogContent()
      .subscribe(res => {
        console.log(res);
        this.allBlogContent = res;        
        this.dataSource = this.allBlogContent;        
      }, err => {
        console.log(err);
    });
  }
  
  deleteItem(id)
  {
    if(confirm("Are you sure you want to delete this blog content?")) {   
      this.api.getBlogContentDetails(id).subscribe(data => {      
        if (data && data.image && data.image.length > 0)
        {
          var files = fileHelper.getFilesFromImageName(data.image);
          if (files.length > 0)
          {
            this.api.deleteS3Images(files).subscribe(res => {
              console.log(res);
              this.api.deleteBlogContent(id)
                .subscribe(res1 => {
                  console.log(res1);
                  this.router.navigate(['/allBlogContent']);
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
        this.api.deleteBlogContent(id)
          .subscribe(res1 => {
            console.log(res1);
            this.router.navigate(['/allBlogContent']);    
          }, err => {
            console.log(err);
          });   
        }
      });      
    }
  }
}