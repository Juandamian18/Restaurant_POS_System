const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the storage directory
const storageDir = path.join(__dirname, '../uploads/dishes'); // Store in backend/uploads/dishes

// Ensure the storage directory exists
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageDir); // Save files to the specified directory
  },
  filename: (req, file, cb) => {
    // Create a unique filename: fieldname-timestamp.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images Only! (jpeg, jpg, png, gif, webp)'), false);
  }
};

// Configure multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: fileFilter
});

// Middleware for single image upload named 'image'
const uploadDishImage = upload.single('image'); // 'image' should match the form field name

module.exports = { uploadDishImage };
