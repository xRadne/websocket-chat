const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const users = {};

io.on('connection', (socket) => {
  socket.on('chat message', data => {
    const { message } = JSON.parse(data);
    io.emit('chat message', JSON.stringify({ message, senderId: socket.id }));
  });

  socket.on('update profile', data => {
    const { name } = data;
    users[socket.id].name = name;
    io.sockets.emit('users updated', users);
  });

  socket.on('disconnect', () => {
    io.sockets.emit('user disconnected', socket.id);
    delete users[socket.id];
  });

  users[socket.id] = {
    name: 'Anonymous ' + '(' + Math.floor(Math.random() * 100) + ')',
    color: '#' + Math.floor(Math.random() * 16777215).toString(16)
  };
  io.sockets.emit('users updated', users);
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
