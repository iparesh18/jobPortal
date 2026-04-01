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
    async del(key) {
      return map.delete(key) ? 1 : 0;
    },
    async flushall() {
      map.clear();
      return "OK";
    }
  };
};

let client = null;
const memoryCache = createMemoryCache();

if (!process.env.REDIS_HOST) {
  console.log("ℹ️ Redis not configured; using in-memory cache");
  client = memoryCache;
} else {
  const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: true,
  });

  let connected = false;

  redis.on("connect", () => {
    connected = true;
    console.log("✅ Redis connected");
    client = redis;
  });

  redis.on("error", (err) => {
    console.error("❌ Redis error:", err.message || err);
    if (!connected) {
      console.log("ℹ️ Falling back to in-memory cache");
      client = memoryCache;
      try {
        redis.disconnect();
      } catch (e) {}
    }
  });

  // Try to connect quickly; if fails, fallback
  redis.connect().catch((err) => {
    console.error("❌ Redis connect failed:", err.message || err);
    client = memoryCache;
  });
}

// Export a thin proxy that forwards to either redis client or memory cache
const proxy = {
  async get(key) {
    return (client || memoryCache).get(key);
  },
  async set(key, value, mode, ttl) {
    return (client || memoryCache).set(key, value, mode, ttl);
  },
  async del(key) {
    return (client || memoryCache).del(key);
  },
  async flushall() {
    return (client || memoryCache).flushall();
  }
};

export default proxy;