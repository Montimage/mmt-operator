var redis  = require("redis");
var config = require("./config");

//override redis with the given information: host, port
redis._createClient = redis.createClient;
redis.createClient  = function(){
  if( config.redis_server.port == undefined )
    config.redis_server.port = 6379;
  return redis._createClient(config.redis_server.port, config.redis_server.host, {});
}

module.exports = redis;
