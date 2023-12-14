const {
    signIn
} = require('../src/services/access.service')
const { BadRequestError } = require('../src/core/error-response')
const { findByEmailOrUsername } = require('../src/models/repositories/user')
const {
    createTokenPair,
    createOrUpdateKeyToken
} = require('../src/models/repositories/keyToken')

const bcrypt = require('bcrypt');

jest.mock('../src/models/repositories/user', () => ({
    findByEmailOrUsername: jest.fn(),
}))
jest.mock('../src/models/repositories/keyToken', () => ({
    createTokenPair: jest.fn(),
    createOrUpdateKeyToken: jest.fn(),
}))

describe('signIn', () => {
    it('UTCID01', async () => {
        const userInfo = 'manager012'
        const password = '123456789'

        const foundUser = {
            _id: '123',
            username: 'manager012',
            password: await bcrypt.hash('123456789', 10)
        }
        findByEmailOrUsername.mockResolvedValueOnce(foundUser)

        const tokenPair = {
            accessToken: 'fakeAccessToken',
            refreshToken: 'fakeRefreshToken',
        }
        createTokenPair.mockResolvedValueOnce(tokenPair)

        createOrUpdateKeyToken.mockResolvedValueOnce(true)

        const result = await signIn({ userInfo, password })

        expect(result.user).toEqual(foundUser)
        expect(result.tokenPair).toEqual(tokenPair)

    })

    it('UTCID02', async () => {
        const userInfo = 'manager01'
        const password = '123456789'

        const foundUser = null
        findByEmailOrUsername.mockResolvedValueOnce(foundUser)

        expect(signIn({ userInfo, password })).rejects.toThrow(new BadRequestError('User not found'))
    })

    it('UTCID03', async () => {
        const userInfo = 'manager012'
        const password = '12345678'

        const foundUser = {
            _id: '123',
            username: 'manager012',
            password: await bcrypt.hash('123456789', 10)
        }
        findByEmailOrUsername.mockResolvedValueOnce(foundUser)

        expect(signIn({ userInfo, password })).rejects.toThrow(new BadRequestError('Wrong password'))
    })

    it('UTCID04', async () => {
        const userInfo = 'manager012'
        const password = '123456789'

        const foundUser = {
            _id: '123',
            username: 'manager012',
            password: await bcrypt.hash('123456789', 10)
        }
        findByEmailOrUsername.mockResolvedValueOnce(foundUser)

        createTokenPair.mockResolvedValueOnce(null)

        expect(signIn({ userInfo, password })).rejects.toThrow(new BadRequestError('Create token pair failed'))
    })

    it('UTCID05', async () => {
        const userInfo = 'manager012'
        const password = '123456789'

        const foundUser = {
            _id: '123',
            username: 'manager012',
            password: await bcrypt.hash('123456789', 10)
        }
        findByEmailOrUsername.mockResolvedValueOnce(foundUser)

        const tokenPair = {
            accessToken: 'fakeAccessToken',
            refreshToken: 'fakeRefreshToken',
        }
        createTokenPair.mockResolvedValueOnce(tokenPair)

        createOrUpdateKeyToken.mockResolvedValueOnce(false)

        expect(signIn({ userInfo, password })).rejects.toThrow(new BadRequestError('Create key token failed'))
    })
})
