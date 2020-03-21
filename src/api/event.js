const { Router } = require('express');

const Event = require('../models/Event');

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
    const logentry = await Event.findOne({ _id : req.params.id });
    res.json(logentry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  // res.send('hola')
});

router.post('/', async (req, res, next) => {
  try {
    // if (req.get('X-API-KEY') !== API_KEY) {
    //   res.status(401);
    //   throw new Error('UnAuthorized');
    // }
    console.log('REQUEST >>>', req.body);
    
    const logEntry = new Event(req.body);
    const createdEntry = await logEntry.save();
    res.json(createdEntry);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(422);
    }
    next(error);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const logentry = await Event.findOne({ _id : req.params.id }).remove();
    console.log('LOGENTRY',logentry);
    
    res.json(logentry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
