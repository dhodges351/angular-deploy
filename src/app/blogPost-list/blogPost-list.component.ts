import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Input, } from '@angular/core';
import { ApiService } from '../api.service';
import { Blogpost } from "../models/blogpost";
import { Comment } from '../models/comment';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material';
import { ModalCommentComponent } from '../modal/modal-comment.component';
import { ModalComponent } from '../modal/modal.component';
import { AuthService } from 'src/app/auth/auth.service';
import * as _ from 'lodash';
import { environment } from '../../environments/environment';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

const URL = environment.apiUrl + '/upload';

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
  editor: DecoupledEditor;  
  uploadedFiles: Array<string> = new Array<string>();  
  CurrentImage: string;
  IsPublic: boolean = true;
  rawImageName: string = '';

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

  openDialog(): void {

    const dialogRef = this.dialog.open(ModalComponent, {
      width: '700px', data: { title: '' },
    });
    
    const sub = dialogRef.componentInstance.onAdd.subscribe(() => {
      BlogPostListComponent.blogPostListApp.ngOnInit(); 
    });

    dialogRef.afterClosed().subscribe(() => {
      const unsub = dialogRef.componentInstance.onAdd.unsubscribe();      
    });
  }

  public ngOnInit() {  
    
    this.loggedInUser = localStorage.getItem('Item 1');   
    if (this.loggedInUser == null || this.loggedInUser == '' || this.loggedInUser.indexOf('@') > 0)
    {
      this.loggedInUser = localStorage.getItem('Item 2');
    }
    this.displayedPostColumns = ['image', 'title', 'category', 'author', 'createdAt', 'edit'];
    
    this.blogPostForm = this.formBuilder.group({
      'image': ['', !Validators.required],
      'title': ['', Validators.required],
      'category': ['', Validators.required],
      'short_desc': ['', !Validators.required],
      'author': ['', Validators.required],
    });

    this.api.getBlogPosts()
      .subscribe(res => {
        console.log(res);
        this.blogPosts = res;        
        this.blogPosts = this.blogPosts.slice(this.startSet, this.endSet);     
        this.dataSource = this.blogPosts;     
      }, err => {
        console.log(err);
      });     
  }

  scrollToTop() {    
    var element = document.getElementById("mainUL");
    element.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
    return false;
  }

  deleteItem(id) {
    if(confirm("Are you sure you want to delete this item?")) {
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
      });
    }  
  }

  getBlogPost(id) {    
    this.api.getBlogPost(id).subscribe(data => {
      this.blogPost = data;
      this.rawImageName = this.blogPost.image.toString();
      var arrImageName = new Array<string>();
      var newImageName = '';
      var index = 0;
      if (this.rawImageName.indexOf(',') > 0)
      {
        arrImageName = this.rawImageName.split(',');
      }
      if (arrImageName.length > 0)
      {
        arrImageName.forEach(element => {
          index = element.lastIndexOf('/'); 
          newImageName += element.substring(index + 1, element.length) + ',';
        });
      }
      else
      {
        index = this.rawImageName.lastIndexOf('/'); 
        newImageName = this.rawImageName.substring(index + 1, this.rawImageName.length);
      }
      if (newImageName.endsWith(','))
      {
        newImageName = newImageName.slice(0,-1);
      }      
      this.CurrentImage = newImageName;
      this.id = data._id;
      if (this.editor != null)
      {
        this.editor.setData(data.short_desc); 
      }        
      this.blogPostForm.setValue({
        image: newImageName,
        title: data.title,
        category: data.category,
        short_desc: data.short_desc,
        author: data.author,
      });
    });
  }

  getUploadedFiles($event)
  {
    this.uploadedFiles = $event;
  }

  getUpdatedValue($event) {  
    this.blogPostForm.setValue({
      image: $event,
      title: this.blogPost.title,
      category: this.blogPost.category,
      short_desc: this.blogPost.short_desc,
      author: this.blogPost.author,
    });
  }

  saveForm(form: any) {    
    form.short_desc = this.editor.getData();

    this.CurrentImage = '';
    this.blogPost.image = '';
    form.image = '';

    if (this.uploadedFiles.length > 0)
    {
      this.uploadedFiles.forEach(element => {
        form.image += element + ',';
      });
      if (form.image.toString().endsWith(','))
      {
        form.image = form.image.toString().slice(0,-1);
      }     
    }

    this.api.updateBlogPost(this.id, form)
      .subscribe(res => {
        let id = res['_id'];
        this.openSnackBar('Blog post updated!', '');
        this.api.getBlogPosts()
          .subscribe(res => {
            console.log(res);
            this.uploadedFiles = new Array<string>();
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
    DecoupledEditor
    .create( document.querySelector( '#editor2' ) )
    .then( editor => {
        const toolbarContainer = document.querySelector( '#toolbar-container2' );
        toolbarContainer.appendChild( editor.ui.view.toolbar.element );        
        this.editor = editor;        
    } )
    .catch( error => {
        console.error( error );
    } );
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

  addComment(id) {
    const dialogRef = this.dialog.open(ModalCommentComponent, {
      width: '650px', data: { blogPostId: id },
    });

    const sub = dialogRef.componentInstance.onAdd.subscribe(() => {
      this.getFilteredComments(id);
    });

    dialogRef.afterClosed().subscribe(() => {
      const unsub = dialogRef.componentInstance.onAdd.unsubscribe();
    });
  }

  getFilteredComments(id) { 
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