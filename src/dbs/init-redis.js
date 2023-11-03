const Redis = require('ioredis');

class RedisClient {
  constructor() {
    this.client = null;
    this.createClient();
  }

  async createClient() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis');
    });

    this.client.on('error', (error) => {
      console.error('Redis connection error: ', error);
    });
  }

  getInstance() {
    return this.client;
  }
}

const redisClient = new RedisClient().getInstance();

module.exports = redisClient;