const multer = require('multer');
const path = require('path');
const fs = require('fs');

const dir = path.join(__dirname, '../uploads/sites');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: dir,
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + file.originalname.replace(/\s+/g,'-');
    cb(null, unique);
  }
});

const upload = multer({ storage });

module.exports = { upload };
