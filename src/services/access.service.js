'use strict';

const { ConflictError, BadRequestError } = require('../core/error-response');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const {
  createTokenPair,
  createOrUpdateKeyToken,
} = require('../models/repositories/keyToken');
const { user } = require('../models/user.model');
const UserFactory = require('./user.service');

class AccessService {
  static signUp = async ({
    username,
    password,
    email,
    display_name,
    phone,
    user_attributes,
    status = 'inactive',
    roles = ['customer'],
    userType = 'customer',
  }) => {
    //check user exists
    const holderShop = await user
      .findOne({ $or: [{ email }, { username }, { phone }] })
      .lean();
    if (holderShop) throw new ConflictError('User already exists');
    //Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    //Create new user
    const payload = {
      username,
      password: passwordHash,
      email,
      display_name,
      phone,
      status,
      roles,
      user_attributes
    };
    const newUser = await UserFactory.createUser(userType, payload);
    if (!newUser) throw new BadRequestError('Create user failed');

    //create private and public key
    const { privateKey, publicKey } = await crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
    });
    //create token pair
    const payloadToken = {
      userId: (await newUser)._id,
      username,
      passwordHash,
      email,
      display_name,
      phone,
      roles,
      user_attributes
    };
    const tokenPair = await createTokenPair(
      payloadToken,
      publicKey,
      privateKey
    );
    if (!tokenPair) throw new BadRequestError('Create token pair failed');

    if (
      !(await createOrUpdateKeyToken(
        (
          await newUser
        )._id,
        publicKey,
        privateKey,
        tokenPair.refreshToken
      ))
    )
      throw new BadRequestError('Create key token failed');

    return {
      shop: newUser,
      tokenPair,
    };
  };
}

module.exports = AccessService;
