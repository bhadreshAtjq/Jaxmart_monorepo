const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3 } = require('../config/s3');

async function getPresignedUrl(url) {
  if (!url || !url.includes('uploads/')) return url;
  
  // Extract key from URL
  const key = url.split('uploads/')[1];
  const fullKey = `uploads/${key}`;
  
  try {
    const bucket = process.env.AWS_S3_BUCKET;
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: fullKey,
    });
    
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    // logger.debug(`[S3] Signed URL generated for ${fullKey}`);
    return signedUrl;
  } catch (err) {
    console.error(`[S3] Error signing URL for ${fullKey}:`, err.message);
    return url;
  }
}

function cleanS3Url(url) {
  if (!url) return url;
  // If it's a presigned URL, strip the query parameters
  if (url.includes('?')) {
    return url.split('?')[0];
  }
  return url;
}

async function signListingMedia(listing) {
  if (!listing || !listing.media) return listing;
  
  const signedMedia = await Promise.all(
    listing.media.map(async (m) => ({
      ...m,
      url: await getPresignedUrl(m.url),
    }))
  );
  
  return { ...listing, media: signedMedia };
}

module.exports = { getPresignedUrl, signListingMedia, cleanS3Url };
