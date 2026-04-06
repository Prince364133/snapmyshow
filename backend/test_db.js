const mongoose = require('mongoose');
require('dotenv').config();

const testConn = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        // console.log(`URI: ${process.env.MONGODB_URI.split('@')[1]}`); // Log only the host part
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('SUCCESS: Connection established.');
        process.exit(0);
    } catch (err) {
        console.error('FAILURE: Connection failed.');
        console.error(err.message);
        process.exit(1);
    }
};

testConn();
