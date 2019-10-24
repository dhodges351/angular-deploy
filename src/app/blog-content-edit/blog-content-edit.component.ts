import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { BlogContent } from '../models/blogcontent';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { environment } from '../../environments/environment';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { UploadFileService } from '../upload-file.service';
import { MatSnackBar } from '@angular/material/snack-bar';

const URL = environment.apiUrl + '/upload';

@Component({
  selector: 'app-blog-content-edit',
  templateUrl: './blog-content-edit.component.html',
  styleUrls: ['./blog-content-edit.component.css']
})
export class BlogContentEditComponent implements OnInit {
  public blogContent: BlogContent; 
  blogContentForm: FormGroup;
  id: string = '';
  currentBlog: boolean = false;
  image: string = '';
  title:string = '';
  category:string = '';
  content:string = '';
  imagePathAndFilename: string = '';
  uploadOnly: boolean = true;
  uploadButtonClicked: boolean = false;
  matcher: string = '';
  data:string = '';
  editor: DecoupledEditor = null;
  selectedFiles: FileList;

  constructor(
    private router: Router, 
    private route: ActivatedRoute, 
    private api: ApiService, 
    private formBuilder: FormBuilder, 
    private uploadService: UploadFileService,
    public snackBar: MatSnackBar
  ) 
  { }  
  
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

    this.id = this.route.snapshot.params['id'];
    this.getBlogContentDetails(this.id);
    this.blogContentForm = this.formBuilder.group({
      'currentBlog': [false, Validators.required],
      'image': ['', !Validators.required],
      'title': ['', Validators.required],
      'category': ['', Validators.required],
      'content': ['', !Validators.required],
    });  
  }
  
  getBlogContentDetails(id) {
    this.api.getBlogContentDetails(id).subscribe(data => {      
      this.blogContent = data;
      this.blogContentForm.setValue({          
        image: data.image,  
        currentBlog: data.currentBlog,   
        title: data.title,
        category: data.category,
        content: data.content
      });
      this.editor.setData(data.content);
    });
  }
  
  onFormSubmit(form: any) {
    form.content = this.editor.getData();     
    this.completeSubmit(form);
  }  

  completeSubmit(form)
  {
    if ((!this.uploadButtonClicked) || ((this.uploadButtonClicked) && (!this.uploadOnly))) 
    {
      var allBlogContent = []; 
      this.api.getAllBlogContent().subscribe(res => 
        {
          allBlogContent = res;
          for (var i = 0; i < allBlogContent.length; i++)
          {
            var data = allBlogContent[i];
            data.currentBlog = false;          
            var id = data._id;
            this.api.updateBlogContent(id, data)
              .subscribe(res => {}, (err) => {
                console.log(err);
              }
            );
          }
  
          this.api.updateBlogContent(this.id, form)
            .subscribe(res => {
              this.uploadOnly = true;
              this.imagePathAndFilename = '';
              this.router.navigate(['/allBlogContent']);               
            }, (err) => {
              console.log(err);       
            }
          );      
        }, err => {
          console.log(err);
        });         
    }    
  }

  setFlag() {
    this.uploadButtonClicked = true;
  }  

  returnToAllBlogContent()
  {
    this.router.navigate(['/allBlogContent']);
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

  upload() {
    const file = this.selectedFiles.item(0);
    this.uploadService.uploadfile(file).subscribe(
      data => {
        if (data) {          
          this.imagePathAndFilename += file.name + ', ';
          this.uploadOnly = false;
          this.blogContent.image = this.imagePathAndFilename;
          this.blogContent.title = this.blogContentForm.get('title').value;
          this.blogContent.category = this.blogContentForm.get('category').value;
          this.blogContent.content = this.editor.getData();
          this.blogContent.currentBlog = this.blogContentForm.get('currentBlog').value
          this.blogContentForm.setValue({
            image: this.blogContent.image,
            currentBlog: this.blogContent.currentBlog,
            title: this.blogContent.title,
            category: this.blogContent.category,
            content: this.blogContent.content
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
  
}
