const sessionsRepository = require("./sessionsRepository");
const STREAM_LIMIT = process.env.STREAM_LIMIT || 2;

module.exports = (fastify, opts, next) => {
  fastify.post("/:userId/start/:deviceId", async (req, res) => {
    const userId = req.params.userId;
    const deviceId = req.params.deviceId;

    const currentSessions = await sessionsRepository.currentSessions(userId);
    const authorized = currentSessions < STREAM_LIMIT;
    if (!authorized) {
      return res.status(403).send("Too many sessions");
    }
    await sessionsRepository.start(userId, deviceId);
    res.status(200).send("Session started");
  });

  fastify.post("/:userId/ping/:deviceId", async (req, res) => {
    const userId = req.params.userId;
    const deviceId = req.params.deviceId;

    await sessionsRepository.ping(userId, deviceId);
    res.status(200).send();
  });

  fastify.post("/:userId/end/:deviceId", async (req, res) => {
    const userId = req.params.userId;
    const deviceId = req.params.deviceId;

    await sessionsRepository.end(userId, deviceId);
    res.status(200).send("Session ended");
  });

  fastify.post("/:userId/kill/:deviceId", async (req, res) => {
    const userId = req.params.userId;
    const deviceId = req.params.deviceId;

    await sessionsRepository.kill(userId, deviceId);
    res.status(200).send("Session killed");
  });

  fastify.get("/:userId/list", async (req, res) => {
    const userId = req.params.userId;

    const sessions = await sessionsRepository.list(userId);
    res.status(200).send(sessions);
  });

  next();
};
