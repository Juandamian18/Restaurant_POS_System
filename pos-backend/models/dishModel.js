const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Dish name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Dish price is required'],
    min: [0, 'Price cannot be negative'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Reference to the Category model
    required: [true, 'Dish category is required'],
  },
  imageUrl: { // Optional: field for image URL
    type: String,
    trim: true,
  },
  // You could add more fields like 'isVegetarian', 'isSpicy', etc.
}, { timestamps: true });

// Ensure a dish name is unique within its category
dishSchema.index({ name: 1, category: 1 }, { unique: true });

const Dish = mongoose.model('Dish', dishSchema);

module.exports = Dish;
