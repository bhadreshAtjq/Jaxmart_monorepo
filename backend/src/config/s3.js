const { S3Client } = require('@aws-sdk/client-s3');

const s3Config = {
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

if (process.env.AWS_S3_ENDPOINT && process.env.AWS_S3_ENDPOINT.trim() !== '') {
  s3Config.endpoint = process.env.AWS_S3_ENDPOINT;
  s3Config.forcePathStyle = true;
}

const s3 = new S3Client(s3Config);

module.exports = { s3 };
