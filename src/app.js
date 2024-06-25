const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { exec } = require('child_process'); // Import child_process module
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

        // Execute both Python scripts
        exec('python advertising_monitor.py', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing advertising_monitor.py: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`advertising_monitor.py stderr: ${stderr}`);
                return;
            }
            console.log(`advertising_monitor.py output: ${stdout}`);
        });

        exec('python process_tickets.py', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing process_tickets.py: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`process_tickets.py stderr: ${stderr}`);
                return;
            }
            console.log(`process_tickets.py output: ${stdout}`);
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
