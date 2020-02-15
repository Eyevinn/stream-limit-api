const fastify = require("fastify")({
  ignoreTrailingSlash: true
});
const cors = require("cors");
fastify.use(cors());

const fastifyRateLimit = require("fastify-rate-limit");
fastify.register(fastifyRateLimit, {
  max: 50,
  timeWindow: "1 minute"
});

fastify.register(require("./routes"), {
  prefix: "/sessions"
});

module.exports = fastify;
