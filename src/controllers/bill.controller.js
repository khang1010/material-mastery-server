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
    static createExportBill = async (req, res, next) => {
        new OkResponse({
            message: "Create export bill successfully",
            metadata: await BillService.createExportBill(req.body)
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
    static getAllExportBills = async (req, res, next) => {
        new OkResponse({
            message: "Get all export bills successfully",
            metadata: await BillService.getAllExportBill(req.query)
        }).send(res);
    }
    static getImportBillById = async (req, res, next) => {
        new OkResponse({
            message: "Get import bill successfully",
            metadata: await BillService.getImportBillById(req.params.id)
        }).send(res);
    }
    static getExportBillById = async (req, res, next) => {
        new OkResponse({
            message: "Get export bill successfully",
            metadata: await BillService.getExportBillById(req.params.id)
        }).send(res);
    }
    static calculateRevenue = async (req, res, next) => {
        new OkResponse({
            message: "Calculate revenue successfully",
            metadata: await BillService.calculateRevenueByTimeRange(req.query)
        }).send(res);
    }
    static getNumberOfBill = async (req, res, next) => {
        new OkResponse({
            message: "Get number of bill successfully",
            metadata: await BillService.getNumberOfBill()
        }).send(res);
    }
}

module.exports = BillController;