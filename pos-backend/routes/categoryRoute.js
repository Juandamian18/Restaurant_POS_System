const express = require('express');
const { addCategory, getCategories } = require('../controllers/categoryController');
const { isVerifiedUser } = require('../middlewares/tokenVerification'); // Correct import name

const router = express.Router();

// Route to add a new category (Protected, assuming only admins can add)
// You might need to add specific admin role verification middleware here
router.post('/', isVerifiedUser, addCategory); // Use correct middleware function

// Route to get all categories (Public)
router.get('/', getCategories);

module.exports = router;
