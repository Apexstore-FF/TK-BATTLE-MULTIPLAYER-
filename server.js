const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
const players = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
  const team = Object.keys(players).length % 2 === 0 ? 'red' : 'blue';
  players[socket.id] = { x: 100, y: 100, team };

  socket.emit('currentPlayers', players);
  socket.broadcast.emit('newPlayer', { id: socket.id, ...players[socket.id] });

  socket.on('move', (data) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      io.emit('playerMoved', { id: socket.id, x: data.x, y: data.y });
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
