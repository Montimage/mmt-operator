# v1.7.7 (23 May 2025 - by HN)
- support `mqtt` input mode
- fixed bug when using MongoDB 5.x, 6.x, 7.x
- fixed bug when viewing 
- dashboard for 5G traffic at N2 interface

# v1.7.6 (02 June 2023 - by HN)
- update new set of protocol names:  656: "8021AD", 657: "mqtt", 658: "INBAND_NETWORK_TELEMETRY", 659: "INT_REPORT", 660: "DTLS", 661:
"QUIC_IETF", 700: "HTTP2"
- set protocol ID = 1 as unknown

# v1.7.4 (14 Dec 2022 - by HN)
- auto restart busReader process when having error
- auto resubscribe to a Kafka topic when having error
- consume from the latest offset of a Kafka topic
