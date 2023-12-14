const { getProductById: get } = require('../src/services/product.service')
const { getAllCategoriesByFilter } = require("../src/models/repositories/category")
const { getProductById } = require("../src/models/repositories/product")
const { NotFoundError } = require("../src/core/error-response")

jest.mock('../src/models/repositories/category', () => ({
    getAllCategoriesByFilter: jest.fn()
}))

jest.mock('../src/models/repositories/product', () => ({
    getProductById: jest.fn()
}))

describe('getProductById', () => {
    beforeEach(() => {
        getAllCategoriesByFilter.mockClear(),
        getProductById.mockClear()
    })

    it('UTCID01', async () => {
        const productId = 1
        const product = {
            _id: 1,
            name: 'wood',
            product_categories: [1, 2]
        }
        const categories = [
            {
                _id: 1,
                category_name: 'category 1'
            },
            {
                _id: 2,
                category_name: 'category 2'
            }
        ]
        getProductById.mockResolvedValueOnce(product)
        getAllCategoriesByFilter.mockResolvedValueOnce(categories)

        const result = await get(productId)
        expect(result).toEqual({...product, product_categories: categories})
    })

    it('UTCID02', async () => {
        const productId = 2
        
        getProductById.mockResolvedValueOnce(null)

        expect(get(productId)).rejects.toThrow(new NotFoundError('Product not found'))
    })

    it('UTCID03', async () => {
        const productId = 3
        const product = {
            _id: 3,
            name: 'steel',
            product_categories: [1, 2]
        }
        
        getProductById.mockResolvedValueOnce(product)
        getAllCategoriesByFilter.mockResolvedValueOnce(null)

        expect(get(productId)).rejects.toThrow(new NotFoundError('Product category not found'))
    })
})