const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = new Server(server);


app.use(session({
  secret: 'mi-secreto',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));


app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static('public'));


let usuarios = {};


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});


app.post('/login', (req, res) => {
  const { username } = req.body;
  if (!username || usuarios[username]) {
    return res.send('<h2>Nombre de usuario no válido o ya registrado.</h2>');
  }
  usuarios[username] = username;
  req.session.username = username;
  res.redirect('/chat');
});


app.get('/chat', (req, res) => {
  if (!req.session.username) {
    return res.redirect('/');
  }
  res.sendFile(__dirname + '/public/chat.html');
});


io.on('connection', (socket) => {
  console.log('Usuario conectado');

  socket.on('chat message', (data) => {
    console.log(`Mensaje de ${data.user}: ${data.message}`);
    io.emit('chat message', data);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});


const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
