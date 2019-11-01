const IncomingForm = require('formidable').IncomingForm;
const AWS = require('aws-sdk');

module.exports = function deleteS3Images(req, res) {

  var form = new IncomingForm();
  const bucket = new AWS.S3(
    {
      signatureVersion: 'v4',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: 'us-east-1'       
    }
  ); 

  form.on('file', (field, file) => {
   
    console.log('folder/' + file.name);

    bucket.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: 'folder/' + file.name
    },
    function (err,data){
      if (err)
      {
        throw err;
      }
      else
      {
        console.log('Image file ' + file.name + ' deleted from S3 bucket.')
      }
    });
  });

  // The second callback is called when the form is completely parsed. 
  // In this case, we want to send back a success status code.
  form.on('end', () => {        
    res.status(200).json('upload ok');
  });

  form.parse(req);
}