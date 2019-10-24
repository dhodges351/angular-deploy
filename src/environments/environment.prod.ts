export const environment = {
  production: true,
  apiUrl: 'https://mighty-forest-64127.herokuapp.com/api',
  accessKey: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  bucketName: process.env.S3_BUCKET_NAME,
  MONGODB_URI: process.env.MONGODB_URI
};
