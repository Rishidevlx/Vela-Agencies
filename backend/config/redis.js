const { Redis } = require('@upstash/redis');
require('dotenv').config();

let redis = null;

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

if (url && token) {
  redis = new Redis({
    url,
    token,
  });
  console.log('Upstash Redis initialized successfully.');
} else {
  console.warn('Upstash Redis credentials not found. Caching will be disabled.');
}

module.exports = redis;
