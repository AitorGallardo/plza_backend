const express = require('express');
const Joi = require('joi');


const router = express.Router();

const schema = Joi.object().keys({
  username: Joi.string().regex(/(^[a-zA-Z0-9_]+$)/).min(30).required(),
  password: Joi.string().min(10).required(),
});


router.get('/', (req, res) => {
  res.json({
    message: 'okey',
  });
});
router.post('/signup', (req, res, next) => {
  const result = Joi.validate(req.body, schema);
  if (result.error === null) {
    //
  } else {
    next(result.error);
  }
  res.json(result);
});
