const mysql = require("mysql2/promise");
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3001,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true 
});


pool
  .getConnection()
  .then((connection) => {
    console.log("✅ Conectado a MySQL");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Error conectando a MySQL:", err.stack); 
  });

module.exports = pool;
