const { Storage } = require('@google-cloud/storage');
const path = require('path');
const multer = require('multer');

const st = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './uploads/');
  },
  filename(req, file, cb) {
    cb(null, file.filename);
  },
});

const fFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  dest: '/uploads/',
});


const bucketConnection = new Storage({
  keyFilename: path.join(__dirname, '../../inbound-obelisk-237314-6af9f5ed94b1.json'),
  projectId: 'inbound-obelisk-237314',
});
const bucketName = 'plza-events';
const googleBucket = bucketConnection.bucket(bucketName);


module.exports = {
  googleBucket,
  upload,
  bucketName,
};
