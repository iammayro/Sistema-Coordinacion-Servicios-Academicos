const Trabajador = require('../Models/trabajador.model');

module.exports.hola = async (req, res) => {
    try {
        const resp = await Trabajador.findById('5e5d6331e8cca8075b971c48');
        res.json({ok: true, resp});
    } catch (error) {
        res.json({ok: false, error});
    }
}

module.exports.getTrabajadores = async (req, res) => {
    try {
        const resp = await Trabajador.find();
        res.json({ok: true, resp});
    } catch (error) {
        res.json({ok: false, error});
    }
}