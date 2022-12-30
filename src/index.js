import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import Filter from 'bad-words';

import { publicDirectoryPath } from './utils/paths.js';
import { generateMessage, generateLocationMessage } from './utils/messages.js';
import { addUser, removeUser, getUser, getUsersInRoom } from './utils/users.js';

const app = express();
const server = http.createServer(app); // Done behind the scenes
const io = new Server(server); // socket.io expects a raw http server

const port = process.env.PORT || 3000;

app.use(express.static(publicDirectoryPath));

/**
 * @function Connection contains listening and Emition functions 
 * @io refers to the server
 * @on for listening to the connection emition
 * @description Tells the server what to do when it gets a new connection
 * @callback socket_object Representing the new connection
 */
io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    socket.on('join', ({username, room}) => {
        socket.join(room);

        /**
         * @emits message to the newly connected user
         */
        socket.emit('message', generateMessage('Welcome'));
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`));

    })

    /**
     * @listens message & checks profanity
     * @emits message to all users
     * @callback Acknowledgement if successfully sent message
     */
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed');
        }

        io.to('NIT').emit('message', generateMessage(message));
        callback();
    })

    /**
     * @listens location
     * @emits locatioin to all users
     * @callback Acknowledgement if successfully sent location
     */
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