const IncomingForm = require('formidable').IncomingForm;
const fs = require('fs');
const AWS = require('aws-sdk');

module.exports = function upload(req, res) {
    var form = new IncomingForm();

    console.log('in upload.js');

    const bucket = new AWS.S3(
      {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: 'us-east-1'       
      }
    ); 

    form.on('file', (field, file) => {
       
        console.log('file name', file.name);
        console.log('file path', file.path);
              
        fs.readFile(file.path, function (err, data) {
            if (err) 
            { 
                throw err; 
            }
            
            const params = {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: 'folder/' + file.name,
                Body: data,
                ACL: 'public-read'
            };

            bucket.upload(params, function (err, res) {
                if (err) {
                    console.log('There was an error uploading your file: ', err);
                    return false;
                }                
                console.log('Successfully uploaded file.', res);
                fs.unlink(file.path, function (err) {
                    if (err) {
                        console.error(err);
                    }
                    console.log('Temp File Delete');
                });
            });
        });
    });

    // The second callback is called when the form is completely parsed. 
    // In this case, we want to send back a success status code.
    form.on('end', () => {
        console.log('in form end');
        res.json();
      });

    form.parse(req);
}