/**
 * A publish-subsribe 
 */
var EVENTS = (function(){
	var channels = {};
	var hOP = channels.hasOwnProperty;

	return {
		subscribe: function(channel, listener) {
			// Create the channel's object if not yet created
			if(!hOP.call(channels, channel)) channels[channel] = [];

			// Add the listener to queue
			var index = channels[channel].push(listener) -1;

			// Provide handle back for removal of channel
			return {
				remove: function() {
					delete channels[channel][index];
				}
			};
		},

		publish: function(channel, info) {
			// If the channel doesn't exist, or there's no listeners in queue, just leave
			if(!hOP.call(channels, channel)) return;

			// Cycle through channels queue, fire!
			channels[channel].forEach(function(item) {
				item(info != undefined ? info : {});
			});
		}
	};
})();