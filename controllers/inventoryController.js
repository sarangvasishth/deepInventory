const util = require("util");
const connection = require("../database/dbase");

const { isSet } = require("../src/helpers");
const { MAX_LENGTH_ITEM_NAME } = require("../src/constants");

const query = util.promisify(connection.query).bind(connection);

exports.addItems = async (req, res, next) => {
  const { item } = req.params;
  const { expiry, quantity } = req.body;

  if (item.length > MAX_LENGTH_ITEM_NAME) {
    return res
      .status(400)
      .json({ success: false, message: "Item name too long." });
  }
  if (!isSet(quantity)) {
    return res.status(400).json({
      success: false,
      message: "Quantity is missing in request.",
    });
  }
  if (!Number.isInteger(quantity) || quantity < 0) {
    return res
      .status(400)
      .json({ success: false, message: "Wrong input type for quantity." });
  }
  if (!isSet(expiry)) {
    return res
      .status(400)
      .json({ success: false, message: "Expiry time is missing in request." });
  }
  // if (!Number.isInteger(expiry) || expiry < 0) {
  //   return res
  //     .status(400)
  //     .json({ success: false, message: "Wrong input type for expiry." });
  // }

  try {
    const sqlQuery = `INSERT INTO inventory (item, quantity, expiry) VALUES ('${item}', ${quantity}, FROM_UNIXTIME(${expiry} * 0.001))`;
    const response = await query(sqlQuery);

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getItems = async (req, res, next) => {
  const response = {};
  const { item } = req.params;

  try {
    const sqlQuery = `Select sum(quantity), min(expiry) from inventory where expiry >= now(3) and quantity>0 and item='${item}';`;
    const row = await query(sqlQuery);

    if (isSet(row[0]["sum(quantity)"])) {
      response["quantity"] = row[0]["sum(quantity)"];
      response["validTill"] = new Date(row[0]["min(expiry)"]).getTime();
    } else {
      response["quantity"] = 0;
      response["validTill"] = null;
    }

    return res.status(200).json({
      success: true,
      data: { result: response },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.sellItems = async (req, res, next) => {
  const { item } = req.params;
  let { quantity } = req.body;

  if (!isSet(quantity)) {
    return res.status(400).json({
      success: false,
      message: "Quantity is missing in request.",
    });
  }
  if (!Number.isInteger(quantity) || quantity < 0) {
    return res
      .status(400)
      .json({ success: false, message: "Wrong input type for quantity." });
  }

  try {
    const countQuery = `Select sum(quantity) from inventory where expiry >= now(3) and item='${item}';`;
    const countResponse = await query(countQuery);

    let totalCount = countResponse[0]["sum(quantity)"];

    if (!isSet(totalCount)) {
      return res.status(400).json({
        success: false,
        message: "Item not available.",
      });
    }
    if (totalCount < quantity) {
      return res.status(400).json({
        success: false,
        message: "Ordered quantiy is higher than items in stock.",
      });
    }

    while (quantity > 0) {
      const getItemsQuery = `select * from inventory where quantity > 0 and expiry >= now(3) order by expiry limit 1`;
      const itemRow = await query(getItemsQuery);

      let itemCount = itemRow[0].quantity;
      let itemId = itemRow[0].idinventory;

      let updateItemCountQuery;
      if (itemCount >= quantity) {
        itemCount -= quantity;
        quantity = 0;
        updateItemCountQuery = `UPDATE inventory SET quantity=${itemCount}  WHERE  idinventory='${itemId}';`;
      } else {
        quantity -= itemCount;
        updateItemCountQuery = `UPDATE inventory SET quantity=0  WHERE  idinventory='${itemId}';`;
      }
      await query(updateItemCountQuery);
    }

    return res.status(200).json({
      success: true,
      data: { message: "Item successfully sold." },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
