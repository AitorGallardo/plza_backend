const express = require('express');

const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const middlewares = require('./middlewares');
const authMiddlewares = require('./auth/middlewares');
const auth = require('./auth/index');
const logs = require('./api/logs');
const event = require('./api/event');
const users = require('./api/users');

const app = express();
app.use(morgan('common'));
app.use(helmet());
// const corsWhiteList = [process.env.CORS_ORIGIN, process.env.CORS_CLIENT];
// {
//   origin: corsWhiteList,
// }
app.use(cors());


// parser json body
app.use(express.json());
app.use(authMiddlewares.checkTokenSendUser);

mongoose.connect(process.env.DATABASE_ATLAS_URL, {
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.get('/', (req, res) => {
  res.json({
    messsage: '🏀',
    user: req.user,
  });
});

app.use('/auth', auth);
app.use('/api/logs', logs);
app.use('/api/event', event);
app.use('/api/users', authMiddlewares.isLoggedIn, authMiddlewares.isAdmin, users);


// not found err handler
app.use(middlewares.notFound);

// general err handler
app.use(middlewares.errorHandler);

const port = process.env.PORT || 1337;
app.listen(port, () => {
  console.log('Listen at http://localhost:1337');
});
