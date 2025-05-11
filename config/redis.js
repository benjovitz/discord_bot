import { createClient } from 'redis';

export function getRedisClient() {
    return createClient({
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            tls: true
        }
    });
} 