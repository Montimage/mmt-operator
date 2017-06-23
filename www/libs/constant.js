const constant = {
	REDIS_STR : "redis",
	FILE_STR  : "file",
	KAFKA_STR : "kafka",
	
	//musa sla
	VIOLATION_STR: "violation",
	ALERT_STR    : "alert",
	
	//is MMT-Operator running for a specific project?
	project: {
		NONE: 0,
		MUSA: 1,
	}
};

module.exports = constant;