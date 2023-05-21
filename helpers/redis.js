// redis
const redis = require("redis");
const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = process.env.REDIS_PORT || 6379;

let redisClient;
const startRedis = async function () {
  redisClient = redis.createClient({
    legacyMode: true,
    socket: {
      port: redisPort,
      host: redisHost,
    },
    retry_strategy: options => Math.max(options.attempt * 100, 3000),
  });

  redisClient.on("error", (err) => {
    console.error("Error", err);
  });

  await redisClient.connect().then(() => {
    console.log('connected  to redis!');
  }).catch((err) => {
    console.log(err);
  });
}



module.exports = { startRedis }
