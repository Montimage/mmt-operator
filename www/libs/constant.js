const constant = {
	REDIS_STR : "redis",
	FILE_STR  : "file",
	KAFKA_STR : "kafka",
	SOCKET_STR: "socket",
	NONE_STR  : "none",
	
	//musa sla
	VIOLATION_STR: "violation",
	ALERT_STR    : "alert",
	
	period : {
			REAL   : "real",
			MINUTE : "minute",
			HOUR   : "hour",
			DAY    : "day",
			SPECIAL: "all"
	},
	
	http: {
	   ACCESS_DEINED_CODE  : 401,
	   INTERNAL_ERROR_CODE : 500
	}
};

module.exports = constant;