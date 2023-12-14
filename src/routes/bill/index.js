const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication, permission } = require('../../auth/checkAuth');
const BillController = require('../../controllers/bill.controller');

const router = express.Router();

router.use(authentication)
router.use(permission('staff'))
router.post('/export', asyncHandler(BillController.createExportBill));
router.get('/export/:id', asyncHandler(BillController.getExportBillById));
router.get('/export', asyncHandler(BillController.getAllExportBills));
router.get('/number', asyncHandler(BillController.getNumberOfBill));
router.use(permission('manager'))
router.post('/import', asyncHandler(BillController.createImportBill));
router.get('/import/:id', asyncHandler(BillController.getImportBillById));
router.get('/import', asyncHandler(BillController.getAllImportBills));
router.delete('/:id', asyncHandler(BillController.deleteBill));
router.get('/:id', asyncHandler(BillController.restoreBill));

module.exports = router;