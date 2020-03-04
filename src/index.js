const express = require('express');

const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')

const middlewares = require('./middlewares')  

const app = express();
app.use(morgan('common'))
app.use(helmet())
app.use(cors({
    origin: 'http://localhost:3000'
}))

app.get('/', (req, res)=>{
    res.json({
      messsage: 'Hello World!'  
    })
})

// not found err handler
app.use(middlewares.notFound)

// general err handler
app.use(middlewares.errorHandler)

const port = process.env.PORT || 1337;
app.listen(port, ()=>{
    console.log('Listen at http://localhost:1337');
})