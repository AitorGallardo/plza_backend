const express = require('express');

const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const middlewares = require('./middlewares');
const logs = require('./api/logs');

const app = express();
app.use(morgan('common'));
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
}));
// parser json body
app.use(express.json());

console.log('HEHEHEHH', process.env.CORS_ORIGIN)

const url = 'mongodb+srv://pplza:plazadbconnectionagm1@plazadbtest-qhu6o.mongodb.net/local_library?retryWrites=true&w=majority';
mongoose.connect(url, {
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.get('/', (req, res) => {
  res.json({
    messsage: 'Hello World!',
  });
});

app.use('/api/logs', logs);


// not found err handler
app.use(middlewares.notFound);

// general err handler
app.use(middlewares.errorHandler);

const port = process.env.PORT || 1337;
app.listen(port, () => {
  console.log('Listen at http://localhost:1337');
});
