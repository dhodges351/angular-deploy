const convict = require("convict");
const dotenv = require("dotenv");

dotenv.config();

const config = convict({  
  AWS_ACCESS_KEY_ID: 'AKIAJIGDSX6ZN5DIZNEQ',
  AWS_SECRET_ACCESS_KEY: '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',
  S3_BUCKET_NAME: 'gourmet-philatelist-assets',
  S3_IDENTITY_POOL_ID: 'us-east-1:f18f81ba-589b-433a-b6b7-30a52df2ddc4,',
  MONGODB_URI: 'mongodb://heroku_758nq1fn:h4ltb7f35r4934mo0l77lm3vkt@ds253857.mlab.com:53857/heroku_758nq1fn'
});

config.validate({ allowed: "strict" });

module.exports = () => {
  return { code: "module.exports = " + JSON.stringify(config.getProperties()) };
};