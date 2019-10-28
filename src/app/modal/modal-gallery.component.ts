import { Component, Output, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { GalleryItem } from '../models/galleryitem';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { FileUploader,  FileUploaderOptions} from 'ng2-file-upload';
import { environment } from '../../environments/environment';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
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
  uploadedFiles: Array<string> = new Array<string>();  
  CurrentImage: string;
  IsPublic: boolean = false;
  rawImageName: string = '';

  constructor(public dialogRef: MatDialogRef<ModalGalleryComponent>,     
    private router: Router, private route: ActivatedRoute, 
    private apiService: ApiService, 
    private formBuilder: FormBuilder,
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
        console.log(this.selected);
        this.galleryItemObject = data;

        this.rawImageName = this.galleryItemObject.image.toString();
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

        this.blogGalleryForm.setValue({
          title: data.title,
          author: data.author,
          details: data.details,
          category: data.category,
          image: newImageName
        });        
        this.selected = data.category;
        this.editor.setData(data.details);
      });
  }    
  
  onFormSubmit(form: any) {
    form.category = this.selected;
    form.details = this.editor.getData();      
    this.CurrentImage = '';
    this.galleryItemObject.image = '';
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

    this.onAdd.emit();
    if (this.id != '' && this.id != null && this.id != undefined && this.id != 'id')
    {      
      this.apiService.updateGalleryItem(this.id, form)
      .subscribe(data => {  
        this.uploadedFiles = new Array<string>();      
        this.onClose(); 
      });
    }
    else
    {
      this.apiService.saveGalleryItem(form)
      .subscribe(res => { 
        this.uploadedFiles = new Array<string>();
        this.onClose();       
      }, (err) => {
          console.log(err);
        }
      );
    }
  }

  getUploadedFiles($event)
  {
    this.uploadedFiles = $event;
  }

  getUpdatedValue($event) { 
    var form = this.blogGalleryForm;   
    this.title = this.blogGalleryForm.get('title').value;
    this.category = this.blogGalleryForm.get('category').value;
    this.author = this.blogGalleryForm.get('author').value;
    this.details = this.blogGalleryForm.get('details').value;
    this.blogGalleryForm.setValue({
      image: $event,
      title: this.title,
      category: this.category,
      details: this.details,
      author: this.author,
    });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }
}
