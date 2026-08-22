import app from "./app.js";
import { ENV } from "./lib/env.js";
import { connectToTransporter } from "./lib/nodemailer.js";
import { connectToDB } from "./lib/prisma.js";
import { connectToRedis } from "./lib/redis.js";

const port = ENV.PORT || 5000;

(async function () {
  app.listen(port, () => {
    console.log(`✅✅ Server running on port ${port}...`);
  });
  await connectToDB();
  await connectToTransporter();
  await connectToRedis();
})();
