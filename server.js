require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const {logger} = require('./middleware/logEvents');
const {errorHandler} = require('./middleware/errorHandler');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const PORT = process.env.port || 3500;

//Connect to MongoDB
connectDB();
// use data logger
app.use(logger);
// use cors options
app.use(cors(corsOptions));

// use express
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//create routes
app.use('/',express.static(path.join(__dirname, '/public')));

//set root route and states route
app.use('/', require('./routes/root'));
app.use('/states', require('./routes/api/states'));

//all other routes 
app.all( '*', (req,res) => { 
    res.status(404)
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname, 'views','404.html'));
    }else if(req.accepts('json')){
            res.json({error: '404 Not Found'});
    } else { res.type('text').send('404 Not Found')}
    
});

// user error handler
app.use(errorHandler);

// open mongoose connection for mondodb
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`server running on port ${PORT}`));
});