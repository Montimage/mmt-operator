var redis = require("redis");
var config = require("./config");

//override redis with the given information: host, port
redis._createClient = redis.createClient;
redis.createClient = function () {
    if (config.redis_input.port == undefined)
        config.redis_input.port = 6379;
    return redis._createClient(config.redis_input.port, config.redis_input.host, {
        //auto reconnect
        retry_strategy: function (options) {
            if (options.error && options.error.code === 'ECONNREFUSED') {
                // End reconnecting on a specific error and flush all commands with a individual error 
                return new Error('The server refused the connection');
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
                // End reconnecting after a specific timeout and flush all commands with a individual error 
                return new Error('Retry time exhausted');
            }
            if (options.times_connected > 10) {
                // End reconnecting with built in error 
                return undefined;
            }
            // reconnect after 
            return Math.min(options.attempt * 100, 3000);
        }
    });
}

module.exports = redis;