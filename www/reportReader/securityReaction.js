const config      = require("../libs/config");
const dataAdaptor = require('../libs/dataAdaptor');
const exec        = require("../libs/exec-script");
const COL         = dataAdaptor.StatsColumnId
const SEC         = dataAdaptor.SecurityColumnId;

const isEnable = !!( Array.isArray(config.modules) && (config.modules.indexOf("security") > -1) )

console.info("Module 'security' is " + (isEnable? "enabled": "disabled"))

const reaction_cfg = config.modules_config.security || {};
console.log("Security auto_perform_reaction is " + (reaction_cfg.auto_perform_reaction? "enabled":"disabled"));



function findConcernedIPs( history ){
	let concernt = "";
	for (var i in history) {
		var event = history[i].attributes;
		for (var j in event) {
			var atts = event[j];
			//since mmt-security v 1.2.8, atts is an array [key, value]
			// instead of an object {key: value}
			if (!Array.isArray(atts)) {
				//this is for older version
				const firstKey = Object.keys(atts)[0];
				atts = [firstKey, atts[firstKey]];
			}

			const key = atts[0]; //since mmt-security v 1.2.8, the first element is key, the second one is value
			const val = atts[1];

			//check if key is one of the followings
			const ipArr = ["ip.src", "ip.dst"];

			if (ipArr.indexOf(key) !== -1) {
				//if the att is not yet added
				if (concernt.indexOf(val) === -1) {
					//
					if (concernt != "") concernt += ", ";
					concernt += val;
				}
			}
		}
	}
	return concernt;
}


let last_execution_script_ts = 0;

module.exports = {
	isEnable: isEnable,
	//convert event-based report to session report

	autoPerformReaction: function(alert){
		if( !isEnable )
			return false;

		if(! reaction_cfg.auto_perform_reaction){
			return false;
		}
		const now = alert[COL.TIMESTAMP];
		
		//at most one alert per minute
		if( now - last_execution_script_ts < 10*1000 ){
			console.log("Ignored execution of reaction script as it was executed recently less than 10 second");
			return;
		}
		
		console.log(`Performing countermeasure again this alert: ${JSON.stringify(alert)}`);
		last_execution_script_ts = now;
		
		const script_name = reaction_cfg.reaction_script_path;
		const ret = exec.exec( script_name, ["ips", findConcernedIPs(alert[8])], {} );
		console.log(`Executing a reaction "${script_name}": ${JSON.stringify(ret)}`);
		alert[SEC.DESCRIPTION] += " <span class='label label-success'>reacting <i class='fa fa-spinner fa-spin'/></span>";
		return ret;
	}
}