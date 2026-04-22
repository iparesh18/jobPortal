import Redis from "ioredis";

const createMemoryCache = () => {
  const map = new Map();
  return {
    async get(key) {
      const entry = map.get(key);
      if (!entry) return null;
      if (entry.exp && Date.now() > entry.exp) {
        map.delete(key);
        return null;
      }
      return entry.value;
    },
    async set(key, value, mode, ttl) {
      let exp = null;
      if (mode === "EX" && ttl) exp = Date.now() + ttl * 1000;
      map.set(key, { value, exp });
      return "OK";
    },
    async del(...keys) {
      let removed = 0;
      for (const key of keys) {
        if (map.delete(key)) removed++;
      }
      return removed;
    },
    async keys(pattern = "*") {
      // simple glob pattern support for '*' only
      if (pattern === "*") return Array.from(map.keys());
      const regex = new RegExp(
        '^' + pattern.split('*').map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$'
      );
      return Array.from(map.keys()).filter((k) => regex.test(k));
    },
    async flushall() {
      map.clear();
      return "OK";
    }
  };
};

let client = null;
let initialized = false;
const memoryCache = createMemoryCache();

const createRedisClient = () => {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    return new Redis(redisUrl, { lazyConnect: true });
  }

  if (!process.env.REDIS_HOST) return null;

  return new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT) || 6379,
    username: process.env.REDIS_USERNAME || undefined,
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: true,
  });
};

const getClient = async () => {
  if (initialized && client) return client;
  if (initialized && !client) return memoryCache;

  initialized = true;

  const redis = createRedisClient();
  if (!redis) {
    console.log("ℹ️ Redis not configured; using in-memory cache");
    client = null;
    return memoryCache;
  }

  redis.on("error", (err) => {
    console.error("❌ Redis error:", err.message || err);
  });

  try {
    await redis.connect();
    console.log("✅ Redis connected");
    client = redis;
    return client;
  } catch (err) {
    console.error("❌ Redis connect failed:", err.message || err);
    console.log("ℹ️ Falling back to in-memory cache");
    client = null;
    return memoryCache;
  }
};

// Export a thin proxy that forwards to either redis client or memory cache
const proxy = {
  async init() {
    await getClient();
  },
  async get(key) {
    const target = await getClient();
    return target.get(key);
  },
  async set(key, value, mode, ttl) {
    const target = await getClient();
    return target.set(key, value, mode, ttl);
  },
  async del(...keys) {
    const target = await getClient();
    return target.del(...keys);
  },
  async keys(pattern) {
    const target = await getClient();
    if (typeof target.keys === 'function') return target.keys(pattern);
    // fallback: emulate keys by scanning available keys via known API
    // if no keys support, return empty
    return [];
  },
  async flushall() {
    const target = await getClient();
    return target.flushall();
  }
};

export default proxy;