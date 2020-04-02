const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');

const User = require('../models/User');

const router = express.Router();

const schema = Joi.object().keys({
  username: Joi.string().regex(/(^[a-zA-Z0-9_]+$)/).min(2).max(30)
    .required(),
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
    User.findOne({
      username: req.body.username,
    }).then((user) => {
      // if user is undefined, username is not in the db, otherwise, duplicate user
      if (user) {
        const error = new Error('User already exist');
        next(error);
      } else {
        bcrypt.hash(req.body.password, 12).then((hashedPassword) => {          
          const userBody = {
            username: req.body.username,
            password: hashedPassword,
          };

          const newuser = new User(userBody);
          newuser.save().then((createdUser) => {
            res.json({ createdUser });
          });
        });
      }
    });
  } else {
    next(result.error);
  }
});

module.exports = router;
