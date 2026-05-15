require('dotenv').config();
const { getPresignedUrl } = require('./src/utils/s3');

async function test() {
  const url = 'https://t3.storageapi.dev/compact-gyoza-ufcdjppjpqk/uploads/bd62640b-cb38-4dee-851e-74e525f6262d.png';
  console.log('Testing URL:', url);
  console.log('Bucket from ENV:', process.env.AWS_S3_BUCKET);
  
  const signed = await getPresignedUrl(url);
  console.log('Signed URL:', signed);
}

test();
