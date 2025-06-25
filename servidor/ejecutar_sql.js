const fs = require('fs').promises;
const path = require('path');
const pool = require('./db/conexion');

const carpetas = ['../Back-end/Procedimientos', '../Back-end/Triggers'];

// 🔧 Función que limpia los delimitadores para que sean compatibles con Node.js
function limpiarDelimitadores(sql) {
  return sql
    .replace(/DELIMITER\s+\$\$/g, '') // elimina "DELIMITER $$"
    .replace(/\$\$/g, ';')            // reemplaza "$$" por ";"
    .replace(/DELIMITER\s+\/\//g, '') // elimina "DELIMITER //"
    .replace(/\/\//g, ';')            // reemplaza "//" por ";"
    .replace(/DELIMITER\s*;/g, '')    // elimina "DELIMITER ;"
    .trim();
}

async function ejecutarScriptsSQL() {
  try {
    for (const carpeta of carpetas) {
      const rutaAbsoluta = path.resolve(__dirname, carpeta);
      const archivos = await fs.readdir(rutaAbsoluta);

      console.log(`📂 Ejecutando scripts en: ${carpeta}`);
      for (const archivo of archivos) {
        if (archivo.endsWith('.sql')) {
          const rutaArchivo = path.join(rutaAbsoluta, archivo);
          const contenidoOriginal = await fs.readFile(rutaArchivo, 'utf8');
          const contenidoLimpio = limpiarDelimitadores(contenidoOriginal);

          try {
            await pool.query(contenidoLimpio);
            console.log(`✅ Ejecutado: ${archivo}`);
          } catch (err) {
            console.error(`❌ Error en ${archivo}: ${err.message}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await pool.end();
  }
}

ejecutarScriptsSQL();

