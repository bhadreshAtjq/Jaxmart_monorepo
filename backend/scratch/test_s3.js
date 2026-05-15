const AWS = require('aws-sdk');
require('dotenv').config();

console.log('Testing S3 connection...');
console.log('Endpoint:', process.env.AWS_S3_ENDPOINT);
console.log('Bucket:', process.env.AWS_S3_BUCKET);
console.log('Region:', process.env.AWS_REGION);

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'auto',
});

const s3 = new AWS.S3({
  endpoint: process.env.AWS_S3_ENDPOINT,
  s3ForcePathStyle: true,
});

const params = {
  Bucket: process.env.AWS_S3_BUCKET,
  Key: 'test-connection.txt',
  Body: 'Hello from Antigravity test script!',
  ContentType: 'text/plain',
  ACL: 'public-read' // Try with ACL now
};

s3.putObject(params, (err, data) => {
  if (err) {
    console.error('❌ Error uploading:', err);
  } else {
    console.log('✅ Upload successful!', data);
    
    // Now try to get the object
    s3.getSignedUrl('getObject', {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: 'test-connection.txt',
      Expires: 60
    }, (err, url) => {
      if (err) {
        console.error('❌ Error getting signed URL:', err);
      } else {
        console.log('✅ Signed URL:', url);
      }
    });
  }
});
