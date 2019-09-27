import { Component, Inject, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { BlogContent } from '../models/blogcontent';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { FileUploader} from 'ng2-file-upload';
import { environment } from '../../environments/environment';

const URL = environment.apiUrl + '/api/upload';

@Component({
  selector: 'app-blog-content',
  templateUrl: './blog-content.component.html',
  styleUrls: ['./blog-content.component.css']
})

export class BlogContentComponent implements OnInit {   
  public blogContent: BlogContent; 
  blogContentForm: FormGroup;
  currentBlog:boolean = false;
  image:string = '';
  title:string = '';
  category:string = '';
  content:string = '';
  imagePathAndFilename: string = '';
  uploadOnly: boolean = false;
  matcher: string = '';

  constructor(private api: ApiService, private formBuilder: FormBuilder, private router: Router, public snackBar: MatSnackBar) {  	
    this.blogContent = new BlogContent();
  }

  public uploader: FileUploader = new FileUploader({url: URL, itemAlias: 'photo'});

  ngOnInit() {
    this.blogContentForm = this.formBuilder.group({
      'currentBlog': [this.currentBlog, !Validators.required],
      'image' : [null, !Validators.required],
      'title' : [null, Validators.required],
      'category' : [null, Validators.required],
      'content' : [null, Validators.required],
    });    
    
    this.uploader.onAfterAddingFile = (file) => { 
      file.withCredentials = false;
    };

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      console.log('ImageUpload:uploaded:', item, status, response);       
      this.imagePathAndFilename = 'assets/images/' + item._file.name;      
      this.uploadOnly = true;
      this.blogContentForm.setValue({
        currentBlog: this.blogContent.currentBlog,
        image: this.imagePathAndFilename,     
        title: this.blogContent.title,
        category: this.blogContent.category,
        content: this.blogContent.content,
      });
   };     
  } 

  onFormSubmit(form: any) { 
    this.blogContent.title = this.blogContentForm.get('title').value;
    this.blogContent.category = this.blogContentForm.get('category').value;
    this.blogContent.content = this.blogContentForm.get('content').value;
    this.blogContent.image = this.blogContentForm.get('image').value;
    this.blogContent.currentBlog = this.blogContentForm.get('currentBlog').value;    
    this.completeSubmit(form);
  }

  completeSubmit(form)
  {
    if (this.uploadOnly)
    {
      this.api.saveBlogContent(form)
      .subscribe(res => {
        let id = res['_id'];

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

        this.api.updateBlogContent(id, form)
          .subscribe(res => {  
            this.openSnackBar('Blog post updated!', '');      
            this.uploadOnly = false;
            this.imagePathAndFilename = '';
            form.image = '';   
            this.router.navigate(['/allBlogContent']);                 
          }, (err) => {
            console.log(err);       
          }
        );      
      }, err => {
        console.log(err);
      });    
    });     
  } 
}
  
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
 }

}
