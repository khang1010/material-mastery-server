const { BadRequestError } = require("../src/core/error-response")
const { pullReservationInventory } = require("../src/models/repositories/inventory")
const { updateOrderById } = require("../src/models/repositories/order")
const ProductService = require("../src/services/product.service")

const { updateOrderStatusById } = require('../src/services/order.service')

jest.mock('../src/models/repositories/order', () => ({
    updateOrderById: jest.fn(),
}))

jest.mock('../src/models/repositories/inventory', () => ({
    pullReservationInventory: jest.fn(),
}))

describe('updateOrderStatusById', () => {

    beforeEach(() => {
        updateOrderById.mockClear(),
        pullReservationInventory.mockClear(),
        jest.spyOn(ProductService, 'updateProductById').mockClear()
    })

    it('UTCID01', async () => {
        const payload = {
            orderId: 1,
            status: 'cancelled',
            order_products: [
                {
                    item_products: [
                        {
                            productId: 1,
                            product_quantity: 5
                        }
                    ]
                },
                {
                    item_products: [
                        {
                            productId: 2,
                            product_quantity: 10
                        }
                    ]
                }
            ]
        }

        const updateInventory = {
            inventory_stock: 10
        }

        updateOrderById.mockResolvedValueOnce(payload)

        pullReservationInventory.mockResolvedValueOnce(updateInventory)
        pullReservationInventory.mockResolvedValueOnce(updateInventory)
        
        jest.spyOn(ProductService, 'updateProductById').mockResolvedValueOnce({})
        jest.spyOn(ProductService, 'updateProductById').mockResolvedValueOnce(null)

        expect(updateOrderStatusById(payload)).rejects.toThrow(new BadRequestError('Update product failed!!!'))
    })

    it('UTCID02', async () => {
        const payload = {
            orderId: -1,
            status: 'cancelled',
            order_products: [
                {
                    item_products: [
                        {
                            productId: 1,
                            product_quantity: 5
                        }
                    ]
                },
                {
                    item_products: [
                        {
                            productId: 2,
                            product_quantity: 10
                        }
                    ]
                }
            ]
        }

        updateOrderById.mockResolvedValueOnce(null)

        expect(pullReservationInventory).toHaveBeenCalledTimes(0)
        expect(jest.spyOn(ProductService, 'updateProductById')).toHaveBeenCalledTimes(0)
        expect(updateOrderStatusById(payload)).rejects.toThrow(new BadRequestError('Update order status failed'))
    })

    it('UTCID03', async () => {
        const payload = {
            orderId: 1,
            status: 'completed',
            order_products: [
                {
                    item_products: [
                        {
                            productId: 1,
                            product_quantity: 5
                        }
                    ]
                },
                {
                    item_products: [
                        {
                            productId: 2,
                            product_quantity: 10
                        }
                    ]
                }
            ]
        }

        updateOrderById.mockResolvedValueOnce(payload)

        const result = await updateOrderStatusById(payload)

        expect(pullReservationInventory).toHaveBeenCalledTimes(0)
        expect(jest.spyOn(ProductService, 'updateProductById')).toHaveBeenCalledTimes(0)
        expect(result).toEqual(payload)
    })

    it('UTCID04', async () => {
        const payload = {
            orderId: 1,
            status: 'cancelled',
            order_products: [
                {
                    item_products: [
                        {
                            productId: 1,
                            product_quantity: 5
                        }
                    ]
                },
                {
                    item_products: [
                        {
                            productId: -2,
                            product_quantity: 10
                        }
                    ]
                }
            ]
        }

        const updateInventory = {
            inventory_stock: 10
        }

        updateOrderById.mockResolvedValueOnce(payload)

        pullReservationInventory.mockResolvedValueOnce(updateInventory)
        pullReservationInventory.mockResolvedValueOnce(null)

        jest.spyOn(ProductService, 'updateProductById').mockResolvedValueOnce({})

        expect(updateOrderStatusById(payload)).rejects.toThrow(new BadRequestError('Update inventory failed!!!'))
    })
})
