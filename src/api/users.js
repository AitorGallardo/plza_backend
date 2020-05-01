const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const authMiddlewares = require('../auth/middlewares');
const storage = require('../helpers/storage-connection');

const router = express.Router();
const imageRouter = express.Router({ mergeParams: true });

router.use('/:id/image', imageRouter);

const userSchema = Joi.object().keys({
  username: Joi.string()
    .regex(/(^[a-zA-Z0-9_]+$)/)
    .min(2)
    .max(30),
  password: Joi.string()
    .trim()
    .min(10),
  mail: Joi.string().email({ tlds: { allow: true } }),
  avatar: Joi.string().regex(/.*\.(jpe?g|bmp|png)$/),
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

    const result = await User.find({}).select('username avatar -_id');
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

router.patch('/:id', authMiddlewares.isLoggedIn, storage.upload.single('avatar'), async (req, res, next) => {
  try {
    const result = userSchema.validate(req.body.data);
    if (!result.error) {
      const userId = req.user.id;
      const user = await User.find({ _id: userId });
      if (user) {
        let updatedParams = JSON.parse(req.body.data);
        if (updatedParams.password) {
          updatedParams.password = await bcrypt.hash(updatedParams.password, 12);
        }
        if (req.file) {
          await storage.googleBucket.upload(req.file.path, { gzip: true });
          updatedParams = {
            ...updatedParams,
            avatar: `https://storage.googleapis.com/${storage.bucketName}/${req.file.filename}`,
          };
        }

        const updatedUser = await User.findOneAndUpdate({ _id: userId }, { $set: updatedParams }, { new: true }).select('description instagram username avatar -_id');
        res.json(updatedUser);
      } else {
        next();
      }
    } else {
      res.status(422);
      throw new Error(result.error);
    }
  } catch (error) {
    console.log('===>',error)
    next(error);
  }
});
imageRouter.patch('/', authMiddlewares.isLoggedIn, storage.upload.single('image'), async (req, res, next) => {
  try {
    const imageSchema = Joi.object().keys({ image: Joi.string().regex(/.*\.(jpe?g|bmp|png)$/) });
    const result = imageSchema.validate(req.body);
    if (!result.error) {
      const userId = req.user.id;
      const user = await User.find({ _id: userId });
      if (user) {
        await storage.googleBucket.upload(req.file.path, { gzip: true });
        const image = `https://storage.googleapis.com/${storage.bucketName}/${req.file.filename}`;
        const updatedImages = await User.findOneAndUpdate({ _id: userId }, { $push: { images: image } }, { new: true }).select('images -_id');
        res.json(updatedImages);
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
