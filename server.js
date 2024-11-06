const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuración de sesiones
app.use(session({
  secret: 'mi-secreto',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Cambiar a true si usas HTTPS
}));

// Middleware para procesar datos de formularios
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos (CSS, JS, imágenes)
app.use(express.static('public'));

// Almacén de usuarios simple en memoria (para demo)
let usuarios = {};

// Ruta para la página de inicio de sesión
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Ruta de manejo de inicio de sesión
app.post('/login', (req, res) => {
  const { username } = req.body;
  if (!username || usuarios[username]) {
    return res.send('<h2>Nombre de usuario no válido o ya registrado.</h2>');
  }
  usuarios[username] = username;
  req.session.username = username;
  res.redirect('/chat');
});

// Ruta para la página de chat
app.get('/chat', (req, res) => {
  if (!req.session.username) {
    return res.redirect('/');
  }
  res.sendFile(__dirname + '/public/chat.html');
});

// Configuración de Socket.IO
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

// Inicio del servidor
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
