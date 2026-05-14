const multer = require('multer');
const multerS3 = require('multer-s3');
const { s3 } = require('../config/s3');
const { v4: uuidv4 } = require('uuid');

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKE, // Note: the .env has AWS_S3_BUCKE
    acl: 'public-read',
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

const uploadSingle = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({
    url: req.file.location,
    key: req.file.key,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
};

const uploadMultiple = (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  const files = req.files.map(f => ({
    url: f.location,
    key: f.key,
    mimetype: f.mimetype,
    size: f.size
  }));
  res.json(files);
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple
};
