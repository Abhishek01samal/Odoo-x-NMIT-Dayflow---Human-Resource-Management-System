import { redisClient } from "../lib/redis.js";
import ApiError from "../utils/api-error.js";

const rateLimiter = async (req: any, res: any, next: any) => {
  try {
    const rateLimitKey = `rate-limit:${req.ip}`;
    const requests = await redisClient.incr(rateLimitKey);
    if (requests === 1) {
      await redisClient.expire(rateLimitKey, 60);
    } else if (requests > 10) {
      return res
        .status(429)
        .json(new ApiError(429, "Too many requests. Please try again later."));
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
};

export { rateLimiter };
