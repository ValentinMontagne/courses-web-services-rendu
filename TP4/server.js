const express = require("express");
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const port = 3000; 
const server = createServer(app);
const io = new Server(server);

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
