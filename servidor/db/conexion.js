const mysql = require("mysql2/promise");

// Las variables ahora se leen desde process.env
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true, // Solo si necesitas ejecutar múltiples queries a la vez
});

// Verificar conexión a la base de datos al iniciar
pool
  .getConnection()
  .then((connection) => {
    console.log("✅ Conectado a MySQL");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Error conectando a MySQL:", err.stack); // err.stack da más detalles
  });

module.exports = pool;
