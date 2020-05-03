const multer = require('multer');
const AppError = require('../Helpers/appError');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './Files/uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});



// Para imagenes
const multerStorage = multer.memoryStorage();
const multerFilterFile = (req, file, cb) => {
  if (file.mimetype.startsWith('application')) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Archivo invalido, ingresa un tipo de archivo valido (pdf, doc, odt, rar, etc)',
        400
      ),
      false
    );
  }
};
const multerFilterImage = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Archivo invalido, no es una imagen, por favor intentalo de nuevo',
        400
      ),
      false
    );
  }
};
exports.uploadFile = multer({
  storage: storage,
  fileFilter: multerFilterFile
});

exports.uploadImage = multer({
  storage: multerStorage,
  fileFilter: multerFilterImage
});

exports.uploadFileRam = multer({
  storage: multerStorage,
  fileFilter: multerFilterFile
});
