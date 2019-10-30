import { Component, Output, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Blogpost } from "../models/blogpost";
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

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
  uploadedFiles: Array<string> = new Array<string>();  
  CurrentImage: string;
  IsPublic: boolean = true;
  rawImageName: string = '';  
 
  constructor(public dialogRef: MatDialogRef<ModalComponent>,     
    private router: Router, private route: ActivatedRoute, 
    private api: ApiService, 
    private formBuilder: FormBuilder,
    public snackBar: MatSnackBar 
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
      'title' : ['', Validators.required],
      'category' : ['', Validators.required],
      'short_desc' : ['', !Validators.required],
      'author' : ['', Validators.required],
      'image' : ['', !Validators.required],
    });    
  }

  getBlogPost(id) {    
    this.api.getBlogPost(id).subscribe(data => {
      this.blogPost = data;
      this.id = data._id;
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
        title: this.blogPost.title,
        category: this.blogPost.category,
        short_desc: this.blogPost.short_desc,
        author: this.blogPost.author,
      });
    });
  }
  
  onFormSubmit(form: any) {
    
    this.onAdd.emit();
    
    this.CurrentImage = '';
    this.blogPost.image = '';
    form.image = '';
    if (this.editor != null)
      {
        form.short_desc = this.editor.getData();
      }    

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

    this.api.postBlogPost(form)
      .subscribe(res => {
        this.openSnackBar('Blog post submitted!', '');
        this.uploadedFiles = new Array<string>();
        }, (err) => {
          console.log(err);
        }
      );
    this.onClose();        
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

  getUploadedFiles($event)
  {
    this.uploadedFiles = $event;
  }

  getUpdatedValue($event) { 
    var form = this.blogPostForm;
    this.image = this.blogPostForm.get('image').value;
    this.title = this.blogPostForm.get('title').value;
    this.category = this.blogPostForm.get('category').value;
    this.author = this.blogPostForm.get('author').value;
    this.short_desc = this.editor.getData(); 
    this.blogPostForm.setValue({
      image: $event,
      title: this.title,
      category: this.category,
      short_desc: this.short_desc,
      author: this.author,
    });
  }

  returnHome() {
    this.router.navigate(['/home']);
  }
}
