const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const startAdvertising = require('./advertise');
const startScanning = require('./scan');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/../public/index.html');
});

io.on('connection', (socket) => {
    console.log('Client connected');
    
    socket.on('startAdvertising', () => {
        startAdvertising(io);
    });

    socket.on('startScanning', () => {
        startScanning(io);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
