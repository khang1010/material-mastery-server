'use strict';

const {
  updatePheromone,
  getPheromone,
  selectNextLocation,
  initializePheromones,
  localPheromoneUpdate,
  globalPheromoneUpdate,
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

    let bestRoute = null;
    let bestDistance = Infinity;

    // Tính toán tuyến đường tối ưu dựa trên thuật toán EACO
    while (unvisitedLocations.length > 0) {
      const nextLocation = selectNextLocation(
        currentLocation,
        unvisitedLocations,
        pheromones
      );
      localPheromoneUpdate(pheromones, currentLocation, nextLocation, 0.05);

      route.push(nextLocation);
      currentLocation = nextLocation;
      unvisitedLocations = unvisitedLocations.filter(
        (loc) => loc !== nextLocation
      );
    }

    const routeDistance = this.calculateTotalDistance(route);
    if (routeDistance < bestDistance) {
      bestRoute = [...route];
      bestDistance = routeDistance;
    }

    globalPheromoneUpdate(route, pheromones, bestRoute, 0.05);

    const optimizedRoute = this.apply2Opt(route);
    // return route;
    return optimizedRoute;
  }

  static calculateTotalDistance(route) {
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      const fromLocation = route[i];
      const toLocation = route[i + 1];
      const pheromoneRecord = getPheromone(fromLocation, toLocation);
      if (pheromoneRecord) {
        totalDistance += pheromoneRecord.distance;
      }
    }
    return totalDistance;
  }

  static apply2Opt(route) {
    let improved = true;
    while (improved) {
      improved = false;
      for (let i = 1; i < route.length - 2; i++) {
        for (let j = i + 1; j < route.length - 1; j++) {
          const newRoute = this.swap2Opt(route, i, j);
          if (
            this.calculateTotalDistance(newRoute) <
            this.calculateTotalDistance(route)
          ) {
            route = newRoute;
            improved = true;
          }
        }
      }
    }
    return route;
  }

  static swap2Opt(route, i, j) {
    const newRoute = [...route];
    while (i < j) {
      [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];
      i++;
      j--;
    }
    return newRoute;
  }
}

module.exports = RouteService;
