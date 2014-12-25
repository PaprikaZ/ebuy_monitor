// Generated by CoffeeScript 1.8.0
var config, redis, redisRecordDBIndex;

redis = require('redis');

config = require('./config.js');

redisRecordDBIndex = config.redisRecordDBIndex;

module.exports = function() {
  var client;
  client = redis.createClient(config.redisPort, config.redisHost);
  client.select(redisRecordDBIndex, function(err, res) {
    if (err) {
      logger.error("redis select %s failed, %s", redisRecordDBIndex, err);
    } else {
      logger.debug("redis select %s %s", redisRecordDBIndex, res);
    }
  });
  client.on("error", function(err) {
    logger.error("visitor record client caught error, %s", err);
  });
  logger.debug("redis record client connect success");
  return client;
};