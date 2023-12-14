'use strict';

const { getSelectData, getSortAscending, getSortDescending } = require("../../utils");
const billModel = require("../bill.model");
const { getCategoryById } = require("./category");
const { getProductById } = require("./product");

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

const createExportBill = async ({
    bill_date = new Date(),
    bill_note = '',
    bill_type = 'export',
    tax = 0,
    customer = {},
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
        supplier: customer,
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

const getBillsByUser = async ({limit = 50, page = 1, sorted = ["_id"], filter = {}, select = [], isAscending = true}) => {
    // isAscending === 'true' ? console.log(">>>sort: ", getSortAscending(sorted)) : console.log(">>>sort: ", getSortDescending(sorted));
    return await billModel.find(filter)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(isAscending === 'true' ? getSortAscending(sorted) : getSortDescending(sorted))
    .select(getSelectData(select))
    .lean()
}

const getProductsInBill = async (product_list) => {
    return await Promise.all(product_list.map(async (product) => {
        const {productId, product_quantity, product_price} = product.item_products[0];
        const foundProduct = await getProductById(productId, ["createdAt", "updatedAt", "__v", "product_slug", "_id"])
        if (!foundProduct) throw new NotFoundError('Product not found')
        const foundCategory = await getCategoryById(foundProduct.product_categories[0], ["category_name"])
        return {
            product_category: foundCategory.category_name,
            product_name: foundProduct.product_name,
            quantity: product_quantity,
            product_unit: foundProduct.product_unit,
            product_price: product_price,
            totalPrice: product.priceApplyDiscount,
            productId: product.productId
        }
    }))
}

const calculateRevenueByTimeRange = async (startTime, endTime) => {
    const totalRevenue = await billModel.aggregate([
      {
        $match: {
          bill_date: {
            $gte: startTime.toDate(),
            $lt: endTime.toDate(),
          },
          bill_type: 'export'
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$bill_checkout.finalPrice' },
        },
      },
    ]);
    const totalImport = await billModel.aggregate([
        {
          $match: {
            bill_date: {
              $gte: startTime.toDate(),
              $lt: endTime.toDate(),
            },
            bill_type: 'import'
          },
        },
        {
          $group: {
            _id: null,
            totalImport: { $sum: '$bill_checkout.finalPrice' },
          },
        },
      ]);
      const revenue = totalRevenue.length ? totalRevenue[0].totalRevenue : 0;
      const profit = totalImport.length ? revenue - totalImport[0].totalImport : revenue;
    return {
        revenue,
        profit,
    };
};

const calculateNumberOfBillByType = async (type) => {
  const totalBills = await billModel.aggregate([
    {
      $match: {
        bill_type: type,
      },
    },
    {
      $group: {
        _id: null,
        totalBills: { $sum: 1 },
      },
    },
  ]);

  return totalBills.length ? totalBills[0].totalBills : 0;
};

module.exports = {
    createBill,
    deleteBillById,
    restoreBillById,
    getBillsByUser,
    getProductsInBill,
    createExportBill,
    calculateRevenueByTimeRange,
    calculateNumberOfBillByType,
}