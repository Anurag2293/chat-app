import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import Filter from 'bad-words';

import { publicDirectoryPath } from './utils/paths.js';
import { generateMessage, generateLocationMessage } from './utils/messages.js';

const app = express();
const server = http.createServer(app); // Done behind the scenes
const io = new Server(server); // socket.io expects a raw http server

const port = process.env.PORT || 3000;

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    socket.emit('message', generateMessage('Welcome'));
    socket.broadcast.emit('message', generateMessage('A new user has joined!'));

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed');
        }

        io.emit('message', generateMessage(message));
        callback();
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left!'))
    })
})

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})