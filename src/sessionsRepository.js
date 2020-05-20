const redisClient = require("./helpers/redisClient");
const redisSubscriber = require("./helpers/redisSubscriber");
const logHelper = require("./helpers/logHelper");

const PING_INTERVAL = process.env.PING_INTERVAL || 10;

(async () => {
  await redisSubscriber.subscribe("__keyevent@0__:expired");
  redisSubscriber.on("message", (channel, key) => {
    logHelper.log(`Received message on channel ${channel}, with key ${key}`);
    if (channel.includes("expired")) {
      const [prefix, userId, sessionId] = key.split(":");
      _removeSession(userId);
    }
  });
})();

const KEY_PREFIX = "streams";
const generateKey = (...args) => args.join(":");

const start = async (userId, deviceId) => {
  logHelper.log(`Start session for user ${userId}, device ${deviceId}`);
  await Promise.all([_addSession(userId), _addDevice(userId, deviceId)]);
  return true;
};

const ping = async (userId, deviceId) => {
  logHelper.log(`Keep alive session for user ${userId}, device ${deviceId}`);
  const deviceKey = generateKey(KEY_PREFIX, userId, deviceId);
  const sessionExist = await _checkDevice(deviceKey);
  if (sessionExist) {
    await redisClient.expire(deviceKey, 10);
    return true;
  } else {
    return false;
  }
};

const end = async (userId, deviceId) => {
  logHelper.log(`End session for user ${userId}, device ${deviceId}`);
  await Promise.all([_removeSession(userId), _removeDevice(userId, deviceId)]);
  return true;
};

const kill = async (userId, deviceId) => {
  logHelper.log(`Kill session for user ${userId}, device ${deviceId}`);
  return await end(userId, deviceId);
};

const list = async userId => {
  if (!userId) return false;
  const pattern = generateKey(`*${KEY_PREFIX}`, `${userId}:*`);
  const keys = await redisClient.keys(pattern);
  if (!keys) return [];

  const requestPromises = [];
  keys.forEach(key => {
    requestPromises.push(_getInclExpiration(key));
  });
  const sessionList = await Promise.all(requestPromises);
  if (!sessionList) return [];

  sessionList.sort((a, b) => b.expiration - a.expiration);
  return sessionList;
};

const _getInclExpiration = async key => {
  const expiration = await redisClient.ttl(key);
  const deviceId = key.split(":").pop();
  const item = { deviceId, expiration };
  return item;
};

const _addDevice = async (userId, deviceId) => {
  logHelper.log(`Add session for user ${userId}, device ${deviceId}`);
  const deviceKey = generateKey(KEY_PREFIX, userId, deviceId);
  await redisClient.setex(deviceKey, Number(PING_INTERVAL), 1);

  return true;
};

const _removeDevice = async (userId, deviceId) => {
  logHelper.log(`Remove session for user ${userId}, device ${deviceId}`);
  const deviceKey = generateKey(KEY_PREFIX, userId, deviceId);
  await redisClient.del(deviceKey);
  return true;
};

const _checkDevice = async deviceKey => {
  const exists = await redisClient.get(deviceKey);
  return exists ? true : false;
};

const _addSession = async userId => {
  logHelper.log(`Add session for user: ${userId}`);
  const userKey = generateKey(KEY_PREFIX, userId);
  await redisClient.incr(userKey);
  return true;
};

const _removeSession = async userId => {
  logHelper.log(`Remove session for user: ${userId}`);
  const userKey = generateKey(KEY_PREFIX, userId);
  const currentSessions = await redisClient.get(userKey);
  if (!currentSessions) return true;
  await redisClient.set(userKey, Number(currentSessions) - 1);
  return true;
};

const currentSessions = async userId => {
  const userKey = generateKey(KEY_PREFIX, userId);
  const currentSessions = (await redisClient.get(userKey)) || 0;
  return currentSessions;
};

module.exports = {
  start,
  ping,
  end,
  kill,
  list,
  currentSessions
};
