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
  uploadedFiles: Array<string> = new Array<string>();  
  CurrentImage: string;
  IsPublic: boolean = false;
  rawImageName: string = '';

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

  getUploadedFiles($event)
  {
    this.uploadedFiles = $event;
  }

  getUpdatedValue($event) {
    this.blogContent.image = $event;
    this.blogContent.title = this.blogContentForm.get('title').value;
    this.blogContent.category = this.blogContentForm.get('category').value;
    this.blogContent.content = this.editor.getData();
    this.blogContent.currentBlog = this.blogContentForm.get('currentBlog').value

    this.blogContentForm.setValue({
      image: $event,
      title: this.blogContent.title,
      category: this.blogContent.category,
      content: this.blogContent.content,
      currentBlog: this.blogContent.currentBlog
    });
  }
  
  getBlogContentDetails(id) {
      this.api.getBlogContentDetails(id).subscribe(data => {      
      this.blogContent = data;
      this.rawImageName = this.blogContent.image.toString();
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
      this.blogContentForm.setValue({          
        image: newImageName,  
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
    form.image = '';
    this.blogContent.image = '';
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
    else
    {
      form.image = this.rawImageName;
    }
   
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
  
}
