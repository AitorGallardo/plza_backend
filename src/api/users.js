const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const authMiddlewares = require('../auth/middlewares');
const storage = require('../helpers/storage-connection');

const router = express.Router();

const userSchema = Joi.object().keys({
  username: Joi.string()
    .regex(/(^[a-zA-Z0-9_]+$)/)
    .min(2)
    .max(30),
  password: Joi.string()
    .trim()
    .min(10),
  mail: Joi.string().email({ tlds: { allow: true } }),
  image: Joi.string().regex(/.*\.(jpe?g|bmp|png)$/),
  description: Joi.string().max(80),
  instagram: Joi.string().max(30),
});
const adminSchema = Joi.object().keys({
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
    console.log('currentuser', req.user);

    const result = await User.find({}).select('username image -_id');
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id: user } = req.params;
    const [getLengths] = await User.aggregate([{ $match: { username: user } }, { $project: { nFollowers: { $size: '$followers' }, nFollowing: { $size: '$following' }, nEvents: { $size: '$events' } } }]);
    const { nFollowers, nFollowing, nEvents } = getLengths;

    const [foundUserDoc] = await User.find({ username: user }, '-_id -password -role -following -followers -events');
    const foundUser = foundUserDoc.toObject();

    const result = {
      ...foundUser,
      nFollowers,
      nFollowing,
      nEvents,
    };
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authMiddlewares.isLoggedIn, storage.upload.single('image'), async (req, res, next) => {
  try {
    const result = userSchema.validate(req.body);
    if (!result.error) {
      const userId = req.user.id;
      const user = await User.find({ _id: userId });
      if (user) {
        const updatedParams = req.body;
        if (updatedParams.password) {
          updatedParams.password = await bcrypt.hash(updatedParams.password, 12);
        }
        if (updatedParams.image) {
          await storage.googleBucket.upload(req.file.path, { gzip: true });
          updatedParams.image = `https://storage.googleapis.com/${storage.bucketName}/${req.file.filename}`;
        }
        const updatedUser = await User.findOneAndUpdate(userId, { $set: updatedParams }, { new: true });
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


// Admin endpoints
router.get('/su/', authMiddlewares.isLoggedIn, authMiddlewares.isAdmin, async (req, res, next) => {
  try {
    const result = await User.find({}, '-password');
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.patch('/su/:id', authMiddlewares.isLoggedIn, authMiddlewares.isAdmin, async (req, res, next) => {
  const { id: _id } = req.params;

  try {
    const result = adminSchema.validate(req.body);
    if (!result.error) {
      const query = { _id };
      const user = await User.find({ _id });
      if (user) {
        const updatedParams = req.body;
        if (updatedParams.password) {
          updatedParams.password = await bcrypt.hash(updatedParams.password, 12);
        }
        const updatedUser = await User.findOneAndUpdate(query, { $set: updatedParams }, { new: true });
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
