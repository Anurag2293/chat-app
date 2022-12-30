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


    /**
     * @function Join-Room
     */
    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options});

        if (error) {
            return callback(error);
        } 

        socket.join(user.room);

        socket.emit('message', generateMessage('Admin','Welcome')); // Send Message to newly connected user
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`)); 
        // Broadcasting message to other user
        io.to(user.room).emit('roomData', {
            room : user.room,
            users : getUsersInRoom(user.room)
        });

        callback();
    })

    /**
     * @function Send-Message
     * @listens message & checks profanity
     * @emits message to all users
     * @callback Acknowledgement if successfully sent message
     */
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed');
        }

        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback();
    })

    /**
     * @function Send_Location
     * @listens location
     * @emits locatioin to all users
     * @callback Acknowledgement if successfully sent location
     */
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, coords));
        callback();
    })

    /**
     * @function Disconnect-User
     */
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left!`));
            io.to(user.room).emit('roomData', {
                room : user.room,
                users : getUsersInRoom(user.room)
            });
        }
    })
})

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})