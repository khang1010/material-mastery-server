'use strict';

const pheromoneModel = require('../models/pheromone.model');
const {
  updatePheromone,
  getPheromone,
  selectNextLocation,
  initializePheromones,
  localPheromoneUpdate,
  globalPheromoneUpdate,
  globalPheromoneUpdateV2,
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

  static async calculateRoute(locations, antNum = 10) {
    await initializePheromones(locations);
    // Lấy dữ liệu pheromone từ DB
    const pheromones = await this.getPheromonesForLocations(locations);

    let bestRoute = null;
    let bestScore = -Infinity;

    // Tính toán tuyến đường tối ưu dựa trên thuật toán EACO
    for (let ant = 0; ant < antNum; ant++) {
      let currentLocation = locations[0];
      const route = [currentLocation];
      let unvisitedLocations = locations.slice(1);

      while (unvisitedLocations.length > 0) {
        const nextLocation = selectNextLocation(
          currentLocation,
          unvisitedLocations,
          pheromones
        );
        await localPheromoneUpdate(
          pheromones,
          currentLocation,
          nextLocation,
          0.05
        );

        route.push(nextLocation);
        currentLocation = nextLocation;
        unvisitedLocations = unvisitedLocations.filter(
          (loc) => loc !== nextLocation
        );
      }

      // const routeDistance = this.calculateTotalDistance(route);
      // Tính điểm của tuyến đường hiện tại
      const routeScore = this.calculateRouteScore(route, pheromones);
      if (routeScore > bestScore) {
        bestRoute = [...route];
        bestScore = routeScore;
      }
    }

    const routeDistance = this.calculateTotalDistance(bestRoute);
    await globalPheromoneUpdateV2(bestRoute, pheromones, 0.05, routeDistance);

    const optimizedRoute = this.apply2Opt(bestRoute);
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

  static calculateRouteScore(route, pheromones, alpha = 1, beta = 2) {
    let totalScore = 0;

    for (let i = 0; i < route.length - 1; i++) {
      const fromLocation = route[i];
      const toLocation = route[i + 1];
      const key = `${fromLocation}-${toLocation}`;
      const { pheromone, heuristic } = pheromones[key] || {
        pheromone: 1,
        heuristic: 1 / this.calculateTotalDistance([fromLocation, toLocation]),
      };

      // Tính điểm dựa trên pheromone và heuristic
      totalScore += Math.pow(pheromone, alpha) * Math.pow(heuristic, beta);
    }

    return totalScore;
  }

  static async globalPheromoneUpdate(
    bestRoute,
    pheromones,
    evaporationRate,
    Q = 100
  ) {
    const updates = [];
    const bestDistance = this.calculateTotalDistance(bestRoute);

    // Bay hơi pheromone trên tất cả các tuyến đường
    for (const key in pheromones) {
      if (pheromones[key]) {
        pheromones[key].pheromone *= 1 - evaporationRate; // Bay hơi pheromone
      }
    }

    // Thêm pheromone trên các đoạn thuộc bestRoute
    bestRoute.forEach((location, index) => {
      if (index < bestRoute.length - 1) {
        const currentLocation = location;
        const nextLocation = bestRoute[index + 1];
        const key = `${currentLocation}-${nextLocation}`;

        if (pheromones[key]) {
          // Tính lượng pheromone bổ sung dựa trên tổng quãng đường
          const deltaPheromone = Q / bestDistance;
          pheromones[key].pheromone += deltaPheromone;

          updates.push({
            updateOne: {
              filter: {
                fromLocation: currentLocation,
                toLocation: nextLocation,
              },
              update: { $set: { pheromone: pheromones[key].pheromone } },
              upsert: true,
            },
          });
        }
      }
    });

    if (updates.length > 0) {
      await pheromoneModel.bulkWrite(updates);
    }
  }
}

module.exports = RouteService;
