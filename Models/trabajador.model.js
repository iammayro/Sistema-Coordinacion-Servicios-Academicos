const mongoose = require('mongoose');

var TrabajadorSchema = new mongoose.Schema({
    codigo: {type: String, required: true, unique: true},
    nip: {type: String, required: true},
    tipo: {type: String, required: true},
    status: {type: String, required: true}
});

module.exports = mongoose.model('Trabajador', TrabajadorSchema);
