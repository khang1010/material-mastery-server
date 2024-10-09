const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/checkAuth');
const RouteController = require('../../controllers/route.controller');

const router = express.Router();

router.use(authentication);
router.post('/', asyncHandler(RouteController.calculateRoute));
router.patch('/', asyncHandler(RouteController.updatePheromoneByRating));

module.exports = router;
