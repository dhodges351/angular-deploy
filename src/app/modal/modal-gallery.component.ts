import { Component, Output, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { GalleryItem } from '../models/galleryitem';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { FileUploader, FileItem, FileUploaderOptions} from 'ng2-file-upload';
import { environment } from '../../environments/environment';
import { fileURLToPath } from 'url';

const URL = environment.apiUrl + '/upload';

@Component({
  selector: 'app-modal-gallery',
  templateUrl: './modal-gallery.component.html',
  styleUrls: ['./modal-gallery.component.css']
})
export class ModalGalleryComponent implements OnInit {
  blogGalleryForm: FormGroup;
  galleryItemObject: GalleryItem;
  id: string = '';
  title: string = '';
  image: string = '';
  author:string = '';
  details:string = '';
  matcher: string = '';
  imagePathAndFilename: string = '';
  uploadOnly: boolean = false;
  public uploader: FileUploader = new FileUploader({url: URL, itemAlias: 'photo'});
  opts: FileUploaderOptions;

  constructor(public dialogRef: MatDialogRef<ModalGalleryComponent>,     
    private router: Router, private route: ActivatedRoute, 
    private apiService: ApiService, 
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) 
  {
    this.galleryItemObject = new GalleryItem();
  } 

  onNoClick(): void {
    this.dialogRef.close();
  }

  public onAdd = new EventEmitter();

  onClose(): void {     
    this.dialogRef.close(); 
  }

  ngOnInit() {

    this.blogGalleryForm = this.formBuilder.group({
      'title': ['', Validators.required],
      'author': ['', Validators.required],
      'details': ['', Validators.required],
      'image': ['', Validators.required],
    });

    this.id = this.data.id;

    if (this.id != '' && this.id != null && this.id != undefined && this.id != 'id')
    {
      this.getGalleryItemDetails(this.id);      
    }
    
    this.uploader.onAfterAddingFile = (file) => { 
      file.withCredentials = false; 
    };

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
        console.log('ImageUpload:uploaded:', item, status, response);
        this.imagePathAndFilename = 'assets/images/' + item._file.name;
        this.galleryItemObject.image = this.imagePathAndFilename;
        this.galleryItemObject.title = this.blogGalleryForm.get('title').value;
        this.galleryItemObject.author = this.blogGalleryForm.get('author').value;
        this.galleryItemObject.details = this.blogGalleryForm.get('details').value;
        this.blogGalleryForm.setValue({
        image: this.galleryItemObject.image,        
        title: this.galleryItemObject.title,
        author: this.galleryItemObject.author,
        details: this.galleryItemObject.details
      });
     };     
  }  

  getGalleryItemDetails(id) {
    this.apiService.getGalleryItem(id)
      .subscribe(data => {
        console.log(data);
        this.galleryItemObject = data;
        this.blogGalleryForm.setValue({
          title: data.title,
          author: data.author,
          details: data.details,
          image: data.image
        });
      });
  }  
  
  onFormSubmit(form: NgForm) {    
    this.onAdd.emit();
    if (this.id != '' && this.id != null && this.id != undefined && this.id != 'id')
    {
      this.apiService.updateGalleryItem(this.id, form)
      .subscribe(data => {        
        this.onClose(); 
      });
    }
    else
    {
      this.apiService.saveGalleryItem(form)
      .subscribe(res => { 
        this.onClose();       
      }, (err) => {
          console.log(err);
        }
      );
    }
  }
}
