'use strict';
const redisClient = require('../dbs/init-redis');
const {promisify} = require('util');
const { reservationInventory } = require('../models/repositories/inventory');
const ProductService = require('./product.service');
const { BadRequestError } = require('../core/error-response');
const pexpire = promisify(redisClient.pexpire).bind(redisClient);
const setnxAsync = promisify(redisClient.setnx).bind(redisClient);

class RedisService {
    static acquireLock = async (productId, quantity, cartId) => {
        const key = `lock_v1_${productId}`
        const retryTimes = 10;
        const exprireTime = 120;

        for (let i = 0; i < retryTimes; i++) {
            const result = await redisClient.set(key, exprireTime, 'EX', exprireTime, 'NX');
            // console.log(">>>result: ", result);
            if (result === 'OK') {
                const reservation = await reservationInventory({productId, quantity, cartId});
                if (!reservation) throw new BadRequestError('Insufficient product inventory');
                const updateProduct = await ProductService.updateProductById(productId, {product_quantity: reservation.inventory_stock});
                if (reservation) {
                    await pexpire(key, exprireTime);
                    return key;
                }
                return null
            } else {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }
    }

    static releaseLock = async (key) => {
        const delAsyncKey = promisify(redisClient.del).bind(redisClient);
        return await delAsyncKey(key);
    }
}

module.exports = RedisService;