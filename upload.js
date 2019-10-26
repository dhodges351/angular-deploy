const IncomingForm = require('formidable').IncomingForm;
const fs = require('fs');
const AWS = require('aws-sdk');

module.exports = function upload(req, res) {
    var form = new IncomingForm();

    console.log('in upload.js');

    const bucket = new AWS.S3(
      {
        signatureVersion: 'v4',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: 'us-east-1'       
      }
    ); 

    form.on('file', (field, file) => {
       
        console.log('file name', file.name);
        console.log('file path', file.path);

        const fileContent = fs.readFileSync(file.path);

        const s3Params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: 'folder/' + file.name,
            Expires: 60,             
            Body: fileContent,
            ACL: 'public-read'
        };

        bucket.upload(s3Params, function(err, data) {
            if (err) {
                throw err;
            }
            console.log(`File uploaded successfully. ${data.Location}`);
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