const express = require('express');
const { addDish, getDishes } = require('../controllers/dishController');
const { isVerifiedUser } = require('../middlewares/tokenVerification');
const { uploadDishImage } = require('../middlewares/uploadMiddleware'); // Import upload middleware

const router = express.Router();

// Route to add a new dish (Protected, handles image upload)
router.post('/', isVerifiedUser, uploadDishImage, addDish); // Add upload middleware before controller

// Route to get all dishes (Public, allows filtering by category)
router.get('/', getDishes);

// Add other routes like GET /:id, PUT /:id, DELETE /:id later if needed

module.exports = router;
