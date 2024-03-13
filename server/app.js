var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const app = require("express")();
const server = require("http").createServer(app);
var express = require("express");
let cors = require("cors");
const mysql = require("mysql2");
const CryptoJS = require("crypto-js");

const connection = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "gridsock4",
  password: "gridsock4",
  database: "gridsock4",
});

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const { connect } = require("http2");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/", indexRouter);
app.use("/users", usersRouter);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ------------------- 

// Skapa en mängd för att hålla reda på aktiva rum
const activeRooms = new Set();
// Skapa en Map för att hålla reda på aktiva användare och deras färger
const activeUsers = new Map();

// Hantera Socket.io-händelser när en användare ansluter
io.on("connection", (socket) => {
  io.emit("roomList", Array.from(activeRooms));
  console.log("connection", socket);

  let user;

  socket.on('login', (userName) => {
    getUserFromDatabase(userName, (userData) => {
      if (userData) {
        user = { name: userData.name, id: socket.id };
        activeUsers.set(userName, user);
        console.log(`${user.name} logged in with socket.id: ${socket.id}`);
        socket.emit('loggedIn', { name: user.name });
      } else {
        console.error(`User ${userName} not found in the database.`);
      }
    })
  });

  function getUserFromDatabase(userName, callback) {
    let query = 'SELECT * FROM users WHERE name = ?';
    connection.query(query, [userName], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        callback(null);
        return;
      }

      if (results.length > 0) {
        const user = results[0];
        callback(user);
      } else {
        callback(null);
      }
    });
  }

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

// Händelse när en användare skapar ett nytt rum
    socket.on('createRoom', (room) => {
    socket.join(room); // Anslut användaren till det nya rummet

    activeRooms.add(room); // Lägg till rummet i mängden av aktiva rum

    // Tilldela en slumpmässig färg åt användaren
    const userColor = getRandomColor();
    activeUsers.set(socket.id, { room: room, color: userColor });

    console.log(`${socket.id} created and joined room: ${room}`);
    // Skicka uppdaterad rumlista till alla anslutna klienter
    io.emit('roomList', Array.from(activeRooms));
});

  // Händelse när en användare skickar ett chattmeddelande
  socket.on('chat', (data) => {
    console.log('incoming chat', data);

    if (user) {
      io.to(data.room).emit('chat', {
        message: data.message,
        room: data.room,
        userId: user.name,
        color: user.color,
      });    

      // ----------------- START GAME ------------------- //

socket.on('startGame', () => {
  // Skicka signalen till andra användare i samma rum
  socket.to(currentRoom).emit('gameStarted');
});

// ---------------- END START GAME ----------------- //

    } else {
        console.error(`User ${socket.id} not found in activeUsers map.`);
    }
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
  socket.emit("roomList", Array.from(activeRooms));
});

// Funktion för att generera en slumpmässig hex-färgkod
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}










// --------------------- TESTAR SERVERN -------------------------- //
app.get("/test", (req, res) => {
  res.send("<h1>Socket</h1>");
});

// ---------------------- HÄMTA ALLA ANVÄNDARE ----------------------- //

app.get("/all-users", (req, res) => {
  connection.connect((err) => {
    if (err) console.log("err", err);

    let query = "SELECT * FROM users";

    connection.query(query, (err, data) => {
      if (err) console.log("err", err);

      console.log("users", data);

      res.json(data);
    });
  });
});

// ---------------------- SKAPA ANVÄNDARE ---------------------------- //

app.post("/users", (req, res) => {
  const { name, password } = req.body;
  const encryptedPassword = CryptoJS.SHA256(password).toString(
    CryptoJS.enc.Base64
  );

  const sql = "INSERT INTO users (name, password) VALUES (?, ?)";

  connection.query(sql, [name, encryptedPassword], (err, result) => {
    if (err) {
      console.log("err", err);
      res.status(500).json({ error: "Server error" });
    } else {
      console.log("User created:", result);
      res.status(201).json({ message: "User created successfully!" });
    }
  });
});

// ---------------------- LOGGA IN ANVÄNDARE --------------------------- //

app.post("/login", (req, res) => {
  const { name, password } = req.body;
  const encryptedPassword = CryptoJS.SHA256(password).toString(
    CryptoJS.enc.Base64
  );

  const sql = "SELECT * FROM users WHERE name = ? AND password = ?";

  connection.query(sql, [name, encryptedPassword], (err, result) => {
    if (err) {
      console.log("err", err);
      res.status(500).json({ error: "Server error" });
    } else {
      if (result.length > 0) {
        const user = result[0];
        res.json({ message: "Login successful", name: user.name });
      } else {
        res.status(401).json({ error: "Login failed" });
      }
    }
  });
});

module.exports = app;
server.listen(3000);
