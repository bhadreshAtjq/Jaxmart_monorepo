const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'auto',
});

const s3 = new AWS.S3({
  endpoint: process.env.AWS_S3_ENDPOINT,
  s3ForcePathStyle: true, // often needed for non-AWS S3 providers
});

module.exports = { s3 };
