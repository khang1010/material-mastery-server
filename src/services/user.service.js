'use strict';

const { BadRequestError, NotFoundError } = require('../core/error-response');
const { updateUserById, findUserById, getAllUsers } = require('../models/repositories/user');
const { user, customer, staff, manager } = require('../models/user.model');
const { removeUndefinedObject, updateNestedObject } = require('../utils');

class UserFactory {
  static userRegistry = {};

  static registerUser(type, classRef) {
    UserFactory.userRegistry[type] = classRef;
  }

  static async createUser(type, payload) {
    const classRef = UserFactory.userRegistry[type];
    if (!classRef) throw new BadRequestError(`Invalid user type: ${type}`);
    return new classRef(payload).createUser();
  }

  static async updateUser(signed_in_user_id, user_id, payload) {
    // console.log("updateUser", signed_in_user_id, user_id);
    if (signed_in_user_id !== user_id)
      throw new BadRequestError(`Forbidden Error`);
    const foundUser = await findUserById(user_id);
    if (!foundUser) throw new BadRequestError('User not found');

    const type = foundUser.roles[0];
    const classRef = UserFactory.userRegistry[type];
    if (!classRef) throw new BadRequestError(`Invalid user type: ${type}`);
    return new classRef(payload).updateUser(user_id);
  }

  static async findUserById(user_id) {
    const foundUser = await findUserById(user_id);
    if (!foundUser) throw new NotFoundError('User not found');
    return foundUser;
  }

  static async getNumberOfUsers() {
    const count = await user.countDocuments();
    return count;
  }

  static async getNumberOfCustomers() {
    const count = await customer.countDocuments();
    return count;
  }

  static async getNumberOfStaffs() {
    const count = await staff.countDocuments();
    return count;
  }

  static async getNumberOfManagers() {
    const count = await manager.countDocuments();
    return count;
  }

  static async getAllUsers(payload, role) {
    return await getAllUsers({...payload, filter: {roles: {$in: [role]}}});
  }
}

class User {
  constructor({
    username,
    password,
    email,
    display_name,
    phone,
    status,
    roles,
    user_attributes,
  }) {
    this.username = username;
    this.password = password;
    this.email = email;
    this.display_name = display_name;
    this.phone = phone;
    this.status = status;
    this.roles = roles;
    this.user_attributes = user_attributes;
  }

  async createUser(id) {
    const newUser = await user.create({ ...this, _id: id });
    return newUser;
  }

  async updateUser(user_id, payload) {
    const newUser = await updateUserById(user_id, user, payload);
    return newUser;
  }
}

class Customer extends User {
  async createUser() {
    const newCustomer = await customer.create(this.user_attributes);
    if (!newCustomer) throw new BadRequestError('Error creating customer');
    this.user_attributes = newCustomer;
    // console.log('>>>this.user_attributes', this.user_attributes);

    const newUser = await super.createUser(newCustomer._id);
    if (!newUser) throw new BadRequestError('Error creating user');
    return newUser;
  }

  async updateUser(user_id) {
    const payload = removeUndefinedObject(this);
    if (payload.user_attributes) {
      await updateUserById(
        user_id,
        customer,
        updateNestedObject(removeUndefinedObject(payload.user_attributes))
      );
    }

    const updateUser = await super.updateUser(
      user_id,
      updateNestedObject(payload)
    );
    return updateUser;
  }
}

class Staff extends User {
  async createUser() {
    const newCustomer = await staff.create(this.user_attributes);
    if (!newCustomer) throw new BadRequestError('Error creating staff user');
    this.user_attributes = newCustomer;

    const newUser = await super.createUser(newCustomer._id);
    if (!newUser) throw new BadRequestError('Error creating user');
    return newUser;
  }
  async updateUser(user_id) {
    const payload = removeUndefinedObject(this);
    if (payload.user_attributes) {
      await updateUserById(
        user_id,
        staff,
        updateNestedObject(removeUndefinedObject(payload.user_attributes))
      );
    }

    const updateUser = await super.updateUser(
      user_id,
      updateNestedObject(payload)
    );
    return updateUser;
  }
}

class Manager extends User {
  async createUser() {
    const newCustomer = await manager.create(this.user_attributes);
    if (!newCustomer) throw new BadRequestError('Error creating manager user');
    this.user_attributes = newCustomer;

    const newUser = await super.createUser(newCustomer._id);
    if (!newUser) throw new BadRequestError('Error creating user');
    return newUser;
  }
  async updateUser(user_id) {
    const payload = removeUndefinedObject(this);
    if (payload.user_attributes) {
      await updateUserById(
        user_id,
        manager,
        updateNestedObject(removeUndefinedObject(payload.user_attributes))
      );
    }

    const updateUser = await super.updateUser(
      user_id,
      updateNestedObject(payload)
    );
    return updateUser;
  }
}

UserFactory.registerUser('customer', Customer);
UserFactory.registerUser('staff', Staff);
UserFactory.registerUser('manager', Manager);

module.exports = UserFactory;
