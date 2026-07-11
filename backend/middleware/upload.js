const multer = require('multer');
const path = require('path');
const fs = require('fs');

const dirs = ['uploads', 'uploads/thumbnails', 'uploads/lessons', 'uploads/assignments', 'uploads/profiles'];
dirs.forEach((d) => {
  const full = path.join(__dirname, '..', d);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads';
    if (file.fieldname === 'thumbnail') folder = 'uploads/thumbnails';
    else if (file.fieldname === 'video' || file.fieldname === 'pdfNotes' || file.fieldname === 'attachments') folder = 'uploads/lessons';
    else if (file.fieldname === 'submission') folder = 'uploads/assignments';
    else if (file.fieldname === 'photo') folder = 'uploads/profiles';
    cb(null, path.join(__dirname, '..', folder));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${unique}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  cb(null, true); // permissive; tighten as needed per module
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 25 * 1024 * 1024 } });

module.exports = upload;
