var express = require('express');
var router = express.Router();
const mysql = require("mysql2"); 
const CryptoJS = require("crypto-js");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

const connection = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "gridsock4",
  password: "gridsock4",
  database: "gridsock4"
});

// Testa anslutningen
connection.connect((err) => {
  if (err) {
    console.error("Fel vid anslutning till databasen:", err);
    return;
  }
  console.log("Anslutning till databasen lyckades!");
});



// --------------------- SKAPA USER TEST -------------------- //

app.post('/users', (req, res) => {
  const { name, password } = req.body;

  const sql = 'INSERT INTO users (name, password) VALUES (?, ?)';

  connection.query(sql, [name, password], (err, result) => {
      if (err) {
          console.log('err', err);
          res.status(500).json({error: 'Server error'});
      } else {
          console.log('User created:', result);
          res.status(201).json({message: 'User created successfully'});
      }
  })
});

// --------------------- SKAPA USER -------------------- //
/*
router.post("/gridsock4/users", (req, res) => {
  
  let name = req.body.name;       
  let password = req.body.password;
  let newUser = req.body;

  const encryptedPassword = CryptoJS.AES.encrypt(password, "secret key").toString();
    newUser.password = encryptedPassword;

  connection.connect((err) => {
    if(err) console.log("err", err);

    let query = "INSERT INTO users (id, name, password, score) VALUES (?, ?, ?, ?)"; 
    let values = [id, name, newUser.password, score];

        connection.query(query, values, (err, data) => {
            if(err) console.log("err", err);
            console.log("Ny användare tillagd:", newUser);
            res.json({message: "User sparad"});
        })
});
// Testa anslutningen
connection.connect((err) => {
  if (err) {
    console.error("Fel vid anslutning till databasen:", err);
    return;
  }
  console.log("Anslutning till databasen lyckades!");
});
});
*/
// ------------------- LOGGA IN USER ---------------------- //

router.post("/gridsock4/users/login", (req, res) => {
  const { name, password } = req.body;

  connection.query("SELECT * FROM users WHERE name = ?", [name], (err, results) => {
      if (err) {
          console.error("Error in database query:", err);
          return res.status(500).json({ message: "Database error" });
      }

      if (results.length === 0) {
          return res.status(401).json({ message: "User not found" });
      }

      const user = results[0];
      const decryptedPassword = CryptoJS.AES.decrypt(user.password, "secret key").toString(CryptoJS.enc.Utf8);

      if (decryptedPassword === password) {
          return res.json({ message: "Login successful" });
      } else {
          return res.status(401).json({ message: "Invalid credentials" });
      }
  });
});


// HÄMTA ALLA USERS

router.get("/users", (req, res) => {

  connection.connect((err) => {
      if(err) console.log("err", err);

      let query = "SELECT * FROM users";

      connection.query(query, (err, data) => {
          if(err) console.log("err", err);
          console.log("name", data);
          res.json(data);
      })
  })
})


module.exports = router;
