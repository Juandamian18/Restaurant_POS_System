const createHttpError = require("http-errors");
const Order = require("../models/orderModel");
const { default: mongoose } = require("mongoose");

const addOrder = async (req, res, next) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res
      .status(201)
      .json({ success: true, message: "Order created!", data: order });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(404, "Invalid id!");
      return next(error);
    }

    const order = await Order.findById(id);
    if (!order) {
      const error = createHttpError(404, "Order not found!");
      return next(error);
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate("table");
    res.status(200).json({ data: orders });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(404, "Invalid id!");
      return next(error);
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus },
      { new: true }
    );

    if (!order) {
      const error = createHttpError(404, "Order not found!");
      return next(error);
    }

    res
      .status(200)
      .json({ success: true, message: "Order updated", data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Add items to an existing order
// @route   PATCH /api/order/:id/items
// @access  Private (User/Admin)
const addItemsToExistingOrder = async (req, res, next) => {
  try {
    const { id } = req.params; // Order ID
    const { items, bills } = req.body; // New items and updated bill calculation from frontend

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(400, "Invalid order ID!");
      return next(error);
    }

    if (!Array.isArray(items) || items.length === 0) {
        const error = createHttpError(400, "Items array is required and cannot be empty.");
        return next(error);
    }
     if (!bills || typeof bills.total !== 'number' || typeof bills.tax !== 'number' || typeof bills.totalWithTax !== 'number') {
        const error = createHttpError(400, "Updated bill information is required.");
        return next(error);
    }

    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      const error = createHttpError(404, "Order not found!");
      return next(error);
    }

    // TODO: Add more robust checks? E.g., ensure order status allows adding items.

    // Append new items and update bills
    // $push appends to array, $set overwrites the bills object
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        $push: { items: { $each: items } }, // Add multiple items to the array
        $set: { bills: bills } // Overwrite the entire bills object
      },
      { new: true } // Return the updated document
    );

    if (!updatedOrder) {
         const error = createHttpError(500, "Failed to update order."); // Should ideally not happen if findById worked
         return next(error);
    }

    res.status(200).json({ success: true, message: "Items added to order", data: updatedOrder });

  } catch (error) {
    next(error);
  }
};


module.exports = { addOrder, getOrderById, getOrders, updateOrder, addItemsToExistingOrder }; // Export new function
