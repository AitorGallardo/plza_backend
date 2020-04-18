const { Router } = require('express');
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


const Event = require('../models/Event');

const bucketConnection = new Storage({
  keyFilename: path.join(__dirname, '../../inbound-obelisk-237314-6af9f5ed94b1.json'),
  projectId: 'inbound-obelisk-237314',
});
const bucketName = 'plza-events';
const googleBucket = bucketConnection.bucket(bucketName);

const {
  API_KEY,
} = process.env;
const router = Router();

router.get('/', async (req, res) => {
  try {
    const logentry = await Event.find();
    res.json(logentry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  // res.send('hola')
});

router.get('/:id', async (req, res) => {
  try {
    const logentry = await Event.findOne({ _id: req.params.id });
    res.json(logentry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  // res.send('hola')
});

router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (req.file) {
      await googleBucket.upload(req.file.path, { gzip: true });
      const eventData = {
        ...JSON.parse(req.body.data),
        image: `https://storage.googleapis.com/${bucketName}/${req.file.filename}`,
      };
      const logEntry = new Event(eventData);
      const createdEntry = await logEntry.save();
      res.json(createdEntry);
    } else {
      const logEntry = new Event(req.body.data);
      const createdEntry = await logEntry.save();
      res.json(createdEntry);
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(422);
    }
    next(error);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const logentry = await Event.findOne({ _id: req.params.id }).remove();
    console.log('LOGENTRY', logentry);

    res.json(logentry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
