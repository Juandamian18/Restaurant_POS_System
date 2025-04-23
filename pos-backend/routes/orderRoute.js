const express = require("express");
const { addOrder, getOrders, getOrderById, updateOrder, addItemsToExistingOrder } = require("../controllers/orderController"); // Import new controller
const { isVerifiedUser } = require("../middlewares/tokenVerification");
const router = express.Router();


router.route("/").post(isVerifiedUser, addOrder);
router.route("/").get(isVerifiedUser, getOrders);
router.route("/:id").get(isVerifiedUser, getOrderById);
router.route("/:id").put(isVerifiedUser, updateOrder); // Existing update (e.g., for status)
router.route("/:id/items").patch(isVerifiedUser, addItemsToExistingOrder); // New route for adding items

module.exports = router;
