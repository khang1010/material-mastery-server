'use strict';

const { Types } = require("mongoose");
const inventoryModel = require("../inventory.model");
const { convertToObjectId } = require("../../utils");

const createInventory = async({ productId, stock, location = 'unknown'}) => {
    return await inventoryModel.create({
        inventory_location: location,
        inventory_productId: new Types.ObjectId(productId),
        inventory_stock: stock
    })
}

const findInventoryByProductId = async (productId) => {
    return await inventoryModel.findOne({inventory_productId: new Types.ObjectId(productId)});
}

const updateInventoryByProductId = async (productId, quantity) => {
    return await inventoryModel.updateOne({inventory_productId: new Types.ObjectId(productId)}, {inventory_stock: quantity}, {new: true});
}

const reservationInventory = async ({productId, quantity, cartId}) => {
    const inventory = await inventoryModel.findOneAndUpdate({
        inventory_productId: convertToObjectId(productId),
        inventory_stock: {
            $gte: quantity
        }
    }, {
        $inc: {
            inventory_stock: -quantity
        }, $push: {
            inventory_reservations: {
                quantity,
                cartId,
                create_on: new Date()
            }
        }
    }, {new: true})
    
    return inventory;
}

const pullReservationInventory = async (productId, quantity) => {
    const inventory = await inventoryModel.findOneAndUpdate({
        inventory_productId: convertToObjectId(productId),
    }, {
        $inc: {
            inventory_stock: quantity
        }, $pop: {
            inventory_reservations: -1
        },
    }, {new: true})
    
    return inventory;
}

const updateInventoryStock = async (productId, quantity) => {
    const inventory = await inventoryModel.findOneAndUpdate({
        inventory_productId: convertToObjectId(productId),
    }, {
        $inc: {
            inventory_stock: quantity
        }
    }, {new: true})
    
    return inventory;
}

module.exports = {
    createInventory,
    findInventoryByProductId,
    updateInventoryByProductId,
    reservationInventory,
    updateInventoryStock,
    pullReservationInventory,
}