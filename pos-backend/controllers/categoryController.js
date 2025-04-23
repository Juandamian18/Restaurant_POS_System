const Category = require('../models/categoryModel');

// @desc    Add a new category
// @route   POST /api/categories
// @access  Private (Admin)
const addCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Category name is required');
    }

    // Check if category already exists
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      res.status(400);
      throw new Error('Category already exists');
    }

    const category = await Category.create({ name });

    if (category) {
      res.status(201).json({
        _id: category._id,
        name: category.name,
      });
    } else {
      res.status(400);
      throw new Error('Invalid category data');
    }
  } catch (error) {
    next(error); // Pass error to the global error handler
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({});
        res.json(categories);
    } catch (error) {
        next(error);
    }
};


module.exports = {
  addCategory,
  getCategories,
};
