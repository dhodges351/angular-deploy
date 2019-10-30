import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { ApiService } from '../api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-upload-image',
  templateUrl: './upload-image.component.html',
  styleUrls: ['./upload-image.component.css']
})

export class UploadImageComponent implements OnInit {
  public files: Set<File> = new Set();
  @ViewChild('file', { static: false }) file;
  public uploadedFiles: Array<string> = new Array<string>();
  public uploadedFileNames: Array<string> = new Array<string>();
  @Output() filesOutput = new EventEmitter<Array<string>>();
  @Input() CurrentImage: string;
  @Input() IsPublic: boolean;
  @Output() valueUpdate = new EventEmitter();
  strUploadedFiles:string = '';
  filesUploaded: boolean = false;     

  constructor(private api: ApiService, public snackBar: MatSnackBar,) { }

  ngOnInit() {    
  }

  updateValue(val) {  
    this.valueUpdate.emit(val);  
  }  

  reset()
  {
    this.files = new Set();
    this.uploadedFiles = new Array<string>();
    this.uploadedFileNames = new Array<string>();
    this.filesUploaded = false;
  }

  upload() { 
 
    this.api.upload(this.files).subscribe(res => {   
      this.filesOutput.emit(this.uploadedFiles); 
      if (res == 'upload ok')
      {
        this.reset(); 
      }     
    }, err => {
      console.log(err);
    });
  }

  onFilesAdded() {
    var txt = '';
    const files: { [key: string]: File } = this.file.nativeElement.files;

    for (let key in files) {
      if (!isNaN(parseInt(key))) {

        var currentFile = files[key];
        var sFileExtension = currentFile.name.split('.')[currentFile.name.split('.').length - 1].toLowerCase();
        var iFileSize = currentFile.size;

        if (!(sFileExtension === "jpg" 
              || sFileExtension === "png") 
              || iFileSize > 671329) {
            txt = "File type : " + sFileExtension + "\n\n";
            txt += "Size: " + iFileSize + "\n\n";
            txt += "Please make sure your file is in jpg or png format and less than 655 KB.\n\n";
            alert(txt);
            return false;
        }

        this.files.add(files[key]);
        this.uploadedFiles.push('https://gourmet-philatelist-assets.s3.amazonaws.com/folder/' + files[key].name);
        this.uploadedFileNames.push(files[key].name);
        if (this.IsPublic && this.uploadedFileNames.length == 1)
        {
          this.filesUploaded = true;
          this.updateValue(files[key].name);
          break;
        } 
        else if (!this.IsPublic && this.uploadedFileNames.length == 3)
        {
          this.strUploadedFiles += files[key].name;          
          this.updateValue(this.strUploadedFiles); 
          this.filesUploaded = true;
          break;
        }
        else
        {
          this.strUploadedFiles += files[key].name + ",";          
          this.updateValue(this.strUploadedFiles); 
        }      
      }
    }    
  }

  addFiles() {
    this.file.nativeElement.click();  
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }   

}
