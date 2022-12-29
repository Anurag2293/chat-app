import http from 'http';
import express from 'express';
import { Server } from 'socket.io';

import { publicDirectoryPath } from './paths.js';

const app = express();
const server = http.createServer(app); // Done behind the scenes
const io = new Server(server); // socket.io expects a raw http server

const port = process.env.PORT || 3000;

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    socket.emit('message', 'Welcome');
    socket.broadcast.emit('message', 'A new user has joined!');

    socket.on('sendMessage', (message) => {
        io.emit('message', message);
    })

    socket.on('sendLocation', ({ latitude, longitude }) => {
        io.emit('message', `https://google.com/maps?q=${latitude},${longitude}`)
    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user has left!')
    })
})

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})