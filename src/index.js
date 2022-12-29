import http from 'http';
import express from 'express';
import { Server } from 'socket.io';

import { publicDirectoryPath } from './paths.js';

const app = express();
const server = http.createServer(app); // Done behind the scenes
const io = new Server(server); // socket.io expects a raw http server

const port = process.env.PORT || 3000;

app.use(express.static(publicDirectoryPath));

let count = 0;

// server(emit) -> client (receive) - countUpdated
// client (emit) -> server (receive) - increment

io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    socket.emit('countUpdated', count)

    socket.on('increment', () => {
        count++;
        // socket.emit('countUpdated', count); // This one emits to the single connection
        io.emit('countUpdated', count); // This one emits to every single / all connections
    })
})

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})