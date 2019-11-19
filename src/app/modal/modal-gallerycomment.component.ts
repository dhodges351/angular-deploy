import { Component, Output, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { GalleryComment } from '../models/gallerycomment';

@Component({
  selector: 'app-modal-gallerycomment',
  templateUrl: './modal-gallerycomment.component.html',
  styleUrls: ['./modal-gallerycomment.component.css']
})
export class ModalGalleryCommentComponent implements OnInit {
  blogGalleryCommentForm: FormGroup;
  galleryCommentObject: GalleryComment;
  galleryItemId: string = '';
  galleryCommentAuthor:string = '';
  galleryComment:string = '';
  params: object;
  galleryCommentId: string = '';
  matcher: string = '';

  constructor(public dialogRef: MatDialogRef<ModalGalleryCommentComponent>,     
    private router: Router, private route: ActivatedRoute, 
    private api: ApiService, 
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) 
  {    
    if (data.galleryCommentId != undefined)
    {
      this.galleryCommentId = data.galleryCommentId;
    } 
    if (data.galleryItemId != undefined)
    {
      this.galleryItemId = data.galleryItemId;
    }      
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public onAdd = new EventEmitter();

  onClose(): void {     
    this.dialogRef.close(); 
  }

  ngOnInit() {
    this.blogGalleryCommentForm = this.formBuilder.group({
      'galleryItemId': [null, !Validators.required],
      'title': [null, Validators.required],
      'author': [null, Validators.required],
      'comment': [null, Validators.required],
    });

    if (this.galleryCommentId != '')
    {
      this.api.getGalleryCommentDetails(this.galleryCommentId)
      .subscribe(data => {
        console.log(data);
        this.galleryCommentObject = data;
        this.blogGalleryCommentForm.setValue({
          galleryItemId: this.data.galleryItemId,
          title: this.galleryCommentObject.title,
          author: this.galleryCommentObject.author,
          comment: this.galleryCommentObject.comment
        });
      });  
    }
    else
    {
      this.blogGalleryCommentForm.setValue({
        galleryItemId: this.galleryItemId,       
        title: '',
        author: '',
        comment:''
      });
    }    
  }   
  
  onFormSubmit(form: NgForm) {
    this.onAdd.emit();
    if (this.galleryCommentId != '')
    {      
      this.api.updateGalleryComment(this.galleryCommentId, form)
      .subscribe(data => {
        console.log(data);
        this.galleryCommentObject = data;
        this.galleryCommentId = data._id;
        this.blogGalleryCommentForm.setValue({
          galleryCommentId: this.data.galleryCommentId,
          title: this.galleryCommentObject.title,
          author: this.galleryCommentObject.author,
          comment: this.galleryCommentObject.comment
        });
      });
    }
    else
    {
      this.api.saveGalleryComment(form)
      .subscribe(res => {                           
        }, (err) => {
          console.log(err);
        }
      );
    }    
    this.onClose();
  }
}
