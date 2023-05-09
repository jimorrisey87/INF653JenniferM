const mongoose = require('mongoose');
// set up db connection for mongoDB
const connectDB = async () => {

    try {
        await mongoose.connect(process.env.DATABASE_URI, { 
            useUnifiedTopology: true,
            useNewUrLParser: true
        });

    } catch (err) {
        console.error(err);
    }
}

module.exports = connectDB;