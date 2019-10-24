import { Injectable } from '@angular/core';
import * as AWS from 'aws-sdk/global';
import * as S3 from 'aws-sdk/clients/s3';
import { Observable } from 'rxjs';

@Injectable()
export class UploadFileService {
  s3AccessKey: string = '';
  s3Secret: string = '';
  s3BucketName: string = '';

  FOLDER = 'folder/';  

  constructor() 
  { 
  }

  uploadfile(file, creds): Observable<any> {
    if (creds == null || creds == '') {
      console.log('There was an error uploading your file.');
    }

    var arrCred = creds.toString().split(',');
    this.s3AccessKey = arrCred[0];
    this.s3Secret = arrCred[1];
    this.s3BucketName = arrCred[2];

    const bucket = new S3(
      {
        accessKeyId: this.s3AccessKey,
        secretAccessKey: this.s3Secret,
        region: 'us-east-1'       
      }
    );

    const params = {
      Bucket: this.s3BucketName,
      Key: this.FOLDER + file.name,
      Body: file,
      ACL: 'public-read'
    };
    
    return Observable.create(observer => {
      bucket.upload(params, function (err, data) {
        if (err) {
          console.log('There was an error uploading your file: ', err);
          return false;
        }
        console.log('Successfully uploaded file.', data);
        observer.next(data);
        observer.complete();
      });
    });
  }

}
