import { Component, Output, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { GalleryItem } from '../models/galleryitem';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { FileUploader,  FileUploaderOptions} from 'ng2-file-upload';
import { environment } from '../../environments/environment';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { UploadFileService } from '../upload-file.service';
import { StateService } from '../state.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  category:string = '';
  matcher: string = '';
  public selectedIndex = 0;
  public selected = "General";
  imagePathAndFilename: string = '';  
  editor: DecoupledEditor = null;  
  selectedFiles: FileList;

  constructor(public dialogRef: MatDialogRef<ModalGalleryComponent>,     
    private router: Router, private route: ActivatedRoute, 
    private apiService: ApiService, 
    private formBuilder: FormBuilder,
    private uploadService: UploadFileService,
    public stateSvc: StateService,
    public snackBar: MatSnackBar,
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

    this.blogGalleryForm = this.formBuilder.group({
      'title': ['', Validators.required],
      'category': [this.selected, !Validators.required],
      'author': ['', Validators.required],
      'details': ['', !Validators.required],
      'image': ['', Validators.required],
    });

    this.id = this.data.id;

    if (this.id != '' && this.id != null && this.id != undefined && this.id != 'id')
    {
      this.getGalleryItemDetails(this.id);      
    }    
  }  

  getGalleryItemDetails(id) {
    this.apiService.getGalleryItem(id)
      .subscribe(data => {
        console.log(data);
        console.log(this.selected);
        this.galleryItemObject = data;
        this.blogGalleryForm.setValue({
          title: data.title,
          author: data.author,
          details: data.details,
          category: data.category,
          image: data.image
        });        
        this.selected = data.category;
        this.editor.setData(data.details);
      });
  }  

  upload() {
    const file = this.selectedFiles.item(0);    
    // this.apiService.getConfig().subscribe(
    //   data => {
    //     if (data) { 
    //       this.uploadService.uploadfile(file, data).subscribe(res => 
    //       {
    //         this.imagePathAndFilename += file.name + ', ';
    //         this.galleryItemObject.image = this.imagePathAndFilename;
    //         this.galleryItemObject.title = this.blogGalleryForm.get('title').value;
    //         this.galleryItemObject.author = this.blogGalleryForm.get('author').value;
    //         this.galleryItemObject.category = this.selected;
    //         this.galleryItemObject.details = this.editor.getData();
    //         this.blogGalleryForm.setValue({
    //         image: this.galleryItemObject.image,        
    //         title: this.galleryItemObject.title,
    //         category: this.galleryItemObject.category,
    //         author: this.galleryItemObject.author,
    //         details: this.galleryItemObject.details
    //         });
    //         this.openSnackBar('Image uploaded!', '');
    //       });
    //     }
    //   }, 
    //   error => {
    //     console.error( error );
    //   });
  }

  selectFile(event) {
    this.selectedFiles = event.target.files;
  }
  
  onFormSubmit(form: any) {
    form.category = this.selected;
    form.details = this.editor.getData(); 
    form.image = this.imagePathAndFilename;     
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

  onChange() {
    console.log(this.selected);
    this.category = this.selected;    
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }
}
