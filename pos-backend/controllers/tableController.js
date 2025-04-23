const Table = require("../models/tableModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose")

const addTable = async (req, res, next) => {
  try {
    const { tableNo, seats } = req.body;
    if (!tableNo) {
      const error = createHttpError(400, "Please provide table No!");
      return next(error);
    }
    const isTablePresent = await Table.findOne({ tableNo });

    if (isTablePresent) {
      const error = createHttpError(400, "Table already exist!");
      return next(error);
    }

    const newTable = new Table({ tableNo, seats });
    await newTable.save();
    res
      .status(201)
      .json({ success: true, message: "Table added!", data: newTable });
  } catch (error) {
    next(error);
  }
};

const getTables = async (req, res, next) => {
  try {
    // Populate the entire currentOrder object or at least its _id
    const tables = await Table.find().populate({
      path: "currentOrder",
      select: "_id customerDetails" // Select _id and customerDetails
    });
    res.status(200).json({ success: true, data: tables });
  } catch (error) {
    next(error);
  }
};

const updateTable = async (req, res, next) => {
  try {
    const { status, orderId } = req.body;

    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        const error = createHttpError(404, "Invalid id!");
        return next(error);
    }

    const table = await Table.findByIdAndUpdate(
        id,
      { status, currentOrder: orderId },
      { new: true }
    );

    if (!table) {
      const error = createHttpError(404, "Table not found!");
      return error;
    }

    res.status(200).json({success: true, message: "Table updated!", data: table});

  } catch (error) {
    next(error);
  }
};

// @desc    Close a table, finalize order, make table available
// @route   PATCH /api/table/:id/close
// @access  Private (User/Admin)
const closeTable = async (req, res, next) => {
    try {
        const { id } = req.params; // Table ID

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createHttpError(400, "Invalid table ID!"));
        }

        // Find the table and its current order
        const table = await Table.findById(id).populate('currentOrder');
        if (!table) {
            return next(createHttpError(404, "Table not found!"));
        }

        if (!table.currentOrder) {
            // If no current order, maybe just ensure it's available? Or return error?
            // For now, let's just make it available if it wasn't already.
             if (table.status !== "Available") {
                 table.status = "Available";
                 await table.save();
                 return res.status(200).json({ success: true, message: "Table already had no order, marked as Available.", data: table });
             }
             return res.status(200).json({ success: true, message: "Table already available and has no active order.", data: table });
        }

        const orderId = table.currentOrder._id;

        // Update the order status (e.g., to 'Completed')
        // You might want different statuses like 'Paid' depending on workflow
        const updatedOrder = await mongoose.model('Order').findByIdAndUpdate(
            orderId,
            { orderStatus: 'Completed', paymentMethod: req.body.paymentMethod || 'Cash' }, // Assume Cash if not specified, or handle payment properly
            { new: true }
        );

        if (!updatedOrder) {
             // This case is unlikely if the order existed, but handle defensively
             console.warn(`Order ${orderId} not found during table close for table ${id}, but proceeding to free table.`);
             // return next(createHttpError(404, "Associated order not found during close operation!"));
        } else {
             console.log(`Order ${orderId} status updated to Completed.`);
        }


        // Update the table: set status to Available and remove currentOrder link
        table.status = "Available";
        table.currentOrder = null; // Use null to unset the ObjectId reference
        const updatedTable = await table.save();

        res.status(200).json({ success: true, message: "Table closed, order finalized, table is now Available.", data: updatedTable });

    } catch (error) {
        next(error);
    }
};


module.exports = { addTable, getTables, updateTable, closeTable }; // Export new function
