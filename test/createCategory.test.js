const { create } = require('../src/services/category.service')
const { BadRequestError } = require("../src/core/error-response")
const { findByName, createCategory } = require("../src/models/repositories/category")

jest.mock('../src/models/repositories/category', () => ({
    findByName: jest.fn(),
    createCategory: jest.fn(),
}))

describe('create', () => {
    it('UTCID01', async () => {
        const payload = {
            name: 'wood'
        }

        findByName.mockResolvedValueOnce(null)
        createCategory.mockResolvedValueOnce(payload)
        const result = await create(payload)

        expect(result).toEqual(payload)
    })

    it('UTCID02', async () => {
        const payload = {
            name: 'iron'
        }

        findByName.mockResolvedValueOnce(payload)

        expect(create(payload)).rejects.toThrow(new BadRequestError('Category already exists'))
    })

    it('UTCID03', async () => {
        const payload = { name: '' }

        findByName.mockResolvedValueOnce(null)
        createCategory.mockResolvedValueOnce(null)

        expect(create(payload)).rejects.toThrow(new BadRequestError('Create category failed'))
    })
})