const { Router } = require('express');

const Event = require('../models/Event');
const storage = require('../helpers/storage-connection');

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
    const event = await Event.findOne({ _id: req.params.id });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  // res.send('hola')
});

router.post('/', storage.upload.single('image'), async (req, res, next) => {
  try {
    if (req.file) {
      await storage.googleBucket.upload(req.file.path, { gzip: true });
      const eventData = {
        ...JSON.parse(req.body.data),
        image: `https://storage.googleapis.com/${storage.bucketName}/${req.file.filename}`,
      };
      const event = new Event(eventData);
      const createdEntry = await event.save();
      res.json(createdEntry);
    } else {
      const event = new Event(req.body.data);
      const createdEntry = await event.save();
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
    const event = await Event.findOne({ _id: req.params.id }).remove();

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
