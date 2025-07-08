const pool = require("./db/conexion");
const { encryptPassword } = require("./encrypt");

const encryptExistingPasswords = async () => {
  console.log("Iniciando encriptación de contraseñas existentes...");

  let connection;
  try {
    connection = await pool.getConnection();
    console.log("✅ Conexión a la base de datos establecida.");

    const [users] = await connection.query("SELECT id_usu, contrasena FROM usuarios");

    if (users.length === 0) {
      console.log("No se encontraron usuarios para encriptar.");
      return;
    }

    console.log(`Se encontraron ${users.length} usuarios. Encriptando...`);

    for (const user of users) {
      
      if (user.contrasena.startsWith("$2b$")) {
        console.log(`Skipping user ${user.id_usu}: la contraseña ya parece estar encriptada.`);
        continue;
      }

      const hashedPassword = await encryptPassword(user.contrasena);
      await connection.query(
        "UPDATE usuarios SET contrasena = ? WHERE id_usu = ?",
        [hashedPassword, user.id_usu]
      );
      console.log(`Contraseña para el usuario ${user.id_usu} encriptada y actualizada.`);
    }

    console.log("🎉 ¡Proceso completado! Todas las contraseñas han sido encriptadas.");
  } catch (error) {
    console.error("❌ Error durante el proceso de encriptación:", error);
  } finally {
    if (connection) {
      connection.release();
      console.log("🔌 Conexión a la base de datos liberada.");
    }
    pool.end();
  }
};

encryptExistingPasswords();