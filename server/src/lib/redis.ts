import { Redis } from "ioredis";
import { ENV } from "./env.js";

const client = new Redis(ENV.REDIS_URL);
//const client = new Redis(ENV.REDIS_URL,{tls:{}}); for prod env

if (!client) {
  throw new Error("Failed to create Redis client");
}

const connectToRedis = async () => {
  await client.ping();
  console.log("Redis connected successfully...");
  client.on("error", (err: any) => {
    console.error("❌❌ Redis connection error: ", err);
  });
};

export { client as redisClient, connectToRedis };
