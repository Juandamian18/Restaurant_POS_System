const express = require("express");
const { addTable, getTables, updateTable, closeTable } = require("../controllers/tableController"); // Import closeTable
const router = express.Router();
const { isVerifiedUser } = require("../middlewares/tokenVerification")
 
router.route("/").post(isVerifiedUser , addTable);
router.route("/").get(isVerifiedUser , getTables);
router.route("/:id").put(isVerifiedUser , updateTable); // For updating status/linking order
router.route("/:id/close").patch(isVerifiedUser, closeTable); // Route to close table

module.exports = router;
