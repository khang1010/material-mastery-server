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
}

module.exports = CheckoutController;