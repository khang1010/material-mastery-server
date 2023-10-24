'use strict';

const { product } = require("../product.model");

const findProductByName = async (product_name) => {
    return await product.findOne({product_name}).lean();
}

module.exports = {
    findProductByName,
}