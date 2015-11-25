## Configuration

The configuration is in `config.json` file.

- `database_server`: IP address of mongoDB
- `redis_server`: IP address of Redis server
- `data_folder` : Path to the folder containing output of mmt-probe
- `input_mode`: either `file` or `redis`
- `mac_getway`: MAC address of a gateway. It is used to decide a packet is incoming or outgoing: 
    - incoming: if a packet having MAC source is the same with the one of the gateway
    - outgoing: if  a packet having MAC destination is the same with the one of the gateway
All packets having MAC source and destination are different with the one of the gateway will be omitted.
    
- `local_network`: an array indicating local IP ranges
- `probe_stats_period`: a number in second indicating the statistic period of the mmt-probe. This number must be the same with the value of `stats_period` in the configuration file of mmt-probe.
- `is_in_debug_mode`: boolean, set to `true` to print out debug information