var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mysql = require("mysql2");  

const { log } = require('console');
const CryptoJS = require("crypto-js");

const connection = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "gridsock4",
  password: "gridsock4",
  database: "gridsock4"
});



//const server = require('http').createServer(app);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Importera Socket.io-biblioteket och konfigurera det med CORS-inställningar
const io = require('socket.io')(server, {
  cors: {
      origin: '*',
      methods: ['GET', 'POST']
  }
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.locals.con = mysql.createConnection({  
  host: "localhost",  
  port: "3306",               // portens nr står i databasen högst upp
  user: "gridsock4",  
  password: "gridsock4",  
  database: "gridsock4"  
});  



// Skapa en enkel express-rutt för att visa att servern är igång
app.get('/test', (req, res) => {
  res.send('<h1>Socket</h1>');
});

// Skapa en mängd för att hålla reda på aktiva rum
const activeRooms = new Set();
// Skapa en Map för att hålla reda på aktiva användare och deras färger
const activeUsers = new Map();

// Hantera Socket.io-händelser när en användare ansluter
io.on('connection', (socket) => {
  console.log('connection', socket);

  // Händelse när en användare går med i ett rum
  socket.on('joinRoom', (room) => {
      socket.join(room); // Anslut användaren till rummet

      activeRooms.add(room); // Lägg till rummet i mängden av aktiva rum

      // Tilldela en slumpmässig färg åt användaren
      const userColor = getRandomColor();
      activeUsers.set(socket.id, { room: room, color: userColor });

      console.log(`${socket.id} joined room: ${room}`);
      // Skicka ett chattmeddelande till alla i rummet när en användare går med
      io.to(room).emit('chat', { message: `User ${socket.id} joined the room`, room: room, userId: socket.id });
      // Skicka uppdaterad rumlista till alla anslutna klienter
      io.emit('roomList', Array.from(activeRooms));
  });

  // Händelse när en användare skickar ett chattmeddelande
  socket.on('chat', (data) => {
      console.log('incoming chat', data);
      // Skicka chattmeddelandet till alla i rummet med användarens id och färg
      io.to(data.room).emit('chat', { message: data.message, room: data.room, userId: socket.id, color: activeUsers.get(socket.id).color });
  });

  // Händelse när en användare kopplar från
  socket.on('disconnect', () => {
      const disconnectedUser = activeUsers.get(socket.id);
      if (disconnectedUser) {
          console.log(`${socket.id} disconnected`);
          io.to(disconnectedUser.room).emit('chat', { message: `User ${socket.id} left the room`, room: disconnectedUser.room, userId: socket.id });
          activeUsers.delete(socket.id); // Ta bort användaren från aktiv användarlista vid frånkoppling
          io.emit('roomList', Array.from(activeRooms));
      }
  });
  // Skicka uppdaterad rumlista till den nyligen anslutna klienten
  socket.emit('roomList', Array.from(activeRooms));
});

// Funktion för att generera en slumpmässig hex-färgkod
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// server.listen(3000);
const port = process.env.PORT || 3000;
server.listen(port, () => {
console.log(`Server is running on port ${port}`);
});



module.exports = app;
