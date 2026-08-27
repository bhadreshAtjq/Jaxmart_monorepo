const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3 } = require('../config/s3');

function cleanS3Url(url) {
  if (!url || typeof url !== 'string') return url;
  // If it's a presigned URL, strip all query parameters
  return url.split('?')[0];
}

async function getPresignedUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('uploads/')) return url;
  
  // Clean URL first to remove existing signatures
  const cleaned = cleanS3Url(url);
  
  // Extract key after 'uploads/'
  const filename = cleaned.split('uploads/')[1];
  if (!filename) return url;
  
  const fullKey = `uploads/${filename}`;
  
  try {
    const bucket = process.env.AWS_S3_BUCKET || 'jaxmart-prod-media';
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: fullKey,
    });
    
    // Sign with 24 hours expiry (86400 seconds)
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 86400 });
    return signedUrl;
  } catch (err) {
    console.error(`[S3] Error signing URL for ${fullKey}:`, err.message);
    return url;
  }
}

async function signListingMedia(listing) {
  if (!listing) return listing;
  
  if (Array.isArray(listing.media) && listing.media.length > 0) {
    const signedMedia = await Promise.all(
      listing.media.map(async (m) => ({
        ...m,
        url: await getPresignedUrl(m.url),
      }))
    );
    return { ...listing, media: signedMedia };
  }
  
  return listing;
}

module.exports = { getPresignedUrl, signListingMedia, cleanS3Url };
