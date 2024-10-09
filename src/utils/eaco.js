class EACO {
  constructor(
    cities,
    antsCount,
    alpha,
    beta,
    evaporation,
    iterations,
    pheromoneDeposit,
    maxCapacity
  ) {
    this.cities = cities;
    this.antsCount = antsCount;
    this.alpha = alpha;
    this.beta = beta;
    this.evaporation = evaporation;
    this.iterations = iterations;
    this.pheromoneDeposit = pheromoneDeposit;
    this.maxCapacity = maxCapacity;
    this.pheromoneMatrix = this.initializePheromones();
    this.distanceMatrix = this.calculateDistanceMatrix();
  }

  initializePheromones() {
    const pheromones = [];
    for (let i = 0; i < this.cities.length; i++) {
      const row = new Array(this.cities.length).fill(1);
      pheromones.push(row);
    }
    return pheromones;
  }

  calculateDistanceMatrix() {
    const distances = [];
    for (let i = 0; i < this.cities.length; i++) {
      const row = [];
      for (let j = 0; j < this.cities.length; j++) {
        const distance = this.calculateDistance(this.cities[i], this.cities[j]);
        row.push(distance);
      }
      distances.push(row);
    }
    return distances;
  }

  calculateDistance(cityA, cityB) {
    const xDiff = cityA.x - cityB.x;
    const yDiff = cityA.y - cityB.y;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
  }

  run() {
    let bestRoute = null;
    let bestDistance = Infinity;

    for (let iter = 0; iter < this.iterations; iter++) {
      const ants = this.initializeAnts();
      for (const ant of ants) {
        this.constructSolution(ant);
        const distance = this.calculateRouteDistance(ant.route);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestRoute = ant.route;
        }

        this.depositPheromone(ant.route, distance);
      }

      this.evaporatePheromone();
    }

    return { bestRoute, bestDistance };
  }

  initializeAnts() {
    const ants = [];
    for (let i = 0; i < this.antsCount; i++) {
      const startCity = Math.floor(Math.random() * this.cities.length);
      ants.push({ route: [startCity], capacity: this.maxCapacity });
    }
    return ants;
  }

  constructSolution(ant) {
    while (ant.route.length < this.cities.length) {
      const currentCity = ant.route[ant.route.length - 1];
      const nextCity = this.selectNextCity(ant, currentCity);
      if (nextCity !== null) ant.route.push(nextCity);
    }
  }

  selectNextCity(ant, currentCity) {
    const probabilities = [];
    let sum = 0;

    for (let i = 0; i < this.cities.length; i++) {
      if (!ant.route.includes(i)) {
        const pheromone = Math.pow(
          this.pheromoneMatrix[currentCity][i],
          this.alpha
        );
        const heuristic = Math.pow(
          1 / this.distanceMatrix[currentCity][i],
          this.beta
        );
        const probability = pheromone * heuristic;
        probabilities.push({ city: i, probability });
        sum += probability;
      }
    }

    if (sum === 0) return null;

    const threshold = Math.random() * sum;
    let cumulativeProbability = 0;

    for (const { city, probability } of probabilities) {
      cumulativeProbability += probability;
      if (cumulativeProbability >= threshold) return city;
    }
  }

  calculateRouteDistance(route) {
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      totalDistance += this.distanceMatrix[route[i]][route[i + 1]];
    }
    return totalDistance;
  }

  depositPheromone(route, distance) {
    const pheromoneAmount = this.pheromoneDeposit / distance;
    for (let i = 0; i < route.length - 1; i++) {
      const cityA = route[i];
      const cityB = route[i + 1];
      this.pheromoneMatrix[cityA][cityB] += pheromoneAmount;
    }
  }

  evaporatePheromone() {
    for (let i = 0; i < this.pheromoneMatrix.length; i++) {
      for (let j = 0; j < this.pheromoneMatrix[i].length; j++) {
        this.pheromoneMatrix[i][j] *= 1 - this.evaporation;
      }
    }
  }
}

module.exports = EACO;
