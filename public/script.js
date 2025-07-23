const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const players = {};
let myId = null;

const keys = { w: false, a: false, s: false, d: false };

document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

socket.on('currentPlayers', (data) => {
  myId = socket.id;
  Object.assign(players, data);
});

socket.on('newPlayer', (data) => {
  players[data.id] = data;
});

socket.on('playerMoved', (data) => {
  if (players[data.id]) {
    players[data.id].x = data.x;
    players[data.id].y = data.y;
  }
});

socket.on('playerDisconnected', (id) => {
  delete players[id];
});

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const id in players) {
    const p = players[id];
    ctx.fillStyle = p.team === 'red' ? 'red' : 'blue';
    ctx.fillRect(p.x, p.y, 30, 30);
  }

  if (players[myId]) {
    let p = players[myId];
    if (keys.w) p.y -= 2;
    if (keys.s) p.y += 2;
    if (keys.a) p.x -= 2;
    if (keys.d) p.x += 2;

    socket.emit('move', { x: p.x, y: p.y });
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
