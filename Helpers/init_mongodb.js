const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL, {
    dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('mongodb connected');
}).catch((error) => {
    console.log(error.message);
});

mongoose.connection.on('connected', () => {
    console.log('mongoose connected to DB');
});

mongoose.connection.on('error', (error) => {
    console.log(error.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('mongoose disconnected');
});

process.on('SIGINT', async() => {
    await mongoose.connection.close();
    process.exit(0);
});

