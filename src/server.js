const fastify = require("fastify")({
  ignoreTrailingSlash: true
});
fastify.register(require("fastify-cors"));

const fastifyRateLimit = require("fastify-rate-limit");
fastify.register(fastifyRateLimit, {
  max: 50,
  timeWindow: "1 minute"
});

fastify.register(require("./routes"), {
  prefix: "/sessions"
});

module.exports = fastify;
