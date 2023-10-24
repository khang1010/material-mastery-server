'use strict';

const { Types } = require("mongoose");
const inventoryModel = require("../inventory.model");

const createInventory = async({ productId, stock, location = 'unknown'}) => {
    return await inventoryModel.create({
        inventory_location: location,
        inventory_productId: new Types.ObjectId(productId),
        inventory_stock: stock
    })
}

module.exports = {
    createInventory,
}