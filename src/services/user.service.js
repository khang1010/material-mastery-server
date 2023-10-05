'use strict';

const { BadRequestError } = require("../core/error-response");
const { user, customer, staff, manager } = require("../models/user.model");

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
}

class User {
    constructor({
        username, password, email, display_name, phone, status, roles, user_attributes
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

    static async createUser(id) {
        const newUser = await user.create({...this, _id: id});
        return newUser;
    }
}

class Customer extends User {
    static async createUser() {
        const newCustomer = await customer.create(this.user_attributes);
        if (!newCustomer) throw new BadRequestError("Error creating customer");

        const newUser = await super.createUser(newCustomer._id);
        if (!newUser) throw new BadRequestError("Error creating user");
        return newUser;
    }
}

class Staff extends User {
    static async createUser() {
        const newCustomer = await staff.create(this.user_attributes);
        if (!newCustomer) throw new BadRequestError("Error creating customer");

        const newUser = await super.createUser(newCustomer._id);
        if (!newUser) throw new BadRequestError("Error creating user");
        return newUser;
    }
}

class Manager extends User {
    static async createUser() {
        const newCustomer = await manager.create(this.user_attributes);
        if (!newCustomer) throw new BadRequestError("Error creating customer");

        const newUser = await super.createUser(newCustomer._id);
        if (!newUser) throw new BadRequestError("Error creating user");
        return newUser;
    }
}

UserFactory.registerUser('customer', Customer);
UserFactory.registerUser('staff', Staff);
UserFactory.registerUser('manager', Manager);

module.exports = UserFactory;