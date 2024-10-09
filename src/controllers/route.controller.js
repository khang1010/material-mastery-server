'use strict';

const { OkResponse } = require('../core/success-response');
const RouteService = require('../services/route.service');

class RouteController {
  //   static calculateRoute = async (req, res, next) => {
  //     const { locations, rating } = req.body; // Danh sách các địa điểm và đánh giá của shipper
  //     let currentLocation = locations[0]; // Điểm xuất phát
  //     const route = [currentLocation];
  //     let unvisitedLocations = locations.slice(1);

  //     // Lấy dữ liệu pheromone từ DB
  //     const pheromones = await pheromoneService.getPheromonesForLocations(
  //       locations
  //     );

  //     // Tính toán tuyến đường tối ưu dựa trên thuật toán EACO
  //     while (unvisitedLocations.length > 0) {
  //       const nextLocation = selectNextLocation(
  //         currentLocation,
  //         unvisitedLocations,
  //         pheromones
  //       );
  //       route.push(nextLocation);
  //       currentLocation = nextLocation;
  //       unvisitedLocations = unvisitedLocations.filter(
  //         (loc) => loc !== nextLocation
  //       );
  //     }

  //     // Cập nhật pheromone và thực hiện bay hơi dựa trên đánh giá của shipper
  //     await pheromoneService.updatePheromone(route, rating);

  //     // res.json({ route });
  //     return new OkResponse({
  //       message: 'Checkout successfully',
  //       metadata: route,
  //     }).send(res);
  //   };
  static calculateRoute = async (req, res, next) => {
    new OkResponse({
      message: 'Generate Route successfully',
      metadata: await RouteService.calculateRoute(req.body.locations),
    }).send(res);
  };

  static updatePheromoneByRating = async (req, res, next) => {
    new OkResponse({
      message: 'Update Pheromone successfully',
      metadata: await RouteService.updatePheromone(
        req.body.route,
        req.body.rating
      ),
    }).send(res);
  };
}

module.exports = RouteController;
