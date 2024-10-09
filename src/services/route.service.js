'use strict';

const {
  updatePheromone,
  getPheromone,
  selectNextLocation,
  initializePheromones,
} = require('../models/repositories/pheromone');

class RouteService {
  static async getPheromonesForLocations(locations) {
    const pheromones = {};
    for (let i = 0; i < locations.length; i++) {
      for (let j = 0; j < locations.length; j++) {
        if (i !== j) {
          const fromLocation = locations[i];
          const toLocation = locations[j];
          const pheromoneRecord = await getPheromone(fromLocation, toLocation);
          pheromones[`${fromLocation}-${toLocation}`] = pheromoneRecord || {
            pheromone: 1,
            heuristic: 1,
          };
        }
      }
    }
    return pheromones;
  }

  static async updatePheromone(route, rating) {
    return await updatePheromone(route, rating);
  }

  static async calculateRoute(locations) {
    let currentLocation = locations[0];
    const route = [currentLocation];
    let unvisitedLocations = locations.slice(1);
    await initializePheromones(locations);

    // Lấy dữ liệu pheromone từ DB
    const pheromones = await this.getPheromonesForLocations(locations);

    // Tính toán tuyến đường tối ưu dựa trên thuật toán EACO
    while (unvisitedLocations.length > 0) {
      const nextLocation = selectNextLocation(
        currentLocation,
        unvisitedLocations,
        pheromones
      );
      route.push(nextLocation);
      currentLocation = nextLocation;
      unvisitedLocations = unvisitedLocations.filter(
        (loc) => loc !== nextLocation
      );
    }
    return route;
  }
}

module.exports = RouteService;
