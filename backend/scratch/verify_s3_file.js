const { S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3');
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

async function test() {
  const bucket = process.env.AWS_S3_BUCKET;
  const key = 'uploads/bd62640b-cb38-4dee-851e-74e525f6262d.png';
  
  try {
    const data = await s3.send(new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    }));
    console.log('File found!', data);
  } catch (err) {
    console.error('Error finding file:', err.message);
  }
}

test();
