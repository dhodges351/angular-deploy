import { Component, OnInit, ViewChild, ElementRef, } from '@angular/core';
import { ApiService } from '../api.service';
import { Blogpost } from "../models/blogpost";
import { Comment } from '../models/comment';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { FileUploader } from 'ng2-file-upload';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ModalCommentComponent } from '../modal/modal-comment.component';
import { ModalComponent } from '../modal/modal.component';
import { DOCUMENT } from '@angular/common';
import { AuthService } from 'src/app/auth/auth.service';
import * as _ from 'lodash';
const URL = '/upload';

@Component({
  selector: 'app-blogPost-list',
  templateUrl: './blogPost-list.component.html',
  styleUrls: ['./blogPost-list.component.css']
})

export class BlogPostListComponent implements OnInit {
  blogPostForm: FormGroup;
  id: string = '';
  image: string = '';
  title: string = '';
  short_desc: string = '';
  author: string = '';
  createdAt: any = '';
  updatedAt: any = '';
  matcher: string = '';
  @ViewChild('sectionToScrollTo', {static: true}) sectionToScrollTo: ElementRef;
  public static blogPostListApp;
  blogPosts: Array<Blogpost>;
  blogPost: Blogpost;
  loggedInUser: string = '';
  imagePathAndFilename: string = '';
  uploadOnly: boolean = false;
  public uploader: FileUploader = new FileUploader({ url: URL, itemAlias: 'photo' });
  commentsOpen: boolean = false;
  detailsEditOpen: boolean = false;
  listOpen: boolean = true;
  comments: Array<Comment>;
  comment: Comment;
  displayedColumns: string[] = null;
  displayedPostColumns: string[] = null;
  dataSource: any;
  dataSource1: any;
  startSet:number = 0;
  endSet:number = 5; 
  profileJson: string = '';  

  constructor(private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,    
    public snackBar: MatSnackBar,
    private auth: AuthService
  ) 
  {
    BlogPostListComponent.blogPostListApp = this;
  }

  public ngOnInit() {
    this.loggedInUser = localStorage.getItem('Item 1');
    this.displayedPostColumns = ['image', 'title', 'category', 'author', 'createdAt', 'edit'];

    //this.getBlogPost(this.id);
    this.blogPostForm = this.formBuilder.group({
      'image': ['', !Validators.required],
      'title': ['', Validators.required],
      'category': ['', Validators.required],
      'short_desc': ['', Validators.required],
      'author': ['', Validators.required],
    });

    // this.blogPosts = this.blogPostListJson;
    // this.dataSource = this.blogPosts; 

    this.api.getBlogPosts()
      .subscribe(res => {
        console.log(res);
        this.blogPosts = res;  

        this.blogPosts = this.blogPosts.slice(this.startSet, this.endSet);     
        this.dataSource = this.blogPosts;     
      }, err => {
        console.log(err);
      });

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };    

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      console.log('ImageUpload:uploaded:', item, status, response);
      this.imagePathAndFilename = 'assets/images/' + item._file.name;
      this.blogPost = this.blogPostForm.getRawValue();
      this.blogPostForm.setValue({
        image: this.imagePathAndFilename,
        title: this.blogPost.title,
        category: this.blogPost.category,
        author: this.blogPost.author,
        short_desc: this.blogPost.short_desc,
      });
    };  
  }

  scrollToTop() {    
    var element = document.getElementById("mainUL");
    element.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
    return false;
  }

  deleteItem(id) {
    this.api.deleteBlogPost(id)
      .subscribe(res => {
        this.openSnackBar('Blog post deleted!', '');
        this.api.getBlogPosts()
          .subscribe(res => {
            console.log(res);
            this.blogPosts = res;
            this.dataSource = this.blogPosts;           
          }, err => {
            console.log(err);
          });
        this.swapWhatIsOpen('list');
      }, (err) => {
        console.log(err);
      }
      );
  }

  getBlogPost(id) {
    this.api.getBlogPost(id).subscribe(data => {
      this.id = data._id;
      this.blogPostForm.setValue({
        image: data.image,
        title: data.title,
        category: data.category,
        short_desc: data.short_desc,
        author: data.author,
      });
    });
  }

  saveForm(form: NgForm) {
    this.api.updateBlogPost(this.id, form)
      .subscribe(res => {
        let id = res['_id'];
        this.openSnackBar('Blog post updated!', '');
        this.api.getBlogPosts()
          .subscribe(res => {
            console.log(res);
            this.blogPosts = res;
            if (this.blogPosts && this.blogPosts.length > 0) {              
              this.swapWhatIsOpen('list');
            }
          }, err => {
            console.log(err);
          });
      }, (err) => {
        console.log(err);
      }
      );
  }

  editItem(id) {
    this.getBlogPost(id);   
    this.swapWhatIsOpen('detailsEdit');  
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

  public swapWhatIsOpen(divToShow) {    
    if (divToShow == 'detailsEdit') {     
      this.detailsEditOpen = true;
      this.listOpen = false;
    }
    if (divToShow == 'detailsEditBack') {     
      this.detailsEditOpen = false;
      this.listOpen = false;
    }
    if (divToShow == 'list') { 
      this.id = '';     
      this.detailsEditOpen = false;
      this.listOpen = true;
    }    
  }

  addPost() {
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '600px', data: { blogPostId: this.id },
    });

    const sub = dialogRef.componentInstance.onAdd.subscribe(() => {
      this.ngOnInit();
    });

    dialogRef.afterClosed().subscribe(() => {
      const unsub = dialogRef.componentInstance.onAdd.unsubscribe();
    });
  }

  addComment(id) {
    const dialogRef = this.dialog.open(ModalCommentComponent, {
      width: '550px', data: { blogPostId: id },
    });

    const sub = dialogRef.componentInstance.onAdd.subscribe(() => {
      this.getFilteredComments(id);
    });

    dialogRef.afterClosed().subscribe(() => {
      const unsub = dialogRef.componentInstance.onAdd.unsubscribe();
    });
  }

  getFilteredComments(id) {
    //this.comments = this.cloneComments();        
            
    // this.dataSource1 = this.comments.filter(
    //       item => item.blogPostId === id
    //       );      

    this.api.getComments()
      .subscribe(res => {        
        this.comments = res;        
        if (this.comments.length > 0)
        {         
          this.comments.forEach(element => {
            if (element.blogPostId === id)
            {
              this.comment = element;
            }            
          });  
        }       
          
        this.dataSource1 = this.comments.filter(
          item => item.blogPostId === id
          && item.author === this.loggedInUser);
      }, (err) => {
       console.log(err);
      });      
  }

  showHideComments(blogPostId) {
    if (!this.commentsOpen)
    {
      this.id = blogPostId;
      this.commentsOpen = true;
      this.getFilteredComments(this.id);      
              
      if (this.comment.author != this.loggedInUser) {
        this.displayedColumns = ['author', 'comment', 'createdAt', '_id'];
      }
      else if (this.comment.author == this.loggedInUser) {
        this.displayedColumns = ['author', 'comment', 'createdAt', 'edit', 'delete', '_id'];      
      }
    }
    else
    {
      this.id = '';
      this.commentsOpen = false;
    }    
  }

  editComment(commentId) {
    const dialogRef = this.dialog.open(ModalCommentComponent, {
      width: '550px', data: { blogPostId: this.id, commentId: commentId },
    });

    const sub = dialogRef.componentInstance.onAdd.subscribe(() => {
      this.getFilteredComments(this.id);
    });

    dialogRef.afterClosed().subscribe(() => {
      const unsub = dialogRef.componentInstance.onAdd.unsubscribe();
    });
  }

  deleteComment(commentId) {
    this.api.deleteComment(commentId)
      .subscribe(res => {
        this.openSnackBar('Comment deleted!', '');
        this.getFilteredComments(this.id);
      }, (err) => {
        console.log(err);
      }
    );
  }

  loadPreviousBlogPosts()
  {    
    this.api.getBlogPosts()
      .subscribe(res => {
        console.log(res);
        this.blogPosts = res;     
        this.startSet = this.startSet - 5;
        this.endSet = this.endSet - 5;   
        this.blogPosts = this.blogPosts.slice(this.startSet, this.endSet);          
        this.dataSource = this.blogPosts;     
      }, err => {
        console.log(err);
      });      
      if (this.startSet > 0 && this.endSet > 0)
      {

      }
  }

  loadNextBlogPosts()
  {    
    this.api.getBlogPosts()
      .subscribe(res => {
        console.log(res);
        this.blogPosts = res;        
        this.blogPosts = this.blogPosts.slice(this.startSet, this.endSet);         
        this.dataSource = this.blogPosts;     
      }, err => {
        console.log(err);
      });
      this.startSet = this.endSet;
      this.endSet = this.endSet + 5;
      if (this.startSet > 0 && this.endSet > 0)
      {

      }
  }
  
}