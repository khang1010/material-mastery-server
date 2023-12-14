const { createProduct: create } = require('../src/services/product.service')
const { findProductByName, createProduct } = require("../src/models/repositories/product")
const { createOrUpdateNotificationByType } = require("../src/models/repositories/notification")
const { BadRequestError } = require("../src/core/error-response")

jest.mock('../src/models/repositories/product', () => ({
    findProductByName: jest.fn(),
    createProduct: jest.fn(),
}))

jest.mock('../src/models/repositories/notification', () => ({
    createOrUpdateNotificationByType: jest.fn(),
}))

describe('createProduct', () => {
    beforeEach(() => {
        findProductByName.mockClear(),
        createProduct.mockClear(),
        createOrUpdateNotificationByType.mockClear()
    })

    it('UTCID01', async () => {
        const payload = { name: 'brick', product_quantity: 5 }

        findProductByName.mockResolvedValueOnce(null)
        createProduct.mockResolvedValueOnce({ ...payload, _id: 123 })
        createOrUpdateNotificationByType.mockResolvedValueOnce({})
        const result = await create(payload)

        expect(createOrUpdateNotificationByType).toHaveBeenCalledWith({
            type: "STAFF",
            content: "STAFF-001",
            option: { _id: 123, name: 'brick', product_quantity: 5, productId: 123 }
        })
        expect(result).toEqual({ _id: 123, name: 'brick', product_quantity: 5 })
    })

    it('UTCID02', async () => {
        const payload = { name: 'iron', product_quantity: 5 }

        findProductByName.mockResolvedValueOnce(payload)

        expect(create(payload)).rejects.toThrow(new BadRequestError('Product already exists'))
    })

    it('UTCID03', async () => {
        const payload = { name: 'brick', product_quantity: 0 }

        findProductByName.mockResolvedValueOnce(null)
        createProduct.mockResolvedValueOnce(null)

        expect(create(payload)).rejects.toThrow(new BadRequestError('Create product failed'))
    })

    it('UTCID04', async () => {
        const payload = { name: 'brick', product_quantity: 10 }

        findProductByName.mockResolvedValueOnce(null)
        createProduct.mockResolvedValueOnce({ ...payload, _id: 123 })

        const result = await create(payload)

        expect(createOrUpdateNotificationByType).not.toHaveBeenCalled()
        expect(result).toEqual({ _id: 123, name: 'brick', product_quantity: 10 })
    })
})