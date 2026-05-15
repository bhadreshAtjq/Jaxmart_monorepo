const { S3Client, PutObjectAclCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.AWS_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

async function makePublic() {
  const bucket = process.env.AWS_S3_BUCKET;
  const key = 'uploads/bd62640b-cb38-4dee-851e-74e525f6262d.png';
  
  try {
    await s3.send(new PutObjectAclCommand({
      Bucket: bucket,
      Key: key,
      ACL: 'public-read',
    }));
    console.log('File is now public!');
  } catch (err) {
    console.error('Error making file public:', err.message);
  }
}

makePublic();
