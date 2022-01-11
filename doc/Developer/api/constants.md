## constants

*Format*: `MMTDrop.constants` :`object`



*Description*: Constants using in the library.It contains mainly constants for data format.

*Kind*: static namespace of [`MMTDrop`](typedef#markdown-header-mmtdrop)  


* [`.constants`](#markdown-header-constants) : `object`
    * [`.CsvFormat`](#markdown-header-csvformat)
        * [`.DEFAULT_APP_FORMAT`](#markdown-header-default_app_format)
        * [`.WEB_APP_FORMAT`](#markdown-header-web_app_format)
        * [`.SSL_APP_FORMAT`](#markdown-header-ssl_app_format)
        * [`.RTP_APP_FORMAT`](#markdown-header-rtp_app_format)
        * [`.MICROFLOWS_STATS_FORMAT`](#markdown-header-microflows_stats_format)
        * [`.RADIUS_REPORT_FORMAT`](#markdown-header-radius_report_format)
        * [`.STATS_FORMAT`](#markdown-header-stats_format)
    * [`.StatsColumn`](#markdown-header-statscolumn)
        * [`.FORMAT_ID`](#markdown-header-format_id)
        * [`.PROBE_ID`](#markdown-header-probe_id)
        * [`.SOURCE_ID`](#markdown-header-source_id)
        * [`.TIMESTAMP`](#markdown-header-timestamp)
        * [`.APP_ID`](#markdown-header-app_id)
        * [`.APP_PATH`](#markdown-header-app_path)
        * [`.TOTAL_FLOWS`](#markdown-header-total_flows)
        * [`.ACTIVE_FLOWS`](#markdown-header-active_flows)
        * [`.DATA_VOLUME`](#markdown-header-data_volume)
        * [`.PAYLOAD_VOLUME`](#markdown-header-payload_volume)
        * [`.PACKET_COUNT`](#markdown-header-packet_count)
        * [`.UL_DATA_VOLUME`](#markdown-header-ul_data_volume)
        * [`.UL_PAYLOAD_VOLUME`](#markdown-header-ul_payload_volume)
        * [`.UL_PACKET_COUNT`](#markdown-header-ul_packet_count)
        * [`.DL_DATA_VOLUME`](#markdown-header-dl_data_volume)
        * [`.DL_PAYLOAD_VOLUME`](#markdown-header-dl_payload_volume)
        * [`.DL_PACKET_COUNT`](#markdown-header-dl_packet_count)
    * [`.FlowStatsColumn`](#markdown-header-flowstatscolumn)
        * [`.FORMAT_ID`](#markdown-header-format_id)
        * [`.PROBE_ID`](#markdown-header-probe_id)
        * [`.SOURCE_ID`](#markdown-header-source_id)
        * [`.TIMESTAMP`](#markdown-header-timestamp)
        * [`.FLOW_ID`](#markdown-header-flow_id)
        * [`.START_TIME`](#markdown-header-start_time)
        * [`.IP_VERSION`](#markdown-header-ip_version)
        * [`.SERVER_ADDR`](#markdown-header-server_addr)
        * [`.CLIENT_ADDR`](#markdown-header-client_addr)
        * [`.SERVER_PORT`](#markdown-header-server_port)
        * [`.CLIENT_PORT`](#markdown-header-client_port)
        * [`.TRANSPORT_PROTO`](#markdown-header-transport_proto)
        * [`.UL_PACKET_COUNT`](#markdown-header-ul_packet_count)
        * [`.DL_PACKET_COUNT`](#markdown-header-dl_packet_count)
        * [`.UL_DATA_VOLUME`](#markdown-header-ul_data_volume)
        * [`.DL_DATA_VOLUME`](#markdown-header-dl_data_volume)
        * [`.TCP_RTT`](#markdown-header-tcp_rtt)
        * [`.RETRANSMISSION_COUNT`](#markdown-header-retransmission_count)
        * [`.APP_FAMILY`](#markdown-header-app_family)
        * [`.CONTENT_CLASS`](#markdown-header-content_class)
        * [`.PROTO_PATH`](#markdown-header-proto_path)
        * [`.APP_NAME`](#markdown-header-app_name)
        * [`.APP_FORMAT_ID`](#markdown-header-app_format_id)
    * [`.HttpStatsColumn`](#markdown-header-httpstatscolumn)
        * [`.RESPONSE_TIME`](#markdown-header-response_time)
        * [`.TRANSACTIONS_COUNT`](#markdown-header-transactions_count)
        * [`.INTERACTION_TIME`](#markdown-header-interaction_time)
        * [`.HOSTNAME`](#markdown-header-hostname)
        * [`.MIME_TYPE`](#markdown-header-mime_type)
        * [`.REFERER`](#markdown-header-referer)
        * [`.DEVICE_OS_ID`](#markdown-header-device_os_id)
        * [`.CDN_FLAG`](#markdown-header-cdn_flag)
    * [`.TlsStatsColumn`](#markdown-header-tlsstatscolumn)
        * [`.SERVER_NAME`](#markdown-header-server_name)
        * [`.CDN_FLAG`](#markdown-header-cdn_flag)
    * [`.RtpStatsColumn`](#markdown-header-rtpstatscolumn)
        * [`.PACKET_LOSS_RATE`](#markdown-header-packet_loss_rate)
        * [`.PACKET_LOSS_BURSTINESS`](#markdown-header-packet_loss_burstiness)
    * [`.RTPMetricId`](#markdown-header-rtpmetricid)
        * [`.PACKET_LOSS`](#markdown-header-packet_loss)
        * [`.PACKET_LOSS_BURST`](#markdown-header-packet_loss_burst)
        * [`.JITTER`](#markdown-header-jitter)
        * [`.QUALITY_INDEX`](#markdown-header-quality_index)
    * [`.RTPMetricID2Name`](#markdown-header-rtpmetricid2name)
    * [`.HTTPMetricID2Name`](#markdown-header-httpmetricid2name)
    * [`.FlowMetricFilter`](#markdown-header-flowmetricfilter)
        * [`.DATA_VOLUME`](#markdown-header-data_volume)
        * [`.PACKET_COUNT`](#markdown-header-packet_count)
        * [`.PAYLOAD_VOLUME`](#markdown-header-payload_volume)
        * [`.ACTIVE_FLOWS`](#markdown-header-active_flows)
        * [`.UL_PACKET_COUNT`](#markdown-header-ul_packet_count)
        * [`.DL_PACKET_COUNT`](#markdown-header-dl_packet_count)
        * [`.UL_DATA_VOLUME`](#markdown-header-ul_data_volume)
        * [`.DL_DATA_VOLUME`](#markdown-header-dl_data_volume)
        * [`.FLOW_DURATION`](#markdown-header-flow_duration)
    * [`.ProtocolsIDName`](#markdown-header-protocolsidname)
    * [`.CategoriesIdsMap`](#markdown-header-categoriesidsmap)
    * [`.CategoriesAppIdsMap`](#markdown-header-categoriesappidsmap)
    * [`.period`](#markdown-header-period)
    * [`.getProtocolNameFromID(id)`](#markdown-header-getprotocolnamefromid) ⇒ `string`
    * [`.getPathFriendlyName(path)`](#markdown-header-getpathfriendlyname)
    * [`.getParentPath(path)`](#markdown-header-getparentpath) ⇒ `string`
    * [`.getChildPath(path)`](#markdown-header-getchildpath) ⇒ `string`
    * [`.getAppIdFromPath(path)`](#markdown-header-getappidfrompath) ⇒ `number`
    * [`.getRootAppId(path)`](#markdown-header-getrootappid) ⇒ `string`
    * [`.getCategoryIdFromAppId(appId)`](#markdown-header-getcategoryidfromappid) ⇒ `number`
    * [`.getCategoryNameFromID(id)`](#markdown-header-getcategorynamefromid) ⇒ `string`


### CsvFormat

*Format*: `constants.CsvFormat`

*Description*: MMTDrop defined csv format types

*Kind*: static property of [`constants`](constants)  


* [`.CsvFormat`](#markdown-header-csvformat)
    * [`.DEFAULT_APP_FORMAT`](#markdown-header-default_app_format)
    * [`.WEB_APP_FORMAT`](#markdown-header-web_app_format)
    * [`.SSL_APP_FORMAT`](#markdown-header-ssl_app_format)
    * [`.RTP_APP_FORMAT`](#markdown-header-rtp_app_format)
    * [`.MICROFLOWS_STATS_FORMAT`](#markdown-header-microflows_stats_format)
    * [`.RADIUS_REPORT_FORMAT`](#markdown-header-radius_report_format)
    * [`.STATS_FORMAT`](#markdown-header-stats_format)


#### DEFAULT_APP_FORMAT

*Format*: `CsvFormat.DEFAULT_APP_FORMAT`

*Description*: Default application flow report format id

*Kind*: static property of [`CsvFormat`](constants#markdown-header-csvformat)  


#### WEB_APP_FORMAT

*Format*: `CsvFormat.WEB_APP_FORMAT`

*Description*: WEB flow report format id

*Kind*: static property of [`CsvFormat`](constants#markdown-header-csvformat)  


#### SSL_APP_FORMAT

*Format*: `CsvFormat.SSL_APP_FORMAT`

*Description*: SSL flow report format id

*Kind*: static property of [`CsvFormat`](constants#markdown-header-csvformat)  


#### RTP_APP_FORMAT

*Format*: `CsvFormat.RTP_APP_FORMAT`

*Description*: RTP flow report format id

*Kind*: static property of [`CsvFormat`](constants#markdown-header-csvformat)  


#### MICROFLOWS_STATS_FORMAT

*Format*: `CsvFormat.MICROFLOWS_STATS_FORMAT`

*Description*: Micro flows statistics format id

*Kind*: static property of [`CsvFormat`](constants#markdown-header-csvformat)  


#### RADIUS_REPORT_FORMAT

*Format*: `CsvFormat.RADIUS_REPORT_FORMAT`

*Description*: RADIUS protocol control format id

*Kind*: static property of [`CsvFormat`](constants#markdown-header-csvformat)  


#### STATS_FORMAT

*Format*: `CsvFormat.STATS_FORMAT`

*Description*: Statistics format id

*Kind*: static property of [`CsvFormat`](constants#markdown-header-csvformat)  


### StatsColumn

*Format*: `constants.StatsColumn`

*Description*: Data format description for statistic reports.   The flow data columns contain common columns (id from 0 to 3) for the different applications, and,  specific per application columns (it is not necessary to report Host name,  or Response time, etc. if they are not available for that application

*Kind*: static property of [`constants`](constants)  


* [`.StatsColumn`](#markdown-header-statscolumn)
    * [`.FORMAT_ID`](#markdown-header-format_id)
    * [`.PROBE_ID`](#markdown-header-probe_id)
    * [`.SOURCE_ID`](#markdown-header-source_id)
    * [`.TIMESTAMP`](#markdown-header-timestamp)
    * [`.APP_ID`](#markdown-header-app_id)
    * [`.APP_PATH`](#markdown-header-app_path)
    * [`.TOTAL_FLOWS`](#markdown-header-total_flows)
    * [`.ACTIVE_FLOWS`](#markdown-header-active_flows)
    * [`.DATA_VOLUME`](#markdown-header-data_volume)
    * [`.PAYLOAD_VOLUME`](#markdown-header-payload_volume)
    * [`.PACKET_COUNT`](#markdown-header-packet_count)
    * [`.UL_DATA_VOLUME`](#markdown-header-ul_data_volume)
    * [`.UL_PAYLOAD_VOLUME`](#markdown-header-ul_payload_volume)
    * [`.UL_PACKET_COUNT`](#markdown-header-ul_packet_count)
    * [`.DL_DATA_VOLUME`](#markdown-header-dl_data_volume)
    * [`.DL_PAYLOAD_VOLUME`](#markdown-header-dl_payload_volume)
    * [`.DL_PACKET_COUNT`](#markdown-header-dl_packet_count)


#### FORMAT_ID

*Format*: `StatsColumn.FORMAT_ID`

*Description*: Index of the format id column

*Kind*: static property of [`StatsColumn`](constants#markdown-header-statscolumn)  


#### PROBE_ID

*Format*: `StatsColumn.PROBE_ID`

*Description*: Index of the probe id column

*Kind*: static property of [`StatsColumn`](constants#markdown-header-statscolumn)  


#### SOURCE_ID

*Format*: `StatsColumn.SOURCE_ID`

*Description*: Index of the data source id column

*Kind*: static property of [`StatsColumn`](constants#markdown-header-statscolumn)  


#### TIMESTAMP

*Format*: `StatsColumn.TIMESTAMP`

*Description*: Index of the format id column

*Kind*: static property of [`StatsColumn`](constants#markdown-header-statscolumn)  


#### APP_ID

*Format*: `StatsColumn.APP_ID`

*Description*: Index of the application id column

*Kind*: static property of [`StatsColumn`](constants#markdown-header-statscolumn)  


#### APP_PATH

*Format*: `StatsColumn.APP_PATH`

*Description*: Index of the application path columnAn application might have different statistics entries. Example: Facebook might have two entries one with path eth.ip.tcp.http.fb while the second with path eth.ip.tcp.ssl.fb. This is completely normal. It allows to build a hierarchical view on the protocol statistics.

*Kind*: static property of [`StatsColumn`](constants#markdown-header-statscolumn)  


#### TOTAL_FLOWS

*Format*: `StatsColumn.TOTAL_FLOWS`

*Description*: Index of the is_leaf column

*Kind*: static property of [`StatsColumn`](constants#markdown-header-statscolumn)  


#### ACTIVE_FLOWS

*Format*: `StatsColumn.ACTIVE_FLOWS`

*Description*: Index of the active flows column

*Kind*: static property of [`StatsColumn`](constants#markdown-header-statscolumn)  


#### DATA_VOLUME

*Format*: `StatsColumn.DATA_VOLUME`

*Description*: Index of the data volume column

*Kind*: static property of [`StatsColumn`](constants#markdown-header-statscolumn)  


#### PAYLOAD_VOLUME

*Format*: `StatsColumn.PAYLOAD_VOLUME`

*Description*: Index of the payload data volume column

*Kind*: static property of [`StatsColumn`](constants#markdown-header-statscolumn)  


#### PACKET_COUNT

*Format*: `StatsColumn.PACKET_COUNT`

*Description*: Index of the packet count column

*Kind*: static property of [`StatsColumn`](constants#markdown-header-statscolumn)  


#### UL_DATA_VOLUME

*Format*: `StatsColumn.UL_DATA_VOLUME`

*Description*: Index of the data volume column

*Kind*: static property of [`StatsColumn`](constants#markdown-header-statscolumn)  


#### UL_PAYLOAD_VOLUME

*Format*: `StatsColumn.UL_PAYLOAD_VOLUME`

*Description*: Index of the payload data volume column

*Kind*: static property of [`StatsColumn`](constants#markdown-header-statscolumn)  


#### UL_PACKET_COUNT

*Format*: `StatsColumn.UL_PACKET_COUNT`

*Description*: Index of the packet count column

*Kind*: static property of [`StatsColumn`](constants#markdown-header-statscolumn)  


#### DL_DATA_VOLUME

*Format*: `StatsColumn.DL_DATA_VOLUME`

*Description*: Index of the data volume column

*Kind*: static property of [`StatsColumn`](constants#markdown-header-statscolumn)  


#### DL_PAYLOAD_VOLUME

*Format*: `StatsColumn.DL_PAYLOAD_VOLUME`

*Description*: Index of the payload data volume column

*Kind*: static property of [`StatsColumn`](constants#markdown-header-statscolumn)  


#### DL_PACKET_COUNT

*Format*: `StatsColumn.DL_PACKET_COUNT`

*Description*: Index of the packet count column

*Kind*: static property of [`StatsColumn`](constants#markdown-header-statscolumn)  


### FlowStatsColumn

*Format*: `constants.FlowStatsColumn`

*Description*: Data format description for flow statistic reports

*Kind*: static property of [`constants`](constants)  


* [`.FlowStatsColumn`](#markdown-header-flowstatscolumn)
    * [`.FORMAT_ID`](#markdown-header-format_id)
    * [`.PROBE_ID`](#markdown-header-probe_id)
    * [`.SOURCE_ID`](#markdown-header-source_id)
    * [`.TIMESTAMP`](#markdown-header-timestamp)
    * [`.FLOW_ID`](#markdown-header-flow_id)
    * [`.START_TIME`](#markdown-header-start_time)
    * [`.IP_VERSION`](#markdown-header-ip_version)
    * [`.SERVER_ADDR`](#markdown-header-server_addr)
    * [`.CLIENT_ADDR`](#markdown-header-client_addr)
    * [`.SERVER_PORT`](#markdown-header-server_port)
    * [`.CLIENT_PORT`](#markdown-header-client_port)
    * [`.TRANSPORT_PROTO`](#markdown-header-transport_proto)
    * [`.UL_PACKET_COUNT`](#markdown-header-ul_packet_count)
    * [`.DL_PACKET_COUNT`](#markdown-header-dl_packet_count)
    * [`.UL_DATA_VOLUME`](#markdown-header-ul_data_volume)
    * [`.DL_DATA_VOLUME`](#markdown-header-dl_data_volume)
    * [`.TCP_RTT`](#markdown-header-tcp_rtt)
    * [`.RETRANSMISSION_COUNT`](#markdown-header-retransmission_count)
    * [`.APP_FAMILY`](#markdown-header-app_family)
    * [`.CONTENT_CLASS`](#markdown-header-content_class)
    * [`.PROTO_PATH`](#markdown-header-proto_path)
    * [`.APP_NAME`](#markdown-header-app_name)
    * [`.APP_FORMAT_ID`](#markdown-header-app_format_id)


#### FORMAT_ID

*Format*: `FlowStatsColumn.FORMAT_ID`

*Description*: Index of the format id column

*Kind*: static property of [`FlowStatsColumn`](constants#markdown-header-flowstatscolumn)  


#### PROBE_ID

*Format*: `FlowStatsColumn.PROBE_ID`

*Description*: Index of the probe id column

*Kind*: static property of [`FlowStatsColumn`](constants#markdown-header-flowstatscolumn)  


#### SOURCE_ID

*Format*: `FlowStatsColumn.SOURCE_ID`

*Description*: Index of the data source id column

*Kind*: static property of [`FlowStatsColumn`](constants#markdown-header-flowstatscolumn)  


#### TIMESTAMP

*Format*: `FlowStatsColumn.TIMESTAMP`

*Description*: Index of the format id column

*Kind*: static property of [`FlowStatsColumn`](constants#markdown-header-flowstatscolumn)  


#### FLOW_ID

*Format*: `FlowStatsColumn.FLOW_ID`

*Description*: Index of the flow id column

*Kind*: static property of [`FlowStatsColumn`](constants#markdown-header-flowstatscolumn)  


#### START_TIME

*Format*: `FlowStatsColumn.START_TIME`

*Description*: Index of the flow start time

*Kind*: static property of [`FlowStatsColumn`](constants#markdown-header-flowstatscolumn)  


#### IP_VERSION

*Format*: `FlowStatsColumn.IP_VERSION`

*Description*: Index of the IP version number column

*Kind*: static property of [`FlowStatsColumn`](constants#markdown-header-flowstatscolumn)  


#### SERVER_ADDR

*Format*: `FlowStatsColumn.SERVER_ADDR`

*Description*: Index of the server address column

*Kind*: static property of [`FlowStatsColumn`](constants#markdown-header-flowstatscolumn)  


#### CLIENT_ADDR

*Format*: `FlowStatsColumn.CLIENT_ADDR`

*Description*: Index of the client address column

*Kind*: static property of [`FlowStatsColumn`](constants#markdown-header-flowstatscolumn)  


#### SERVER_PORT

*Format*: `FlowStatsColumn.SERVER_PORT`

*Description*: Index of the server port column

*Kind*: static property of [`FlowStatsColumn`](constants#markdown-header-flowstatscolumn)  


#### CLIENT_PORT

*Format*: `FlowStatsColumn.CLIENT_PORT`

*Description*: Index of the client port column

*Kind*: static property of [`FlowStatsColumn`](constants#markdown-header-flowstatscolumn)  


#### TRANSPORT_PROTO

*Format*: `FlowStatsColumn.TRANSPORT_PROTO`

*Description*: Index of the transport protocol identifier column

*Kind*: static property of [`FlowStatsColumn`](constants#markdown-header-flowstatscolumn)  


#### UL_PACKET_COUNT

*Format*: `FlowStatsColumn.UL_PACKET_COUNT`

*Description*: Index of the uplink packet count column

*Kind*: static property of [`FlowStatsColumn`](constants#markdown-header-flowstatscolumn)  


#### DL_PACKET_COUNT

*Format*: `FlowStatsColumn.DL_PACKET_COUNT`

*Description*: Index of the downlink packet count column

*Kind*: static property of [`FlowStatsColumn`](constants#markdown-header-flowstatscolumn)  


#### UL_DATA_VOLUME

*Format*: `FlowStatsColumn.UL_DATA_VOLUME`

*Description*: Index of the uplink data volume column

*Kind*: static property of [`FlowStatsColumn`](constants#markdown-header-flowstatscolumn)  


#### DL_DATA_VOLUME

*Format*: `FlowStatsColumn.DL_DATA_VOLUME`

*Description*: Index of the downlink data volume column

*Kind*: static property of [`FlowStatsColumn`](constants#markdown-header-flowstatscolumn)  


#### TCP_RTT

*Format*: `FlowStatsColumn.TCP_RTT`

*Description*: Index of the TCP round trip time column. For UDP traffic this will be set to zero.

*Kind*: static property of [`FlowStatsColumn`](constants#markdown-header-flowstatscolumn)  


#### RETRANSMISSION_COUNT

*Format*: `FlowStatsColumn.RETRANSMISSION_COUNT`

*Description*: Index of the retransmissions count columnFor UDP traffic this will be set to zero

*Kind*: static property of [`FlowStatsColumn`](constants#markdown-header-flowstatscolumn)  


#### APP_FAMILY

*Format*: `FlowStatsColumn.APP_FAMILY`

*Description*: Index of the application family column

*Kind*: static property of [`FlowStatsColumn`](constants#markdown-header-flowstatscolumn)  


#### CONTENT_CLASS

*Format*: `FlowStatsColumn.CONTENT_CLASS`

*Description*: Index of the content class column

*Kind*: static property of [`FlowStatsColumn`](constants#markdown-header-flowstatscolumn)  


#### PROTO_PATH

*Format*: `FlowStatsColumn.PROTO_PATH`

*Description*: Index of the protocol path column

*Kind*: static property of [`FlowStatsColumn`](constants#markdown-header-flowstatscolumn)  


#### APP_NAME

*Format*: `FlowStatsColumn.APP_NAME`

*Description*: Index of the application name column

*Kind*: static property of [`FlowStatsColumn`](constants#markdown-header-flowstatscolumn)  


#### APP_FORMAT_ID

*Format*: `FlowStatsColumn.APP_FORMAT_ID`

*Description*: Index of the start of the application specific statistics (this is not a real column, rather an index)

*Kind*: static property of [`FlowStatsColumn`](constants#markdown-header-flowstatscolumn)  


### HttpStatsColumn

*Format*: `constants.HttpStatsColumn`

*Description*: Data format description for statistic reports of HTTP protocol

*Kind*: static property of [`constants`](constants)  


* [`.HttpStatsColumn`](#markdown-header-httpstatscolumn)
    * [`.RESPONSE_TIME`](#markdown-header-response_time)
    * [`.TRANSACTIONS_COUNT`](#markdown-header-transactions_count)
    * [`.INTERACTION_TIME`](#markdown-header-interaction_time)
    * [`.HOSTNAME`](#markdown-header-hostname)
    * [`.MIME_TYPE`](#markdown-header-mime_type)
    * [`.REFERER`](#markdown-header-referer)
    * [`.DEVICE_OS_ID`](#markdown-header-device_os_id)
    * [`.CDN_FLAG`](#markdown-header-cdn_flag)


#### RESPONSE_TIME

*Format*: `HttpStatsColumn.RESPONSE_TIME`

*Description*: Index of the response time column

*Kind*: static property of [`HttpStatsColumn`](constants#markdown-header-httpstatscolumn)  


#### TRANSACTIONS_COUNT

*Format*: `HttpStatsColumn.TRANSACTIONS_COUNT`

*Description*: Index of the HTTP transactions count (req/res number) column

*Kind*: static property of [`HttpStatsColumn`](constants#markdown-header-httpstatscolumn)  


#### INTERACTION_TIME

*Format*: `HttpStatsColumn.INTERACTION_TIME`

*Description*: Index of the interaction time (between client and server) column

*Kind*: static property of [`HttpStatsColumn`](constants#markdown-header-httpstatscolumn)  


#### HOSTNAME

*Format*: `HttpStatsColumn.HOSTNAME`

*Description*: Index of the hostname column

*Kind*: static property of [`HttpStatsColumn`](constants#markdown-header-httpstatscolumn)  


#### MIME_TYPE

*Format*: `HttpStatsColumn.MIME_TYPE`

*Description*: Index of the MIME type column

*Kind*: static property of [`HttpStatsColumn`](constants#markdown-header-httpstatscolumn)  


#### REFERER

*Format*: `HttpStatsColumn.REFERER`

*Description*: Index of the Referer column

*Kind*: static property of [`HttpStatsColumn`](constants#markdown-header-httpstatscolumn)  


#### DEVICE_OS_ID

*Format*: `HttpStatsColumn.DEVICE_OS_ID`

*Description*: Index of the device and operating system ids column

*Kind*: static property of [`HttpStatsColumn`](constants#markdown-header-httpstatscolumn)  


#### CDN_FLAG

*Format*: `HttpStatsColumn.CDN_FLAG`

*Description*: Index of the is CDN delivered column

*Kind*: static property of [`HttpStatsColumn`](constants#markdown-header-httpstatscolumn)  


### TlsStatsColumn

*Format*: `constants.TlsStatsColumn`

*Description*: Data format description for statistic reports of TLS protocol

*Kind*: static property of [`constants`](constants)  


* [`.TlsStatsColumn`](#markdown-header-tlsstatscolumn)
    * [`.SERVER_NAME`](#markdown-header-server_name)
    * [`.CDN_FLAG`](#markdown-header-cdn_flag)


#### SERVER_NAME

*Format*: `TlsStatsColumn.SERVER_NAME`

*Description*: Index of the format id column

*Kind*: static property of [`TlsStatsColumn`](constants#markdown-header-tlsstatscolumn)  


#### CDN_FLAG

*Format*: `TlsStatsColumn.CDN_FLAG`

*Description*: Index of the format id column

*Kind*: static property of [`TlsStatsColumn`](constants#markdown-header-tlsstatscolumn)  


### RtpStatsColumn

*Format*: `constants.RtpStatsColumn`

*Description*: Data format description for statistic reports of RTP protocol

*Kind*: static property of [`constants`](constants)  


* [`.RtpStatsColumn`](#markdown-header-rtpstatscolumn)
    * [`.PACKET_LOSS_RATE`](#markdown-header-packet_loss_rate)
    * [`.PACKET_LOSS_BURSTINESS`](#markdown-header-packet_loss_burstiness)


#### PACKET_LOSS_RATE

*Format*: `RtpStatsColumn.PACKET_LOSS_RATE`

*Description*: Index of the format id column

*Kind*: static property of [`RtpStatsColumn`](constants#markdown-header-rtpstatscolumn)  


#### PACKET_LOSS_BURSTINESS

*Format*: `RtpStatsColumn.PACKET_LOSS_BURSTINESS`

*Description*: Index of the format id column

*Kind*: static property of [`RtpStatsColumn`](constants#markdown-header-rtpstatscolumn)  


### RTPMetricId

*Format*: `constants.RTPMetricId`

*Description*: RTP flow metrics

*Kind*: static property of [`constants`](constants)  


* [`.RTPMetricId`](#markdown-header-rtpmetricid)
    * [`.PACKET_LOSS`](#markdown-header-packet_loss)
    * [`.PACKET_LOSS_BURST`](#markdown-header-packet_loss_burst)
    * [`.JITTER`](#markdown-header-jitter)
    * [`.QUALITY_INDEX`](#markdown-header-quality_index)


#### PACKET_LOSS

*Format*: `RTPMetricId.PACKET_LOSS`

*Description*: Identifier of packet loss rate metric

*Kind*: static property of [`RTPMetricId`](constants#markdown-header-rtpmetricid)  


#### PACKET_LOSS_BURST

*Format*: `RTPMetricId.PACKET_LOSS_BURST`

*Description*: Identifier of packet loss burstiness metric

*Kind*: static property of [`RTPMetricId`](constants#markdown-header-rtpmetricid)  


#### JITTER

*Format*: `RTPMetricId.JITTER`

*Description*: Identifier of jitter metric

*Kind*: static property of [`RTPMetricId`](constants#markdown-header-rtpmetricid)  


#### QUALITY_INDEX

*Format*: `RTPMetricId.QUALITY_INDEX`

*Description*: Identifier of quality index metric

*Kind*: static property of [`RTPMetricId`](constants#markdown-header-rtpmetricid)  


### RTPMetricID2Name

*Format*: `constants.RTPMetricID2Name`

*Description*: Mapping between RTP meric IDs and metric names

*Kind*: static property of [`constants`](constants)  


### HTTPMetricID2Name

*Format*: `constants.HTTPMetricID2Name`

*Description*: Mapping between HTTP meric IDs and metric names

*Kind*: static property of [`constants`](constants)  


### FlowMetricFilter

*Format*: `constants.FlowMetricFilter`

*Description*: Flow metricThis will be represented as options of flow metric filters created by [createFlowMetricFilter](filterFactory#markdown-header-createflowmetricfilter)

*Kind*: static property of [`constants`](constants)  


* [`.FlowMetricFilter`](#markdown-header-flowmetricfilter)
    * [`.DATA_VOLUME`](#markdown-header-data_volume)
    * [`.PACKET_COUNT`](#markdown-header-packet_count)
    * [`.PAYLOAD_VOLUME`](#markdown-header-payload_volume)
    * [`.ACTIVE_FLOWS`](#markdown-header-active_flows)
    * [`.UL_PACKET_COUNT`](#markdown-header-ul_packet_count)
    * [`.DL_PACKET_COUNT`](#markdown-header-dl_packet_count)
    * [`.UL_DATA_VOLUME`](#markdown-header-ul_data_volume)
    * [`.DL_DATA_VOLUME`](#markdown-header-dl_data_volume)
    * [`.FLOW_DURATION`](#markdown-header-flow_duration)


#### DATA_VOLUME

*Format*: `FlowMetricFilter.DATA_VOLUME`

*Description*: Data volume.This column must be created (id not in [MMTDrop.constants.FlowStatsColum](constants#markdown-header-flowstatscolum))

*Kind*: static property of [`FlowMetricFilter`](constants#markdown-header-flowmetricfilter)  


#### PACKET_COUNT

*Format*: `FlowMetricFilter.PACKET_COUNT`

*Description*: Number of packets.This column must be created (id not in [MMTDrop.constants.FlowStatsColum](constants#markdown-header-flowstatscolum))

*Kind*: static property of [`FlowMetricFilter`](constants#markdown-header-flowmetricfilter)  


#### PAYLOAD_VOLUME

*Format*: `FlowMetricFilter.PAYLOAD_VOLUME`

*Description*: Payload volume.This column must be created (id not in [MMTDrop.constants.FlowStatsColum](constants#markdown-header-flowstatscolum))

*Kind*: static property of [`FlowMetricFilter`](constants#markdown-header-flowmetricfilter)  


#### ACTIVE_FLOWS

*Format*: `FlowMetricFilter.ACTIVE_FLOWS`

*Description*: Number of active flowsThis column must be created (id not in [MMTDrop.constants.FlowStatsColum](constants#markdown-header-flowstatscolum))

*Kind*: static property of [`FlowMetricFilter`](constants#markdown-header-flowmetricfilter)  


#### UL_PACKET_COUNT

*Format*: `FlowMetricFilter.UL_PACKET_COUNT`

*Description*: Number of upload packetsThis column is the one from [MMTDrop.constants.FlowStatsColum](constants#markdown-header-flowstatscolum)

*Kind*: static property of [`FlowMetricFilter`](constants#markdown-header-flowmetricfilter)  


#### DL_PACKET_COUNT

*Format*: `FlowMetricFilter.DL_PACKET_COUNT`

*Description*: Number of download packetsThis column is the one from [MMTDrop.constants.FlowStatsColum](constants#markdown-header-flowstatscolum)

*Kind*: static property of [`FlowMetricFilter`](constants#markdown-header-flowmetricfilter)  


#### UL_DATA_VOLUME

*Format*: `FlowMetricFilter.UL_DATA_VOLUME`

*Description*: Upload data volumeThis column is the one from [MMTDrop.constants.FlowStatsColum](constants#markdown-header-flowstatscolum)

*Kind*: static property of [`FlowMetricFilter`](constants#markdown-header-flowmetricfilter)  


#### DL_DATA_VOLUME

*Format*: `FlowMetricFilter.DL_DATA_VOLUME`

*Description*: Download data volumeThis column is the one from [MMTDrop.constants.FlowStatsColum](constants#markdown-header-flowstatscolum)

*Kind*: static property of [`FlowMetricFilter`](constants#markdown-header-flowmetricfilter)  


#### FLOW_DURATION

*Format*: `FlowMetricFilter.FLOW_DURATION`

*Description*: Duration of flowThis column is the one from [MMTDrop.constants.FlowStatsColum](constants#markdown-header-flowstatscolum)

*Kind*: static property of [`FlowMetricFilter`](constants#markdown-header-flowmetricfilter)  


### ProtocolsIDName

*Format*: `constants.ProtocolsIDName`

*Description*: A table of Protocol-Id : Name

*Kind*: static property of [`constants`](constants)  


### CategoriesIdsMap

*Format*: `constants.CategoriesIdsMap`

*Description*: A table of Category-Id : Name

*Kind*: static property of [`constants`](constants)  


### CategoriesAppIdsMap

*Format*: `constants.CategoriesAppIdsMap`

*Description*: A table of Category-Id: Application-Id[]

*Kind*: static property of [`constants`](constants)  


### period

*Format*: `constants.period`

*Description*: List of period Id.This will be used as:* options of period filters created by [createPeriodFilter](filterFactory#markdown-header-createperiodfilter).* period parameter of [Database](Database)

*Kind*: static property of [`constants`](constants)  


### getProtocolNameFromID

*Format*: `constants.getProtocolNameFromID(id)` ⇒`string`

*Description*: Maps the Protocol ID to a Protocol Name

*Kind*: static method of [`constants`](constants)  


*Returns*: `string` - Protocol name  

*Parameters*:

| Param | Type |
| --- | --- |
| id | `number` | 


### getPathFriendlyName

*Format*: `constants.getPathFriendlyName(path)`

*Description*: Return the path friendly name.

*Kind*: static method of [`constants`](constants)  


*Parameters*:

| Param | Type | Description |
| --- | --- | --- |
| path | `string` | application protocol path (given by application IDs) |


### getParentPath

*Format*: `constants.getParentPath(path)` ⇒`string`

*Description*: Return the parent of the given protocol path. ("1.2" is the parent of "1.2.3"; "." is the parent of "1")

*Kind*: static method of [`constants`](constants)  


*Returns*: `string` - parent path  

*Parameters*:

| Param | Type | Description |
| --- | --- | --- |
| path | `string` | application protocol path |


### getChildPath

*Format*: `constants.getChildPath(path)` ⇒`string`

*Description*: Return the child of the given protocol path. ("2.3" is the child of "1.2.3"; "." is the child of "1")

*Kind*: static method of [`constants`](constants)  


*Returns*: `string` - child path  

*Parameters*:

| Param | Type | Description |
| --- | --- | --- |
| path | `string` | application protocol path |


### getAppIdFromPath

*Format*: `constants.getAppIdFromPath(path)` ⇒`number`

*Description*: Returns the application id given the application path.

*Kind*: static method of [`constants`](constants)  


*Returns*: `number` - application ID  

*Parameters*:

| Param | Type | Description |
| --- | --- | --- |
| path | `string` | application protocol path |


### getRootAppId

*Format*: `constants.getRootAppId(path)` ⇒`string`

*Description*: Returns the root application id given the application path.

*Kind*: static method of [`constants`](constants)  


*Returns*: `string` - root  

*Parameters*:

| Param | Type | Description |
| --- | --- | --- |
| path | `string` | application protocol path |


### getCategoryIdFromAppId

*Format*: `constants.getCategoryIdFromAppId(appId)` ⇒`number`

*Description*: Get Category ID of an application

*Kind*: static method of [`constants`](constants)  


*Returns*: `number` - - category Id  

*Parameters*:

| Param | Type | Description |
| --- | --- | --- |
| appId | `number` | application Id |


### getCategoryNameFromID

*Format*: `constants.getCategoryNameFromID(id)` ⇒`string`

*Description*: Maps the Protocol ID to a Protocol Name

*Kind*: static method of [`constants`](constants)  


*Returns*: `string` - Protocol Name  

*Parameters*:

| Param | Type |
| --- | --- |
| id | `number` | 


|                                                           |
|----------------------------------------------------------:|
|*documentation generated on Tue, 28 Apr 2015 14:25:17 GMT*|