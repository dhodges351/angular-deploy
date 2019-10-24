export const environment = {
  production: true,
  apiUrl: 'https://mighty-forest-64127.herokuapp.com/api',
  accessKey: process.env.RAZZLE_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.RAZZLE_AWS_SECRET_ACCESS_KEY,
  bucketName: process.env.RAZZLE_S3_BUCKET_NAME
};
