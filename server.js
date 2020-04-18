const mongoose = require('mongoose');
const dotenv = require('dotenv');

// en caso de algun error al momento de iniciar la aplicacion, se notifica el error en el
// log del sistema y se termina la ejecucion (se hace por buenas practicas)
process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  process.exit(1); // code 1 is for unhandled rejection, 0 means success
});

// configuracion de variables globales
dotenv.config({
  path: './.env'
});

// rutas de express
const app = require('./app');

// variable de coneccion de la base de datos
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(con => {
    // console.log(con.connections);
    console.log('Connection to mongo succesful');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});

// en caso de algun error al momento de no cachar una excepcion, se notifica el error en el
// log del sistema y se termina la ejecucion (se hace por buenas practicas)
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1); // code 1 is for unhandled rejection, 0 means success
  });
});
