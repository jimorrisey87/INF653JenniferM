const mongoose = require('mongoose');
// set up db connection for mongoDB
const connectDB = async () => {

    try {
        await mongoose.connect(process.env.DATABASE_URI, { 
            useUnifiedTopology: true,
            useNewUrLParser: true
        });

    } catch (err) {
        logEvents(`${err.name}: ${err.message}`, 'errLog.txt');
    }
}

module.exports = connectDB;