import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { GalleryItem } from '../models/galleryitem';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { StateService } from '../state.service';
import { ModalGalleryCommentComponent } from '../modal/modal-gallerycomment.component';
import { MatDialog } from '@angular/material';
import { GalleryComment } from '../models/gallerycomment';

@Component({
  selector: 'app-blog-gallery-details',
  templateUrl: './blog-gallery-details.component.html',
  styleUrls: ['./blog-gallery-details.component.css']
})

export class BlogGalleryDetailsComponent implements OnInit {
  public blogGalleryItem: GalleryItem;
  public galleryItemComments: Array<GalleryComment> = new Array<GalleryComment>(); 
  public galleryItemComment: GalleryComment;  
  id: string = ''; 
  commentId: string = ''; 
  image: string = '';
  category: string = '';
  title:string = '';  
  details:string = '';
  value:string = '';
  imageList:Array<string> = new Array<string>();
  likes: number = 0;
  dislikes: number = 0;
  dataSource: any;
  displayedColumns: string[] = null;
  loggedInUser: string = '';

  constructor(public stateSvc: StateService, 
    private router: Router, 
    private route: ActivatedRoute, 
    private apiService: ApiService, 
    private formBuilder: FormBuilder,
    public dialog: MatDialog) 
  { }  

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.loggedInUser = localStorage.getItem('Item 1');   
    if (this.loggedInUser == null || this.loggedInUser == '' || this.loggedInUser.indexOf('@') > 0)
    {
      this.loggedInUser = localStorage.getItem('Item 2');
    }
    this.getGalleryItemDetails(this.id);
    this.displayedColumns = ['title', 'author', 'comment', 'createdAt', 'edit', 'delete', '_id'];        
  }

  getGalleryItemDetails(id) {
    this.apiService.getGalleryItem(id).subscribe(data => {      
      this.blogGalleryItem = data;
      if (this.blogGalleryItem)
      {
        this.likes = this.blogGalleryItem.likes;
        this.dislikes = this.blogGalleryItem.dislikes;
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
             else
             {
               this.imageList.push(this.blogGalleryItem.image);
             }    
          }         
      }
      this.title = data.title;
      this.category = data.category;     
      this.details = data.details;
      this.value = this.details; 
      
      this.apiService.getGalleryComments()
      .subscribe(res => {        
        this.galleryItemComments = res; 
        if (this.galleryItemComments && this.galleryItemComments.length > 0)
        {
          this.dataSource = this.galleryItemComments.filter(item => item.galleryItemId === this.id);
            
          this.galleryItemComments.forEach(element => {
            if (element.galleryItemId == id && element.author == this.loggedInUser)
            {
              this.galleryItemComment = element;            
            }
          }); 
        }
      }, (err) => {
       console.log(err);
    });      
    });
  }

  returnToGallery()
  {    
    this.stateSvc.fromGalleryDetails = true;
    this.stateSvc.fromGalleryDetailsCategory = this.category;
    this.router.navigate(['/home']);
  }

  
  openGalleryCommentDialog(): void {
    const dialogRef = this.dialog.open(ModalGalleryCommentComponent, {
      width: '650px', data: { title: '', galleryItemId: this.blogGalleryItem._id},
    });
    
    const sub = dialogRef.componentInstance.onAdd.subscribe(() => {      
    });

    dialogRef.afterClosed().subscribe(() => {
      const unsub = dialogRef.componentInstance.onAdd.unsubscribe(); 

      this.apiService.getGalleryComments()
        .subscribe(res => {        
          this.galleryItemComments = res; 
          if (this.galleryItemComments && this.galleryItemComments.length > 0)
          {
            this.dataSource = this.galleryItemComments.filter(item => item.galleryItemId === this.id);
              
            this.galleryItemComments.forEach(element => {
              if (element.galleryItemId == this.id && element.author == this.loggedInUser)
              {
                this.galleryItemComment = element;            
              }
            }); 
          }
        }, (err) => {
        console.log(err);
      });      
    });
  } 

  editComment(id) {
    const dialogRef = this.dialog.open(ModalGalleryCommentComponent, {
      width: '550px', data: { galleryCommentId: id, galleryItemId: this.id },
    });    

    dialogRef.afterClosed().subscribe(() => {
      const unsub = dialogRef.componentInstance.onAdd.unsubscribe();
      
      this.apiService.getGalleryComments()
        .subscribe(res => {        
          this.galleryItemComments = res; 
          if (this.galleryItemComments && this.galleryItemComments.length > 0)
          {
            this.dataSource = this.galleryItemComments.filter(item => item.galleryItemId === this.id);
              
            this.galleryItemComments.forEach(element => {
              if (element.galleryItemId == this.id && element.author == this.loggedInUser)
              {
                this.galleryItemComment = element;            
              }
            }); 
          }
        }, (err) => {
        console.log(err);
      });      

    });
  }

  deleteComment(commentId) {    
    if(confirm("Are you sure you want to delete this comment?")) {
      this.apiService.deleteGalleryComment(commentId)
        .subscribe(res => {
          this.apiService.getGalleryComments()
            .subscribe(res => {        
              this.galleryItemComments = res; 
              if (this.galleryItemComments && this.galleryItemComments.length > 0)
              {
                this.dataSource = this.galleryItemComments.filter(item => item.galleryItemId === this.id);
                  
                this.galleryItemComments.forEach(element => {
                  if (element.galleryItemId == this.id && element.author == this.loggedInUser)
                  {
                    this.galleryItemComment = element;            
                  }
              }); 
            }
          }, (err) => {
            console.log(err);
        });      
      }, (err) => {
        console.log(err);
      });
    }  
  }

  toggleLikes()
  {
    this.likes += 1;
    this.blogGalleryItem.likes = this.likes;
    this.apiService.updateGalleryItem(this.blogGalleryItem._id, this.blogGalleryItem)
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
    this.blogGalleryItem.dislikes = this.dislikes;
    this.apiService.updateGalleryItem(this.blogGalleryItem._id, this.blogGalleryItem)
        .subscribe(res => {
          console.log('disliked');
        }, (err) => {
          console.log(err);       
      }
    );      
  } 

}
