'use strict';

const billModel = require("../bill.model");

const createBill = async ({
    bill_date = new Date(),
    bill_note = '',
    bill_type = 'import',
    tax = 0,
    supplier = {},
    product_list = [],
    bill_status = 'pending',
    bill_checkout = {},
    bill_payment = {},
    bill_address = {},
    bill_image = ''
}) => {
    return await billModel.create({
        bill_date,
        bill_note,
        bill_type,
        tax,
        supplier,
        product_list,
        bill_status,
        bill_checkout,
        bill_payment,
        bill_address,
        bill_image
    })
}

const deleteBillById = async (billId) => {
    return await billModel.findOneAndUpdate({ _id: billId }, {
        bill_status: 'deleted'
    }, {new: true})
}

const restoreBillById = async (billId) => {
    return await billModel.findOneAndUpdate({ _id: billId }, {
        bill_status: 'pending'
    }, {new: true})
}

module.exports = {
    createBill,
    deleteBillById,
    restoreBillById,
}