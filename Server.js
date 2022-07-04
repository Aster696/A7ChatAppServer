const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const createError = require('http-errors');
const path = require('path');

const UserRoutes = require('./Routes/UserRoutes');
const MessageRoutes = require('./Routes/MessageRoutes');
const AdminRoutes = require('./Routes/AdminRoutes');
const MailRoutes = require('./Mail/gmail');


const PORT = process.env.PORT || 5700;

require('dotenv').config();
require('./Helpers/init_mongodb');

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'Files')));

app.use('/user', UserRoutes);
app.use('/chat', MessageRoutes);
app.use('/admin', AdminRoutes);
app.use('/mail', MailRoutes);

const server = app.listen(PORT, () => {
    console.log(`Server running on PORT --> ${PORT}`);
});

app.get('/', async (req, res, next) => {
    res.send("Hello from express")
});

app.use(async (req, res, next) => {
    next(createError.NotFound('Route not found'))
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status || 500,
            message: err.message,
        }
    })
});

const io = require('socket.io')(server, {
    cors: {
        origin: process.env.CLI_URL
    }
});

io.on('connection', onConnect);

let socketConnected = new Set();

function onConnect(socket) {
    console.log('new Connection -> '+ socket.id);
    socketConnected.add(socket.id);

    socket.emit('client-total', socketConnected.size);

    socket.on('joinRoom', (data) => {
        const room1 = data.userId + data.friendId;
        const room2 = data.friendId + data.userId;
        socket.join(room1 || room2);

        socket.on('message', (data) => {
            io.to(room1).emit('message', data);
            io.to(room2).emit('message', data);
        });

        socket.on('videoCall', (data) => {
            io.emit('videoCall', data);
        })
    
        socket.on('feedback', (data) => {
            console.log(data);
            io.to(room2).emit('feedback', data);
        })
    })

    socket.on('user-status', (data) => {
        console.log(data);
        io.emit('user-status', data);
    });

    socket.on('disconnect', (data) => {
        console.log('user disconnected Id -> ' + socket.id);
        socketConnected.delete(socket.id);
        socket.emit('user-status', false);
        socket.emit('client-total', socketConnected.size);
    });
}