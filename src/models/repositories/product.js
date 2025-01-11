'use strict';

const { Types } = require('mongoose');
const {
  getUnSelectData,
  getSelectData,
  getSortAscending,
  getSortDescending,
} = require('../../utils');
const { product } = require('../product.model');
const { createInventory } = require('./inventory');
const { NotFoundError } = require('../../core/error-response');
const { cloudinaryUploader } = require('../../configs/config-cloudinary');
const { decodeBase64ForMulter } = require('../../configs/config-multer');
const {
  checkProductExists,
  deleteProductInStaffNotification,
  createOrUpdateNotificationByType,
} = require('./notification');

const findProductByName = async (product_name) => {
  return await product.findOne({ product_name }).lean();
};

const createProduct = async ({
  name,
  thumb = '',
  description = '',
  price,
  quantity,
  brand = 'empty',
  unit,
  categories,
  isDraft = false,
}) => {
  const newProduct = await product.create({
    product_name: name,
    product_thumb: thumb,
    product_description: description,
    product_price: price,
    product_quantity: quantity,
    product_brand: brand,
    product_unit: unit,
    product_categories: categories,
    isDraft: isDraft,
  });
  const newInventory = await createInventory({
    productId: newProduct._id,
    stock: newProduct.product_quantity,
  });
  return newProduct;
};
const createProductV2 = async ({
  name,
  description = '',
  price,
  quantity,
  brand = 'empty',
  unit,
  categories,
  isDraft = false,
  originalname,
  buffer,
}) => {
  const file = decodeBase64ForMulter(originalname, buffer).content;
  const uploadImageResult = await cloudinaryUploader.upload(file);
  let product_thumb = uploadImageResult.url;
  const newProduct = await product.create({
    product_name: name,
    product_thumb: product_thumb,
    product_description: description,
    product_price: price,
    product_quantity: quantity,
    product_brand: brand,
    product_unit: unit,
    product_categories: categories,
    isDraft: isDraft,
  });
  const newInventory = await createInventory({
    productId: newProduct._id,
    stock: newProduct.product_quantity,
  });
  return newProduct;
};

const getAllProduct = async () => {
  return await product.find().lean();
};

const updateProductById = async (productId, payload) => {
  return await product.findByIdAndUpdate(productId, payload, { new: true });
};

const deleteProductById = async (productId) => {
  return await product.findByIdAndDelete(productId);
};

const getProductById = async (productId, unSelect) => {
  return await product
    .findById(productId)
    .select(getUnSelectData(unSelect))
    .lean();
};

const getAllProductsByUser = async ({
  limit = 50,
  page = 1,
  sorted = ['_id'],
  filter = {},
  unSelect = [],
  isAscending = true,
}) => {
  // isAscending === 'true' ? console.log(">>>sort: ", getSortAscending(sorted)) : console.log(">>>sort: ", getSortDescending(sorted));
  return await product
    .find(filter)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(
      isAscending === 'true'
        ? getSortAscending(sorted)
        : getSortDescending(sorted)
    )
    .select(getUnSelectData(unSelect))
    .lean();
};

const publishProduct = async ({ id }) => {
  const foundProduct = await product.findById(id);
  if (!foundProduct) throw new NotFoundError('Product not found');
  foundProduct.isDraft = false;

  const { modifiedCount } = await foundProduct.updateOne(foundProduct);
  if (foundProduct.product_quantity <= 5) {
    await createOrUpdateNotificationByType({
      type: 'STAFF',
      content: 'STAFF-001',
      option: { productId: foundProduct._id },
    });
  }
  return modifiedCount;
};

const unPublishProduct = async ({ id }) => {
  const foundProduct = await product.findById(id);
  if (!foundProduct) throw new NotFoundError('Product not found');
  foundProduct.isDraft = true;

  const { modifiedCount } = await foundProduct.updateOne(foundProduct);
  if (
    await checkProductExists('STAFF', foundProduct._id.toString(), 'STAFF-001')
  ) {
    await deleteProductInStaffNotification(
      foundProduct._id.toString(),
      'STAFF-001'
    );
  }
  return modifiedCount;
};

const checkProductByServer = async (products) => {
  return await Promise.all(
    products.map(async (product) => {
      const foundProduct = await getProductById(product.productId, [
        'createdAt',
        'updatedAt',
        '__v',
        'product_slug',
        '_id',
      ]);
      if (!foundProduct) throw new NotFoundError('Product not found');
      return {
        product_price: foundProduct.product_price,
        product_quantity: product.quantity,
        productId: product.productId,
      };
    })
  );
};

const getNumberOfProducts = async (isDraft) => {
  const totalProducts = await product.aggregate([
    {
      $match: {
        isDraft: isDraft,
      },
    },
    {
      $group: {
        _id: null,
        totalBills: { $sum: 1 },
      },
    },
  ]);
  return totalProducts.length ? totalProducts[0].totalBills : 0;
};

const getNumberOfProductsByCategory = async (category, isDraft) => {
  const totalProducts = await product.aggregate([
    {
      $match: {
        isDraft: isDraft,
        product_categories: { $in: [category] },
      },
    },
    {
      $group: {
        _id: null,
        totalBills: { $sum: 1 },
      },
    },
  ]);
  return totalProducts.length ? totalProducts[0].totalBills : 0;
};

const searchProductsByUser = async ({ keySearch, isDraft = false }) => {
  const regexSearch = new RegExp(keySearch);
  return await product
    .find(
      {
        isDraft: isDraft || false,
        $text: {
          $search: regexSearch,
        },
      },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .lean();
};

module.exports = {
  findProductByName,
  createProduct,
  getAllProduct,
  updateProductById,
  deleteProductById,
  getProductById,
  getAllProductsByUser,
  publishProduct,
  unPublishProduct,
  checkProductByServer,
  getNumberOfProducts,
  getNumberOfProductsByCategory,
  searchProductsByUser,
  createProductV2,
};
