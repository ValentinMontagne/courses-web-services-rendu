const express = require("express");
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: '*',
}));

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Autorise toutes les origines
        methods: ["GET", "POST"], // Méthodes HTTP autorisées
        allowedHeaders: ["my-custom-header"], // En-têtes autorisés
        credentials: true // Autorise l'envoi de cookies via CORS
        // d'autres options...
    }
});



app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000')
})
io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});