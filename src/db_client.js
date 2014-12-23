// Generated by CoffeeScript 1.8.0
var config, redis, redisHost, redisPort, redisRecordDBIndex;

redis = require("redis");

config = rootRequire("src/config.js");

redisPort = config.redisPort;

redisHost = config.redisHost;

redisRecordDBIndex = config.redisRecordDBIndex;

module.exports.newClient = function() {
  var client;
  client = redis.createClient(redisPort, redisHost);
  client.select(redisRecordDBIndex, function(err, res) {
    if (!err) {
      logger.info("redis select %s %s", redisRecordDBIndex, res);
    } else {
      logger.error("redis select %s failed, %s", redisRecordDBIndex, err);
    }
  });
  client.on("error", function(err) {
    logger.error("visitor record client caught error, %s", err);
  });
  logger.info("redis record client connect success");
  return client;
};
