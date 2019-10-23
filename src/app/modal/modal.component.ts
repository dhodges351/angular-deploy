import { Component, Output, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Blogpost } from "../models/blogpost";
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { UploadFileService } from '../upload-file.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})

export class ModalComponent implements OnInit {
  public blogPost: Blogpost;
  blogPostForm: FormGroup;
  id: string = '';
  title: string = '';
  category: string = '';
  short_desc:string = '';
  author:string = '';
  image: string = '';
  imagePathAndFilename: string = '';
  uploadOnly: boolean = false;
  matcher: string = '';
  editor: DecoupledEditor = null;
  selectedFiles: FileList;
 
  constructor(public dialogRef: MatDialogRef<ModalComponent>,     
    private router: Router, private route: ActivatedRoute, 
    private api: ApiService, 
    private formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    private uploadService: UploadFileService,   
  ) {}
    

  onNoClick(): void {
    this.dialogRef.close();
  } 

  public onAdd = new EventEmitter();

  onClose(): void {
    this.dialogRef.close();
  }  

  ngOnInit() {

    DecoupledEditor    
    .create( document.querySelector( '#editor' ) )
    .then( editor => {
        const toolbarContainer = document.querySelector( '#toolbar-container' );
        toolbarContainer.appendChild( editor.ui.view.toolbar.element );        
        this.editor = editor;
    } )
    .catch( error => {
        console.error( error );
    } );

    this.blogPost = new Blogpost();
    this.blogPostForm = this.formBuilder.group({
      'title' : [null, Validators.required],
      'category' : [null, Validators.required],
      'short_desc' : [null, !Validators.required],
      'author' : [null, Validators.required],
      'image' : [null, !Validators.required],
    });    
  }

  getBlogPost(id) {
    this.api.getBlogPost(id).subscribe(data => {
      this.id = data._id;
      this.blogPostForm.setValue({
        title: data.title,
        category: data.category,
        short_desc: data.short_desc,
        author: data.author,
        image: data.image
      });
    });
  } 
  
  onFormSubmit(form: NgForm) {
    // if (this.blogPost.image == null)
    // {
    //   this.blogPost.image = "";
    // }
    // this.onAdd.emit();
    // this.api.postBlogPost(form)
    //   .subscribe(res => {
    //     this.openSnackBar('Blog post submitted!', '');
    //     }, (err) => {
    //       console.log(err);
    //     }
    //   );
    this.onClose();        
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
 }

 upload() {
  if (this.blogPostForm.get('image').value != null && this.blogPostForm.get('image').value.length > 0)
  {
    alert('Only 1 image file (less than 200K) is allowed per Blog Post.');
    return;
  }
  const file = this.selectedFiles.item(0);
  this.uploadService.uploadfile(file).subscribe(
    data => {
      if (data) {          
        this.imagePathAndFilename += file.name + ', ';
        this.uploadOnly = false;
        this.blogPost.image = this.imagePathAndFilename;
        this.blogPost.title = this.blogPostForm.get('title').value;
        this.blogPost.author = this.blogPostForm.get('author').value;
        this.blogPost.category = this.blogPostForm.get('category').value;
        this.blogPost.short_desc = this.editor.getData();
        this.blogPostForm.setValue({
          image: this.imagePathAndFilename,          
          title: this.blogPost.title,
          category: this.blogPost.category,
          author: this.blogPost.author,
          short_desc: this.blogPost.short_desc
        });
        this.openSnackBar('Image uploaded!', '');
      }
    }, 
    error => {
      console.error( error );
    });
}

selectFile(event) {
  this.selectedFiles = event.target.files;
  }

  returnHome() {
    this.router.navigate(['/home']);
  }
}
