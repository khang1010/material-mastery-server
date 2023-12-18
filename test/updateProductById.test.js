const { BadRequestError, NotFoundError } = require("../src/core/error-response");
const commentModel = require("../src/models/comment.model");
const productModel = require("../src/models/product.model");
const { getAllCategoriesByFilter, getCategoryById } = require("../src/models/repositories/category");
const { updateInventoryByProductId, findInventoryByProductId } = require("../src/models/repositories/inventory");
const { createOrUpdateNotificationByType, checkProductExists, deleteProductInStaffNotification } = require("../src/models/repositories/notification");
const { updateProductById, getProductById, getAllProductsByUser, publishProduct, unPublishProduct, getNumberOfProducts, getNumberOfProductsByCategory, searchProductsByUser } = require("../src/models/repositories/product");
const { removeUndefinedObject, updateNestedObject } = require("../src/utils");

const { updateProductById: update } = require('../src/services/product.service')

jest.mock('../src/utils', () => ({
    removeUndefinedObject: jest.fn(),
    updateNestedObject: jest.fn()
}))

jest.mock('../src/models/repositories/product', () => ({
    updateProductById: jest.fn()
}))

jest.mock('../src/models/repositories/notification', () => ({
    checkProductExists: jest.fn(),
    deleteProductInStaffNotification: jest.fn(),
    createOrUpdateNotificationByType: jest.fn()
}))

jest.mock('../src/models/repositories/inventory', () => ({
    updateInventoryByProductId: jest.fn()
}))

describe('updateProductById', () => {

    beforeEach(() => {
        removeUndefinedObject.mockClear(),
        updateProductById.mockClear(),
        updateInventoryByProductId.mockClear(),
        checkProductExists.mockClear(),
        deleteProductInStaffNotification.mockClear(),
        updateNestedObject.mockClear()
    })

    it('UTCID01', async () => {
        const id = 1
        const payload = {
            _id: 1,
            _doc: 1,
            product_quantity: 6
        }

        removeUndefinedObject.mockResolvedValueOnce(payload)
        updateNestedObject.mockResolvedValueOnce(payload)
        updateProductById.mockResolvedValueOnce(payload)
        updateInventoryByProductId.mockResolvedValueOnce(payload)
        checkProductExists.mockResolvedValueOnce(true)
        deleteProductInStaffNotification.mockResolvedValueOnce({})

        const result = await update(id, payload)

        expect(result).toEqual(payload)
    })

    it('UTCID02', async () => {
        const id = 1
        const payload = {
            _id: 1,
            _doc: 1,
            product_quantity: 5
        }

        removeUndefinedObject.mockResolvedValueOnce(payload)
        updateNestedObject.mockResolvedValueOnce(payload)
        updateProductById.mockResolvedValueOnce(payload)
        updateInventoryByProductId.mockResolvedValueOnce(payload)
        createOrUpdateNotificationByType.mockResolvedValueOnce(payload)

        const result = await update(id, payload)

        expect(checkProductExists).not.toHaveBeenCalled()
        expect(deleteProductInStaffNotification).not.toHaveBeenCalled()
        expect(result).toEqual(payload)
    })

    it('UTCID03', async () => {
        const id = 1
        const payload = {
            _id: -1,
            _doc: 1,
            product_quantity: 6
        }

        removeUndefinedObject.mockResolvedValueOnce(payload)
        updateNestedObject.mockResolvedValueOnce(payload)
        updateProductById.mockResolvedValueOnce(payload)
        updateInventoryByProductId.mockResolvedValueOnce(payload)
        checkProductExists.mockResolvedValueOnce(false)

        const result = await update(id, payload)

        expect(deleteProductInStaffNotification).not.toHaveBeenCalled()
        expect(result).toEqual(payload)
    })

    it('UTCID04', async () => {
        const id = 1
        const payload = {
            _id: 1,
            _doc: 1
        }

        removeUndefinedObject.mockResolvedValueOnce(payload)
        updateNestedObject.mockResolvedValueOnce(payload)
        updateProductById.mockResolvedValueOnce(payload)

        const result = await update(id, payload)

        expect(updateInventoryByProductId).not.toHaveBeenCalled()
        expect(checkProductExists).not.toHaveBeenCalled()
        expect(deleteProductInStaffNotification).not.toHaveBeenCalled()
        expect(result).toEqual(payload)
    })

    it('UTCID05', async () => {
        const id = -1
        const payload = {
            _id: 1,
            _doc: 1,
            product_quantity: 6
        }

        removeUndefinedObject.mockResolvedValueOnce(payload)
        updateNestedObject.mockResolvedValueOnce(payload)
        updateProductById.mockResolvedValueOnce(null)

        expect(update(id, payload)).rejects.toThrow(new BadRequestError('Update product failed'))
    })
})