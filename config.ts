import * as loadedConfig from "!val-loader!./config-loader";

export interface IConfig {  
  AWS_ACCESS_KEY_ID: 'accessKey',
  AWS_SECRET_ACCESS_KEY: 'secret',
  S3_IDENTITY_POOL_ID: 'identitypoolid',
  S3_BUCKET_NAME: 's3BucketName'
}

export const config = loadedConfig as IConfig;