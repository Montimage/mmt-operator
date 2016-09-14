# Install
If there are errors when `npm install` of `mongodb`
use `sudo apt-get install libkrb5-dev`

## Configuration

The configuration is in `config.json` file.

- `database_server`: IP address of mongoDB
- `redis_server`: IP address of Redis server
- `data_folder` : Path to the folder containing output of mmt-probe. This is used when `input_mode` is set to `file`.
- `delete_data` : boolean, set to `true` to allow MMT-Operator to delete .csv file in `data_folder` after reading.
- `input_mode`: either `file` or `redis`
- `local_network`: an array indicating local IP ranges
- `probe_stats_period`: a number in second indicating the statistic period of the mmt-probe. This number must be the same with the value of `stats_period` in the configuration file of mmt-probe.
- `buffer`: set size of buffer of data to be inserted to DB, when the buffer fulls its contain will be inserted to DB
    - `max_length_size`: a number representing the number of reports contained in the buffer
    - `max_interval`: a number in seconds representing the largest period between 2 timestamps of 2 reports

- `micro_flow`: parameters to know a TCP flow as a micro-flow. The default values say that when a TCP flow having either number of packets is less than 7 or its data are less than 448 byte then the TCP flow is consedered as a micro-flow. We do not maintain the detailed informations about micro-flow. All micro-flows happening in one sample period will be cumulated (packet count, data size) into one micro-flow. This allows to reduce database size.
- `retain_detail_report_period`: period in seconds to retain detailed informations such as URL/MIME of HTTP. Note that the informations about packet count, data size, payload, retransmission, ... are conserved.
- `port_number`: port on which MMT-Operator is listening
- `log_foloder`: folder containing log
- `is_in_debug_mode`: boolean, set to `true` to print out debug information
