const {
    signUp
} = require('../src/services/access.service')
const { ConflictError, BadRequestError } = require('../src/core/error-response')
const {
    createTokenPair,
    createOrUpdateKeyToken
} = require('../src/models/repositories/keyToken')
const { user } = require('../src/models/user.model')
const UserFactory = require('../src/services/user.service')

const bcrypt = require('bcrypt');

jest.mock('../src/models/repositories/user', () => ({
    findByEmailOrUsername: jest.fn(),
}))
jest.mock('../src/models/repositories/keyToken', () => ({
    createTokenPair: jest.fn(),
    createOrUpdateKeyToken: jest.fn(),
}))

describe('signUp', () => {

    it('UTCID01', async () => {
        const userData = {
            username: 'quangduong',
            password: '123456789',
            email: 'quangduongptsc@gmail.com',
            display_name: 'Duong Quang',
            phone: '0334671287',
            user_attributes: { gender: 'male' }
        }

        jest.spyOn(user, 'findOne').mockReturnValue(Promise.resolve({}))

        user.findOne.mockImplementationOnce(() => ({
            lean: jest.fn().mockReturnValue(null),
        }))

        jest.spyOn(bcrypt, 'hash').mockReturnValue(Promise.resolve('123456789'))

        jest.spyOn(UserFactory, 'createUser').mockReturnValue(Promise.resolve(userData))

        const tokenPair = {
            accessToken: 'fakeAccessToken',
            refreshToken: 'fakeRefreshToken',
        }
        createTokenPair.mockResolvedValueOnce(tokenPair)

        createOrUpdateKeyToken.mockResolvedValueOnce(true)

        const result = await signUp({ userData })

        expect(result.user).toEqual(userData)
        expect(result.tokenPair).toEqual(tokenPair)
    })

    it('UTCID02', async () => {
        const userData = {
            username: 'manager012',
            password: '123456789',
            email: 'quangduongptsc@gmail.com',
            display_name: 'Duong Quang',
            phone: '0334671287',
            user_attributes: { gender: 'male' }
        }

        jest.spyOn(user, 'findOne').mockReturnValue(Promise.resolve(userData))

        user.findOne.mockImplementationOnce(() => ({
            lean: jest.fn().mockReturnValue(userData),
        }))

        expect(signUp({ userData })).rejects.toThrow(new ConflictError('User already exists'))
    })

    it('UTCID03', async () => {
        const userData = {
            username: 'quangduong',
            password: '02092003',
            email: 'abcdef',
            display_name: 'Quang Duong',
            phone: '8',
            user_attributes: { gender: 'male' }
        }

        jest.spyOn(user, 'findOne').mockReturnValue(Promise.resolve(null))

        user.findOne.mockImplementationOnce(() => ({
            lean: jest.fn().mockReturnValue(null),
        }))

        jest.spyOn(bcrypt, 'hash').mockReturnValue(Promise.resolve('123456789'))

        jest.spyOn(UserFactory, 'createUser').mockReturnValue(Promise.resolve(null))

        expect(signUp({ userData })).rejects.toThrow(new BadRequestError('Create user failed'))
    })

    it('UTCID04', async () => {
        const userData = {
            username: 'quangduong',
            password: '123456789',
            email: '21520751@gm.uit.edu.vn',
            display_name: 'Duong Quang',
            phone: '8',
            user_attributes: { gender: 'male' }
        }

        jest.spyOn(user, 'findOne').mockReturnValue(Promise.resolve(null))

        user.findOne.mockImplementationOnce(() => ({
            lean: jest.fn().mockReturnValue(null),
        }))

        jest.spyOn(bcrypt, 'hash').mockReturnValue(Promise.resolve('123456789'))

        jest.spyOn(UserFactory, 'createUser').mockReturnValue(Promise.resolve(userData))

        createTokenPair.mockResolvedValueOnce(null)

        expect(signUp({ userData })).rejects.toThrow(new BadRequestError('Create token pair failed'))
    })

    it('UTCID05', async () => {
        const userData = {
            username: 'quangduong',
            password: '123456789',
            email: 'abcdef',
            display_name: 'Quang Duong',
            phone: '8',
            user_attributes: { gender: 'male' }
        }

        jest.spyOn(user, 'findOne').mockReturnValue(Promise.resolve(null))

        user.findOne.mockImplementationOnce(() => ({
            lean: jest.fn().mockReturnValue(null),
        }))

        jest.spyOn(bcrypt, 'hash').mockReturnValue(Promise.resolve('123456789'))

        jest.spyOn(UserFactory, 'createUser').mockReturnValue(Promise.resolve(userData))

        const tokenPair = {
            accessToken: 'fakeAccessToken',
            refreshToken: 'fakeRefreshToken',
        }
        createTokenPair.mockResolvedValueOnce(tokenPair)

        createOrUpdateKeyToken.mockResolvedValueOnce(false)

        expect(signUp({ userData })).rejects.toThrow(new BadRequestError('Create key token failed'))
    })
})
