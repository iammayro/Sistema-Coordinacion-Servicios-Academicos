const express = require('express');
const app = express();

// Cargar las variables de entorno
require('dotenv').config();
 
app.get('/', function (req, res) {
  res.send('Hello World');
})

// Correr el puerto
app.listen(process.env.PORT, function() {
    console.log(`[status] API Corriendo en el puerto ${process.env.PORT}`);
});