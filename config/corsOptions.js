
//help allow to run on glitch
const whitelist = [
   'https://dazzling-snickerdoodle-777101.netlify.app', 
    'http://127.0.0.1:3500', 
    'http://localhost:3000',
    'http://localhost:3500'
];
const corsOptions = {
    origin: (origin, callback) =>{
    if (whitelist.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
    } else {
        callback(new Error('Not Allowed By CORS'));
    }
}, optionSuccessStatus: 20
};

module.exports = corsOptions;