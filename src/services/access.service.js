'use strict';

const { ConflictError, BadRequestError } = require('../core/error-response');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const {
  createTokenPair,
  createOrUpdateKeyToken,
  removeByIdToken,
} = require('../models/repositories/keyToken');
const { user } = require('../models/user.model');
const UserFactory = require('./user.service');
const { findByEmailOrUsername } = require('../models/repositories/user');

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
  }) => {
    //check user exists
    const holderShop = await user
      .findOne({ $or: [{ username }, { phone }] })
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
    const userType = roles[0];
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
      user: newUser,
      tokenPair,
    };
  };

  static signIn = async ({ userInfo, password }) => {
    const foundUser = await findByEmailOrUsername(userInfo);
    if (!foundUser) throw new BadRequestError('User not found');
    const isMatch = await bcrypt.compare(password, (await foundUser).password);
    if (!isMatch) throw new BadRequestError('Wrong password');
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
      userId: (await foundUser)._id,
      username: foundUser.username,
      passwordHash: foundUser.password,
      email: foundUser.email,
      display_name: foundUser.display_name,
      phone: foundUser.phone,
      roles: foundUser.roles,
      user_attributes: foundUser.user_attributes
    }
    const tokenPair = await createTokenPair(
      payloadToken,
      publicKey,
      privateKey
    );
    if (!tokenPair) throw new BadRequestError('Create token pair failed');

    if (
      !(await createOrUpdateKeyToken(
        (
          await foundUser
        )._id,
        publicKey,
        privateKey,
        tokenPair.refreshToken
      ))
    )
      throw new BadRequestError('Create key token failed');

    return {
      user: foundUser,
      tokenPair,
    };
  }
  static signOut = async (keyStore) => {
    await removeByIdToken(keyStore._id);
    return {
      status: 200,
    }
  }
}

module.exports = AccessService;
