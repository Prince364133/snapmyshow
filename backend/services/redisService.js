const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config();

const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

redis.on('error', (err) => console.error('Redis Client Error', err));
redis.on('connect', () => console.log('Redis Client Connected'));


const lockSeat = async (showtimeId, row, col, lockTimeSeconds = 900) => {
    const key = `lock:showtime:${showtimeId}:seat:${row}:${col}`;
    // NX: Set if not exists, EX: Expire after N seconds
    const result = await redis.set(key, 'locked', 'EX', lockTimeSeconds, 'NX');
    return result === 'OK';
};

const unlockSeat = async (showtimeId, row, col) => {
    const key = `lock:showtime:${showtimeId}:seat:${row}:${col}`;
    await redis.del(key);
};

const isSeatLocked = async (showtimeId, row, col) => {
    const key = `lock:showtime:${showtimeId}:seat:${row}:${col}`;
    const result = await redis.get(key);
    return result !== null;
};

module.exports = {
    redis,
    lockSeat,
    unlockSeat,
    isSeatLocked
};
