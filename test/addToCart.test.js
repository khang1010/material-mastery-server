const { BadRequestError } = require("../src/core/error-response");
const cartModel = require("../src/models/cart.model");
const { createUserCart, getUserCart, updateProductQuantityInCart } = require("../src/models/repositories/cart");
const { findInventoryByProductId } = require("../src/models/repositories/inventory");

const { addToCart } = require('../src/services/cart.service')

jest.mock('../src/models/repositories/inventory', () => ({
    findInventoryByProductId: jest.fn(),
}))

jest.mock('../src/models/repositories/cart', () => ({
    getUserCart: jest.fn(),
    updateProductQuantityInCart: jest.fn(),
    createUserCart: jest.fn(),
}))

describe('addToCart', () => {
    beforeEach(() => {
        findInventoryByProductId.mockClear(),
        getUserCart.mockClear(),
        updateProductQuantityInCart.mockClear()
    })

    it('UTCID01', async () => {

        const payload = {
            userId: 1,
            product: {
                productId: 1,
                quantity: 5
            }
        }

        const inventory = {
            inventory_stock: 10
        }

        const userCart = {
            cart_count_products: 10
        }

        findInventoryByProductId.mockResolvedValueOnce(inventory)

        getUserCart.mockResolvedValueOnce(userCart)

        updateProductQuantityInCart.mockResolvedValueOnce({})

        jest.spyOn(cartModel, 'exists').mockReturnValue(Promise.resolve(true))

        await addToCart(payload)
        
        expect(jest.spyOn(cartModel, 'exists')).toHaveBeenCalledWith({
            cart_userId: payload.userId,
            'cart_products.productId': payload.product.productId,
            cart_state: 'active'
        })
        expect(updateProductQuantityInCart).toHaveBeenCalledWith(payload)
    })

    it('UTCID02', async () => {

        const payload = {
            userId: -1,
            product: {
                productId: 1,
                quantity: 5
            }
        }

        findInventoryByProductId.mockResolvedValueOnce(null)

        expect(addToCart(payload)).rejects.toThrow(new BadRequestError('Product not found'))
    })

    it('UTCID03', async () => {

        const payload = {
            userId: 1,
            product: {
                productId: 1,
                quantity: 10
            }
        }

        const inventory = {
            inventory_stock: 5
        }

        findInventoryByProductId.mockResolvedValueOnce(inventory)

        expect(addToCart(payload)).rejects.toThrow(new BadRequestError('Insufficient product inventory'))
    })

    it('UTCID04', async () => {

        const payload = {
            userId: 2,
            product: {
                productId: 1,
                quantity: 5
            }
        }

        const inventory = {
            inventory_stock: 10
        }

        findInventoryByProductId.mockResolvedValueOnce(inventory)

        getUserCart.mockResolvedValueOnce(null)

        await addToCart(payload)

        expect(createUserCart).toHaveBeenCalledWith(payload)
    })

    it('UTCID05', async () => {

        const payload = {
            userId: 3,
            product: {
                productId: 1,
                quantity: 5
            }
        }

        const inventory = {
            inventory_stock: 10
        }

        findInventoryByProductId.mockResolvedValueOnce(inventory)

        getUserCart.mockResolvedValueOnce({})

        await addToCart(payload)

        expect(createUserCart).toHaveBeenCalledWith(payload)
    })

    it('UTCID06', async () => {

        const payload = {
            userId: 1,
            product: {
                productId: 1,
                quantity: 5
            }
        }

        const inventory = {
            inventory_stock: 10
        }

        const userCart = {
            cart_count_products: 10
        }

        findInventoryByProductId.mockResolvedValueOnce(inventory)

        getUserCart.mockResolvedValueOnce(userCart)

        jest.spyOn(cartModel, 'exists').mockReturnValue(Promise.resolve(false))

        await addToCart(payload)

        expect(jest.spyOn(cartModel, 'exists')).toHaveBeenCalledWith({
            cart_userId: payload.userId,
            'cart_products.productId': payload.product.productId,
            cart_state: 'active'
        })
        expect(createUserCart).toHaveBeenCalledWith(payload)
    })
})