const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('disconnect', () => console.log('Client disconnected'));
});

function runPythonScript(scriptFilename, callback) {
    const scriptPath = path.join(__dirname, 'src', scriptFilename);
    exec(`python3 ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing ${scriptFilename}: ${error.message}`);
            return callback(error);
        }
        if (stderr) {
            console.error(`${scriptFilename} stderr: ${stderr}`);
            return callback(stderr);
        }
        console.log(`${scriptFilename} output: ${stdout}`);
        callback(null, stdout);
    });
}

// Start running Python scripts as soon as the server starts
runPythonScript('process_tickets.py', (err, output) => {
    if (!err) {
        console.log('process_tickets.py successfully executed. Output:');
        console.log(output);
    }
});

runPythonScript('advertising_monitor.py', (err, output) => {
    if (!err) {
        console.log('advertising_monitor.py successfully executed. Output:');
        console.log(output);
    }
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
