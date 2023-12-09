'use strict';

const { OkResponse } = require("../core/success-response");
const CheckoutService = require("../services/checkout.service");

class CheckoutController {
    static checkoutReview = async (req, res, next) => {
        new OkResponse({
            message: "Checkout successfully",
            metadata: await CheckoutService.checkoutReview({...req.body, userId: req.user.userId})
        }).send(res);
    }
    static orderByUser = async (req, res, next) => {
        new OkResponse({
            message: "Order successfully",
            metadata: await CheckoutService.orderByUser({...req.body, userId: req.user.userId})
        }).send(res);
    }
    static calculateRevenue = async (req, res, next) => {
        new OkResponse({
            message: "Calculate revenue successfully",
            metadata: await CheckoutService.calculateRevenue(req.query.type)
        }).send(res);
    }
}

module.exports = CheckoutController;