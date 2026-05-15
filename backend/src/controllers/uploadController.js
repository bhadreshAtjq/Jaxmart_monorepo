const multer = require('multer');
const multerS3 = require('multer-s3');
const { s3 } = require('../config/s3');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');
const { getPresignedUrl } = require('../utils/s3');

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const ext = file.originalname.split('.').pop();
      cb(null, `uploads/${uuidv4()}.${ext}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed!'), false);
    }
  }
});

const uploadSingle = async (req, res) => {
  logger.info('[DEBUG] uploadSingle: starting');
  if (!req.file) {
    logger.warn('[DEBUG] uploadSingle: no file received');
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const signedUrl = await getPresignedUrl(req.file.location);
  logger.info(`[DEBUG] uploadSingle: success, signedUrl generated`);
  
  res.json({
    url: signedUrl,
    key: req.file.key,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
};

const uploadMultiple = async (req, res) => {
  logger.info('[DEBUG] uploadMultiple: starting');
  if (!req.files || req.files.length === 0) {
    logger.warn('[DEBUG] uploadMultiple: no files received');
    return res.status(400).json({ error: 'No files uploaded' });
  }
  
  const files = await Promise.all(req.files.map(async f => ({
    url: await getPresignedUrl(f.location),
    key: f.key,
    mimetype: f.mimetype,
    size: f.size
  })));
  
  logger.info(`[DEBUG] uploadMultiple: success, uploaded ${files.length} files with signed URLs`);
  res.json(files);
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple
};
