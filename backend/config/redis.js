const { Redis } = require('@upstash/redis');
require('dotenv').config();

let redis = null;

if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
  console.log('Upstash Redis initialized successfully.');
} else {
  console.warn('Upstash Redis credentials not found. Caching will be disabled.');
}

module.exports = redis;
