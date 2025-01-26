'use strict';
require('dotenv').config();
const axios = require('axios');
const pheromoneModel = require('../pheromone.model');
const { BadRequestError } = require('../../core/error-response');

async function getDistance(fromLocation, toLocation) {
  const url = `https://api.distancematrix.ai/maps/api/distancematrix/json?origins=${fromLocation}&destinations=${toLocation}&key=${process.env.DISTANCE_MATRIX_API_KEY}`;

  try {
    const response = await axios.get(url);
    if (response.data.rows[0].elements[0].status === 'ZERO_RESULTS') {
      throw new BadRequestError('Call API failed');
    }
    const distance = response.data.rows[0].elements[0].distance.value;
    const duration = response.data.rows[0].elements[0].duration.value;
    return {distance, duration};
  } catch (error) {
    console.error('Error fetching distance data:', error);
    return null;
  }
}

async function initializePheromones(locations) {
  const result = [];
  for (let i = 0; i < locations.length; i++) {
    for (let j = 0; j < locations.length; j++) {
      if (i !== j) {
        const fromLocation = locations[i];
        const toLocation = locations[j];

        let existingPheromone = await pheromoneModel.findOne({
          fromLocation,
          toLocation,
        });
        if (!existingPheromone) {
          const {distance, duration} = (await getDistance(fromLocation, toLocation)) || 0;

          const newRecord = await pheromoneModel.create({
            fromLocation,
            toLocation,
            pheromone: 1.0, // Giá trị ban đầu của pheromone
            heuristic: calculateHeuristicV2(distance, duration), // Heuristic tính dựa trên khoảng cách
            distance, // Khoảng cách thực tế
            evaporationRate: 0.05, // Tốc độ bay hơi
          });
          result.push(newRecord);
        }
      }
    }
  }
  console.log('Initialized pheromone data with distance and heuristic.');
  return result;
}

async function updatePheromone(route, rating) {
  const pheromoneChange = (rating / 5) * 0.1; // Cập nhật dựa trên đánh giá (0 - 5 sao)
  const result = [];

  for (let i = 0; i < route.length - 1; i++) {
    const fromLocation = route[i];
    const toLocation = route[i + 1];

    const pheromoneRecord = await pheromoneModel.findOne({
      fromLocation,
      toLocation,
    });
    if (pheromoneRecord) {
      pheromoneRecord.pheromone = Math.max(
        0.1,
        pheromoneRecord.pheromone * (1 - pheromoneRecord.evaporationRate)
      );

      // Cập nhật pheromone dựa trên đánh giá shipper
      pheromoneRecord.pheromone += pheromoneChange;

      // Cập nhật đánh giá của shipper
      pheromoneRecord.rating = (rating + pheromoneRecord.rating) / 2;

      // Lưu lại pheromone mới vào cơ sở dữ liệu
      await pheromoneRecord.save();
      result.push(pheromoneRecord);
    }
  }
  return result;
}

function selectNextLocation(currentLocation, unvisitedLocations, pheromones) {
  let totalPheromone = 0;
  const probabilities = [];

  unvisitedLocations.forEach((location) => {
    const key = `${currentLocation}-${location}`;
    const pheromoneValue = pheromones[key] ? pheromones[key].pheromone : 1;
    const heuristicValue = pheromones[key] ? pheromones[key].heuristic : 1;

    totalPheromone += Math.pow(pheromoneValue, 1) * Math.pow(heuristicValue, 2);
    probabilities.push({
      location,
      pheromone: pheromoneValue,
      heuristic: heuristicValue,
    });
  });

  probabilities.forEach((prob) => {
    prob.probability =
      (Math.pow(prob.pheromone, 1) * Math.pow(prob.heuristic, 2)) /
      totalPheromone;
  });

  // Chọn điểm tiếp theo dựa trên xác suất
  const randomValue = Math.random();
  let cumulativeProbability = 0;

  for (const prob of probabilities) {
    cumulativeProbability += prob.probability;
    if (randomValue <= cumulativeProbability) {
      return prob.location;
    }
  }

  return unvisitedLocations[0]; // Phòng trường hợp không chọn được điểm nào
}

function selectNextLocationV2(
  currentLocation,
  unvisitedLocations,
  startLocation,
  pheromones
) {
  let totalPheromone = 0;
  const probabilities = [];

  unvisitedLocations.forEach((location) => {
    const key = `${currentLocation}-${location}`;
    const pheromoneValue = pheromones[key] ? pheromones[key].pheromone : 1;
    const heuristicValue = pheromones[key] ? pheromones[key].heuristic : 1;

    // Tính toán saving (U_{ij}) dựa trên khoảng cách
    const savingValue =
      (pheromones[`${currentLocation}-${startLocation}`]?.distance || 1) +
      (pheromones[`${location}-${startLocation}`]?.distance || 1) -
      (pheromones[key]?.distance || 1);

    totalPheromone +=
      Math.pow(pheromoneValue, 1) *
      Math.pow(heuristicValue, 1) *
      Math.pow(savingValue, 1);
    probabilities.push({
      location,
      pheromone: pheromoneValue,
      heuristic: heuristicValue,
      saving: savingValue,
    });
  });

  probabilities.forEach((prob) => {
    prob.probability =
      (Math.pow(prob.pheromone, 1) *
        Math.pow(prob.heuristic, 1) *
        Math.pow(prob.saving, 1)) /
      totalPheromone;
  });

  // // Chọn điểm tiếp theo dựa trên xác suất
  // const randomValue = Math.random();
  // let cumulativeProbability = 0;

  // for (const prob of probabilities) {
  //   cumulativeProbability += prob.probability;
  //   if (randomValue <= cumulativeProbability) {
  //     return prob.location;
  //   }
  // }
  const exploitationThreshold = 0.8; // Ngưỡng để quyết định khai thác
  if (Math.random() < exploitationThreshold) {
    // Chọn điểm có xác suất cao nhất
    probabilities.sort((a, b) => b.probability - a.probability);
    return probabilities[0].location;
  } else {
    // Chọn điểm dựa trên xác suất (Exploration)
    const randomValue = Math.random();
    let cumulativeProbability = 0;

    for (const prob of probabilities) {
      cumulativeProbability += prob.probability;
      if (randomValue <= cumulativeProbability) {
        return prob.location;
      }
    }
  }


  return unvisitedLocations[0]; // Phòng trường hợp không chọn được điểm nào
}

async function getPheromone(fromLocation, toLocation) {
  return await pheromoneModel.findOne({ fromLocation, toLocation });
}

async function createPheromone(data) {
  return await pheromoneModel.create(data);
}

async function updatePheromoneData(fromLocation, toLocation, pheromoneData) {
  return await pheromoneModel.findOneAndUpdate(
    { fromLocation, toLocation },
    { $set: pheromoneData, lastUpdated: Date.now() },
    { new: true }
  );
}

async function getAllPheromones() {
  return await Pheromone.find({});
}

async function localPheromoneUpdate(
  pheromones,
  currentLocation,
  nextLocation,
  evaporationRate
) {
  const key = `${currentLocation}-${nextLocation}`;
  if (pheromones[key]) {
    pheromones[key].pheromone =
      (1 - evaporationRate) * pheromones[key].pheromone + evaporationRate * 0.5;
    // pheromones[key].pheromone =
    //   (1 - evaporationRate) * pheromones[key].pheromone + evaporationRate * 0.1;

    await pheromoneModel.updateOne(
      { fromLocation: currentLocation, toLocation: nextLocation },
      { $set: { pheromone: pheromones[key].pheromone } },
      { upsert: true }
    );
  }
}

async function globalPheromoneUpdate(
  route,
  pheromones,
  bestRoute,
  evaporationRate,
  routeDistance,
  bestDistance,
) {
  const updates = [];
  const deltaPheromone = routeDistance / bestDistance;

  route.forEach((location, index) => {
    if (index < route.length - 1) {
      const currentLocation = location;
      const nextLocation = route[index + 1];
      const key = `${currentLocation}-${nextLocation}`;

      // Nếu tuyến đường này nằm trong bestRoute, ta thêm pheromone mạnh hơn
      if (pheromones[key]) {
        pheromones[key].pheromone =
          (1 - evaporationRate) * pheromones[key].pheromone +
          deltaPheromone; // Nếu là bestRoute thì cộng nhiều hơn

        updates.push({
          updateOne: {
            filter: { fromLocation: currentLocation, toLocation: nextLocation },
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

function calculateRouteRating(route) {
  let totalRating = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const fromLocation = route[i];
    const toLocation = route[i + 1];

    const pheromoneRecord = pheromoneModel.findOne({
      fromLocation,
      toLocation,
    });

    if (pheromoneRecord) {
      totalRating += pheromoneRecord.rating;
    }
  }
  return totalRating / (route.length - 1);
}

async function globalPheromoneUpdateV2(
  bestRoute,
  pheromones,
  evaporationRate,
  bestDistance,
  Q = 10000
) {
  const updates = [];
  // const bestDistance = this.calculateTotalDistance(bestRoute);

  // // Bay hơi pheromone trên tất cả các tuyến đường
  // for (const key in pheromones) {
  //   if (pheromones[key]) {
  //     // pheromones[key].pheromone *= 1 - evaporationRate;
  //     pheromones[key].pheromone = Math.max(
  //       (1 - evaporationRate) * pheromones[key].pheromone,
  //       0.01 // Giá trị pheromone tối thiểu
  //     );
  //   }
  // }

  // Thêm pheromone trên các đoạn thuộc bestRoute
  bestRoute.forEach((location, index) => {
    if (index < bestRoute.length - 1) {
      const currentLocation = location;
      const nextLocation = bestRoute[index + 1];
      const key = `${currentLocation}-${nextLocation}`;

      if (pheromones[key]) {
        const deltaPheromone = Q / Math.max(bestDistance, 10000);
        pheromones[key].pheromone += deltaPheromone;

        updates.push({
          updateOne: {
            filter: { fromLocation: currentLocation, toLocation: nextLocation },
            update: { $set: { pheromone: pheromones[key].pheromone } },
            upsert: true,
          },
        });
      }
    }
  });

  // Cập nhật vào DB
  if (updates.length > 0) {
    await pheromoneModel.bulkWrite(updates);
  }
}

function calculateHeuristic(distance, scalingFactor = 100) {
  return 1 / (distance + scalingFactor); // Tỷ lệ heuristic dựa trên khoảng cách và yếu tố điều chỉnh
}

function calculateHeuristicV2(distance, duration, scalingFactor = 100) {
  return 1000 / (distance + scalingFactor + duration); // Tỷ lệ heuristic dựa trên khoảng cách và yếu tố điều chỉnh
}

function calculateTotalDistance(route) {
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

module.exports = {
  initializePheromones,
  updatePheromone,
  selectNextLocation,
  selectNextLocationV2,
  getAllPheromones,
  updatePheromoneData,
  getPheromone,
  createPheromone,
  localPheromoneUpdate,
  globalPheromoneUpdate,
  calculateRouteRating,
  calculateHeuristic,
  globalPheromoneUpdateV2,
  calculateTotalDistance,
};
