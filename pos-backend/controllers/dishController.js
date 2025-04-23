const Dish = require('../models/dishModel');
const Category = require('../models/categoryModel'); // Needed to validate category existence

// @desc    Add a new dish
// @route   POST /api/dishes
// @access  Private (Admin) - Expects multipart/form-data
const addDish = async (req, res, next) => {
  try {
    // Data from form fields
    const { name, description, price, category } = req.body;
    // File path from multer
    const imageUrl = req.file ? `/uploads/dishes/${req.file.filename}` : null; // Store relative path

    // Basic validation
    if (!name || !price || !category) {
      res.status(400);
      throw new Error('Dish name, price, and category are required');
    }

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      res.status(400);
      throw new Error('Invalid category ID');
    }

    // Check if dish with the same name already exists in this category
    const dishExists = await Dish.findOne({ name, category });
    if (dishExists) {
        res.status(400);
        throw new Error(`Dish "${name}" already exists in category "${categoryExists.name}"`);
    }

    const dish = await Dish.create({
      name,
      description,
      price,
      category,
      imageUrl,
    });

    if (dish) {
      // Populate category details before sending response
      const populatedDish = await Dish.findById(dish._id).populate('category', 'name');
      res.status(201).json(populatedDish);
    } else {
      res.status(400);
      throw new Error('Invalid dish data');
    }
  } catch (error) {
    next(error); // Pass error to the global error handler
  }
};

// @desc    Get all dishes (optionally filter by category)
// @route   GET /api/dishes
// @route   GET /api/dishes?category=categoryId
// @access  Public
const getDishes = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) {
      // Validate category exists if filtering
      const categoryExists = await Category.findById(req.query.category);
       if (!categoryExists) {
         res.status(400);
         throw new Error('Invalid category ID for filtering');
       }
      filter.category = req.query.category;
    }

    const dishes = await Dish.find(filter).populate('category', 'name'); // Populate category name
    res.json(dishes);
  } catch (error) {
    next(error);
  }
};

// Add other potential controllers like getDishById, updateDish, deleteDish later if needed

module.exports = {
  addDish,
  getDishes,
};
