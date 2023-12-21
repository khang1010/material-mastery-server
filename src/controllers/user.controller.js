'use strict'

const { OkResponse } = require("../core/success-response");
const UserFactory = require("../services/user.service");

class UserController {
    static updateUser = async (req, res, next) => {
        new OkResponse({
            message: "Update user successfully",
            metadata: await UserFactory.updateUser(req.user.userId, req.params.user_id, req.body),
        }).send(res);
    }
    static getUserById = async (req, res, next) => {
        new OkResponse({
            message: "Get user successfully",
            metadata: await UserFactory.findUserById(req.user.userId),
        }).send(res);
    }
    static getUserByManager = async (req, res, next) => {
        new OkResponse({
            message: "Get user successfully",
            metadata: await UserFactory.findUserById(req.params.user_id),
        }).send(res);
    }
    static getNumberOfUsers = async (req, res, next) => {
        new OkResponse({
            message: "Get number of users successfully",
            metadata: await UserFactory.getNumberOfUsers(),
        }).send(res);
    }
    static getNumberOfCustomers = async (req, res, next) => {
        new OkResponse({
            message: "Get number of customers successfully",
            metadata: await UserFactory.getNumberOfCustomers(),
        }).send(res);
    }
    static getNumberOfStaffs = async (req, res, next) => {
        new OkResponse({
            message: "Get number of staffs successfully",
            metadata: await UserFactory.getNumberOfStaffs(),
        }).send(res);
    }
    static getNumberOfManagers = async (req, res, next) => {
        new OkResponse({
            message: "Get number of managers successfully",
            metadata: await UserFactory.getNumberOfManagers(),
        }).send(res);
    }
    static getAllUsers = async (req, res, next) => {
        new OkResponse({
            message: "Get users successfully",
            metadata: await UserFactory.getAllUsers(req.query, req.params.role),
        }).send(res);
    }
}

module.exports = UserController;