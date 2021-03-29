const express = require("express");
const router = express.Router();

const {
  addItems,
  getItems,
  sellItems,
} = require("../controllers/inventoryController");

router.route("/:item/add").post(addItems);
router.route("/:item/quantity").get(getItems);
router.route("/:item/sell").post(sellItems);

module.exports = router;
