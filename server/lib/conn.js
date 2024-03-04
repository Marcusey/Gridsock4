const mysql = require("mysql2");


const connection = mysql.createConnection({
    host:"localhost",       
    port: "3306",
    user: "gridsock4",
    password: "gridsock4",
    database: "gridsock4"
});

module.exports = connection;

