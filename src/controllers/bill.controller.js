'use strict';

const { OkResponse } = require("../core/success-response");
const BillService = require("../services/bill.service");

class BillController {
    static createImportBill = async (req, res, next) => {
        new OkResponse({
            message: "Create import bill successfully",
            metadata: await BillService.createImportBill(req.body)
        }).send(res);
    }
    static deleteBill = async (req, res, next) => {
        new OkResponse({
            message: "Delete bill successfully",
            metadata: await BillService.deleteBillById(req.params.id)
        }).send(res);
    }
    static restoreBill = async (req, res, next) => {
        new OkResponse({
            message: "Restore bill successfully",
            metadata: await BillService.restoreBill(req.params.id)
        }).send(res);
    }
    static getAllImportBills = async (req, res, next) => {
        new OkResponse({
            message: "Get all import bills successfully",
            metadata: await BillService.getAllImportBill(req.query)
        }).send(res);
    }
    static getImportBillById = async (req, res, next) => {
        new OkResponse({
            message: "Get import bill successfully",
            metadata: await BillService.getImportBillById(req.params.id)
        }).send(res);
    }
}

module.exports = BillController;