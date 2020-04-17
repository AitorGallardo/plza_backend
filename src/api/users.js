const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');

const User = require('../models/User');

const router = express.Router();

const schema = Joi.object().keys({
  username: Joi.string()
    .regex(/(^[a-zA-Z0-9_]+$)/)
    .min(2)
    .max(30),
  password: Joi.string()
    .trim()
    .min(10),
  role: Joi.string().valid('user', 'admin', 'mod'),
  active: Joi.bool(),
});

router.get('/', async (req, res, next) => {
  try {
    const result = await User.find({}, '-password');
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  const { id: _id } = req.params;

  try {
    const result = schema.validate(req.body);
    if (!result.error) {
      const query = { _id };
      const user = await User.find({ _id });
      if (user) {
        const updatedParams = req.body;
        if (updatedParams.password) {
          updatedParams.password = bcrypt.hash(updatedParams.password, 12);
        }
        const updatedUser = await User.findOneAndUpdate(query, { $set: updatedParams }, {new: true, lean: true});
        delete updatedUser.password;
        res.json(updatedUser);
      } else {
        next();
      }
    } else {
      res.status(422);
      throw new Error(result.error);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
