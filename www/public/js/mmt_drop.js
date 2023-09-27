/**
 *  MMTDrop
 *  An object container for all MMTDrop library functions.
 *
 *  This class is just a container for all the objects and constants
 *  used in the library.  It is not meant to be instantiated, but to
 *  provide a namespace for library objects, constants, and functions.
 *  @author Montimage<contact@montimage.com>
 *  @namespace MMTDrop
 */
var MMTDrop = {
      //The version of the MMTDrop library.
      VERSION : "2.1.1"
};

if( typeof Highcharts !== "undefined" )
   Highcharts.setOptions({
      global: {
         useUTC: false
      }
   });

(function(MMTDrop){
   'use strict';

   MMTDrop.object = {};

   /**
    * Set global options
    *
    * probe_stats_period: number
    * format_payload: boolean
    */
   MMTDrop.setOptions = function( opt ){
      MMTDrop.config = MMTDrop.tools.mergeObjects( MMTDrop.config, opt  );
   };


   /**
    * Default configuration of MMTDrop
    * @namespace
    */
   MMTDrop.config = {
         /**
          * URL of MMT-Operator
          */
         serverURL : "/",

         /**
          * Global options of highChart
          */
         highChart: {
            global : {
               useUTC : false
            }
         },

         /**
          * Chart render: "highchart", "c3js"
          */
         render: "c3js"
   };


   MMTDrop.alert = {
         error: function( msg, delay ){
            //defined in pre-commond.js to show a loading popup
            if( loading )
               loading.onHide();

            this.alert( msg, "error",  delay);
         },
         success: function( msg, delay ){
            this.alert( msg, "success", delay );
         },
         warning: function( msg, delay ){
            this.alert( msg, "error", delay ); 
         },
         hideAll: function(){
            //hide old alert
            $("#alertify-item").trigger("click");
            msg = '<span id="alertify-item">' + msg + '</span>';
         },
         alert: function( msg, type, delay ){
            if( delay === undefined )
               delay = 10000;//10s
            else if( delay < 1000 )
               delay = 1000;//1second

            alertify.log( msg, type,  delay);
         }
   };
   /**
    * Constants using in the library.
    * It contains mainly constants for data format.
    * @namespace
    */
   MMTDrop.constants = {
         /**
          *  MMTDrop defined csv format types
          */
         CsvFormat : {
            /** Default application flow report format id */
            DEFAULT_APP_FORMAT : 0,
            /** WEB flow report format id */
            WEB_APP_FORMAT : 1,
            /** SSL flow report format id */
            SSL_APP_FORMAT : 2,
            /** RTP flow report format id */
            RTP_APP_FORMAT : 3,
            FTP_APP_FORMAT : 4,
            /** Micro flows statistics format id */
            MICROFLOWS_STATS_FORMAT : 8,
            /** RADIUS protocol control format id */
            RADIUS_REPORT_FORMAT : 9,
            /** Statistics format id */
            SESSION_STATS_FORMAT : 100,
            SECURITY_FORMAT: 10,
            BA_PROFILE_FORMAT: 12,
            BA_BANDWIDTH_FORMAT: 11,
         },

         /**
          *  Data format description for statistic reports.
          *
          *  The flow data columns contain common columns (id from 0 to 3) for the different applications, and,
          *  specific per application columns (it is not necessary to report Host name,
          *  or Response time, etc. if they are not available for that application
          */
         StatsColumn : {
            /** Index of the format id column */
            FORMAT_ID         : {id: 0,  label: "Format"},
            /** Index of the probe id column */
            PROBE_ID          : {id: 1,  label: "Probe"},
            /** Index of the data source id column */
            SOURCE_ID         : {id: 2,  label: "Source"},
            /** Index of the format id column */
            TIMESTAMP         : {id: 3,  label: "Timestamp"},

            REPORT_NUMBER     : {id: 4 , label: "Duration Report Number"},//number of periods (e.g. 5 second) being reported

            /** Index of the application id column */
            APP_ID            : {id: 5,  label: "App"},
            /**
             * Index of the application path column
             *
             * An application might have different statistics entries.
             * Example: Facebook might have two entries one with path eth.ip.tcp.http.fb
             * while the second with path eth.ip.tcp.ssl.fb.
             * This is completely normal.
             * It allows to build a hierarchical view on the protocol statistics.
             *
             */
            APP_PATH          : {id: 6,  label: "App. Path"},
            /** Index of the active flows column */
            ACTIVE_FLOWS      : {id: 7,  label: "Session Count"},
            /** Index of the data volume column */
            DATA_VOLUME       : {id: 8,  label: "Data Volume"},
            /** Index of the payload data volume column */
            PAYLOAD_VOLUME    : {id: 9,  label: "Payload Volume"},
            /** Index of the packet count column */
            PACKET_COUNT      : {id: 10, label: "Packet Count"},
            /** Index of the data volume column */
            UL_DATA_VOLUME    : {id: 11, label: "UL Data Volume"},
            /** Index of the payload data volume column */
            UL_PAYLOAD_VOLUME : {id: 12, label: "UL Payload Volume"},
            /** Index of the packet count column */
            UL_PACKET_COUNT   : {id: 13, label: "UL Packet Count"},
            /** Index of the data volume column */
            DL_DATA_VOLUME    : {id: 14, label: "DL Data Volume"},
            /** Index of the payload data volume column */
            DL_PAYLOAD_VOLUME : {id: 15, label: "DL Payload Volume"},
            /** Index of the packet count column */
            DL_PACKET_COUNT   : {id: 16, label: "DL Packet Count"},
            /** Index of the start timestamp of the flow */
            START_TIME        : {id: 17, label: "Start Time"},

            IP_SRC            : {id: 18, label: "IP Source"},
            IP_DST            : {id: 19, label: "IP Destination"} ,

            /** Index of the MAC address source column */
            MAC_SRC           : {id: 20, label: "MAC Source"},
            /** Index of the MAC address source column */
            MAC_DST           : {id: 21 , label: "MAC Destination "},
            SESSION_ID        : {id: 22 , label: "Session ID"},
            PORT_DST          : {id: 23 , label: "Port Destination"},
            PORT_SRC          : {id: 24 , label: "Port Source"},
            THREAD_NUMBER     : {id: 25 , label: "Thread Number"},

            HANDSHAKE_TIME    : {id: 26 , label: "RTT"},
            APP_RESPONSE_TIME : {id: 27 , label: "App. response time"},
            DATA_TRANSFER_TIME: {id: 28 , label: "Data transfer time"},
            RTT_MIN_SERVER    : {id: 29 , label: "RTT min Server"},
            RTT_MIN_CLIENT    : {id: 30 , label: "RTT min Client"},
            RTT_MAX_SERVER    : {id: 31 , label: "RTT min Server"},
            RTT_MAX_CLIENT    : {id: 32 , label: "RTT min Client"},
            RTT_AVG_SERVER    : {id: 33 , label: "RTT min Server"},
            RTT_AVG_CLIENT    : {id: 34 , label: "RTT min Client"},

            UL_RETRANSMISSION  : {id: 35, label: "UL Retrans."},
            DL_RETRANSMISSION  : {id: 36, label: "DL Retrans."},


            FORMAT_TYPE       : {id: 37, label: "Type"},//Identifier of the format of the encapsulated application report

            //this part is created by mmt-operator
            SRC_LOCATION          : {id: 40, label: "Source"},
            DST_LOCATION          : {id: 41, label: "Remote Location"},
            IP_SRC_INIT_CONNECTION: {id: 42, label: "Connection initilized by local IP"},
            PROFILE_ID            : {id: 43, label: "Profile Id"},
            ORG_APP_ID            : {id: 44, label: "App ID"},  //original APP_ID given by probe
            ORG_TIMESTAMP         : {id: 45, label: "Timestamp"},//original TIMESTAMP given by probe

            //FOR CPU, MEM REPORT
            CPU_USAGE				: {id: 95, label: "CPU usage"}, //in % //TODO: verify if these IDs ok?
            MEM_USAGE				: {id: 96, label: "Mem usage"}, //in %
            P_DROP				: {id: 97, label: "Drop percentage"}, //in %
            P_DROP_NIC			: {id: 98, label: "Drop percentage NIC"}, //in %
            P_DROP_KERNEL			: {id: 99, label: "Drop percentage kernel"}, //in %

            //specific metrics for L4S reports: 
            // https://github.com/Montimage/mmt-probe/blob/871ed6c3f2cbca47abe99a8e7148174f1996a01c/mosaico.conf#L313-L334
            L4S_QUEUE_ID    : {id: 100, label: "Queue ID"}, 
            L4S_HOP_LATENCY : {id: 101, label: "Queue latency"}, 
            L4S_QUEUE_OCCUPS: {id: 102, label: "Queue occups"}, 
            L4S_NB_MARK     : {id: 103, label: "Nb Mark"}, 
            L4S_NB_DROP     : {id: 104, label: "Nb Drop"}, 
            L4S_MARK_PROBAB : {id: 105, label: "Mark probability"}, 
         },


         /**
          * Data format description for statistic reports of HTTP protocol
          */
         HttpStatsColumn : {

            APP_FAMILY         : {id: 50 , label: "App Family"},
            CONTENT_CLASS      : {id: 51 , label: "Content Class"},
            /** Response time of the last Request/Reply of the flow */
            RESPONSE_TIME      : {id: 52, label:"Response Time"},
            /** Index of the HTTP transactions count (req/res number) column */
            TRANSACTIONS_COUNT : {id: 53, label:"Transaction Count"},
            /**
             * Index of the interaction time (between client and server) column.
             * This is the time between the first request and the lest response.
             * If this is zero then the flow has one request reply.
             */
            INTERACTION_TIME   : {id: 54, label:"Interaction Time"},
            /** Index of the hostname column */
            HOSTNAME     : {id: 55, label:"Hostname"},
            /** Index of the MIME type column */
            MIME_TYPE    : {id: 56, label:"MIME Type"},
            /** Index of the Referer column. Referrer as reported in the HTTP header */
            REFERER      : {id: 57, label:"Referer"},
            /** Index of the device and operating system ids column.
             * It is concatenated between device identifier (PC, mobile, tablet, etc.) and Operating system identifier (Win, Linux, Android, etc.).
             * These are derived from the user agent.
             */
            //DEVICE_OS_ID : {id: 6, label:"Device OS ID"},
            /** Index of the is CDN delivered column
             * 0: CDN not detected (This does not mean it is not used :)).
             * 1: 1 means CDN flags identified in the message. The referrer should identify the application.
             * Will not be present in HTTPS flows.
             * 2: CDN delivery, the application name should identify the application. However, we might see Akamai as application. In this case, skip it.
             */
            CDN_FLAG     : {id: 58, label: "CDN Flag"},
            URI          : {id: 59, label: "URI"},
            METHOD       : {id: 60, label: "Method"},
            RESPONSE     : {id: 61, label: "Response"},
            CONTENT_LENGTH: {id: 62, label: "Content length"},
            REQUEST_INDICATOR  : {id: 63, label:"Got Complete Response"}, //It indicates that a particular request is finished with a response: 0 = finished, 1: first block, 2: second block, ..., 0: the last block

         },

         /**
          * Data format description for statistic reports of TLS protocol
          */
         TlsStatsColumn : {
            APP_FAMILY        : {id: 70 , label: "App Family"},
            CONTENT_CLASS     : {id: 71 , label: "Content Class"},
            /** Servername as reported in the SSL/TLS negotiation.
             * It is not always possible to extract this field. will be empty in that case.
             */
            SERVER_NAME : {id: 72, label:"Server Name"},
            /**
             * 0: CDN not detected (This does not mean it is not used :)).
             * 1: 1 means CDN flags identified in the message. The referrer should identify the application.
             * Will not be present in HTTPS flows.
             * 2: CDN delivery, the application name should identify the application.
             * However, we might see Akamai as application. In this case, skip it.
             */
            CDN_FLAG    : {id: 73, label:"CDN Flag"},
         },

         /**
          * Data format description for statistic reports of RTP protocol
          */
         RtpStatsColumn : {
            APP_FAMILY             : {id: 80 , label: "App Family"},
            CONTENT_CLASS          : {id: 81 , label: "Content Class"},
            /** Global packet loss rate of the flow */
            PACKET_LOSS_RATE       : {id: 82, label:"Packet Loss Rate"},
            /** Average packet loss burstiness of the flow */
            PACKET_LOSS_BURSTINESS : {id: 83, label:"Packet Loss Burstiness"},
            /** Maximum jitter value for the flow */
            MAX_JITTER             : {id: 84, label:"Max Jitter"},
            ORDER_ERROR            : {id: 85, label:"Order Error"},
         },
         /**
          * Data format description for statistic reports of FTP protocol
          */
         FtpStatsColumn : {
            APP_FAMILY        : {id: 90, label: "App Family"},
            CONNNECTION_TYPE  : {id: 91, label: "Connection Type"},
            USERNAME          : {id: 92, label: "Username"},
            PASSWORD          : {id: 93, label: "Password"},
            FILE_SIZE         : {id: 94, label: "File Size"},
            FILE_NAME         : {id: 95, label: "File Name"},
            DIRECTION         : {id: 96, label: "Direction"}, // direction of the flow
            CONTROL_SESSION_ID: {id: 97, label: "Session ID"}, // control session session_id of the corresponding data section
            RESPONSE_TIME     : {id: 98, label: "Response Time"}, // Response time of the file transfer only
         },

         GtpStatsColumn : {
            APP_FAMILY   : { id : 110, label: "App Family"},
            CONTENT_CLASS: { id : 111, label: "Content Class"},
            IP_SRC       : { id : 112, label: "ENB_IP"},
            IP_DST       : { id : 113, label: "GW IP"},
            TEIDs        : { id : 114, label: "TEIDs"},
            IMSI         : { id : 115, label: "IMSI"},
            ENB_NAME     : { id : 116, label: "ENB_NAME"},
            MME_NAME     : { id : 117, label: "MME_NAME"},
         },
         /**
          * Data format description for Radius reports
          */
         RadiusStatsColumn: {

         },

         BehaviourBandWidthColumn: {
            /** Index of the format id column */
            FORMAT_ID               : {id: 0, label:"Format"} ,
            /** Index of the probe id column */
            PROBE_ID                : {id: 1, label:"Probe"},
            /** Index of the data source id column */
            SOURCE_ID               : {id: 2, label:"Source"},
            /** Index of the format id column */
            TIMESTAMP               : {id: 3, label:"Timestamp"},
            /** property id */
            PROPERTY                : {id: 4, label: "Property"},
            IP                      : {id: 5, label: "IP"},
            APP                     : {id: 6, label: "Profile"},
            BW_BEFORE               : {id: 7, label: "Old Bandwidth"},
            BW_AFTER                : {id: 8, label: "New Bandwidth"},
            VERDICT                 : {id: 9, label: "Verdict"},
            DESCRIPTION             : {id: 10, label: "Description"},
         },
         BehaviourProfileColumn: {
            /** Index of the format id column */
            FORMAT_ID               : {id: 0, label:"Format"} ,
            /** Index of the probe id column */
            PROBE_ID                : {id: 1, label:"Probe"},
            /** Index of the data source id column */
            SOURCE_ID               : {id: 2, label:"Source"},
            /** Index of the format id column */
            TIMESTAMP               : {id: 3, label:"Timestamp"},
            /** property id */
            PROPERTY                : {id: 4, label: "Property"},
            IP                      : {id: 5, label: "IP"},
            PROFILE_BEFORE          : {id: 6, label: "Old Profile"},
            PROFILE_AFTER           : {id: 7, label: "New Profile"},
            BW_BEFORE               : {id: 8, label: "Old Bandwidth"},
            BW_AFTER                : {id: 9, label: "New Bandwidth"},
            VERDICT                 : {id: 10, label: "Verdict"},
            DESCRIPTION             : {id: 11, label: "Description"},
         },
         SecurityColumn: {
            /** Index of the format id column */
            FORMAT_ID               : {id: 0, label:"Format"} ,
            /** Index of the probe id column */
            PROBE_ID                : {id: 1, label:"Probe"},
            /** Index of the data source id column */
            SOURCE_ID               : {id: 2, label:"Source"},
            /** Index of the format id column */
            TIMESTAMP               : {id: 3, label:"Timestamp"},
            /** property id */
            PROPERTY                : {id: 4, label: "Property"},
            VERDICT                 : {id: 5, label: "Verdict"},
            TYPE                    : {id: 6, label: "Type"},
            DESCRIPTION             : {id: 7, label: "Description"},
            HISTORY                 : {id: 8, label: "History"},
            VERDICT_COUNT           : {id: 9, label: "Count"},
         },

         /**
          * Micro-flows statistics reports
          */
         MicroflowStatsColumn: {
            /**
             * Identifier of the MMT protocol or application
             */
            APP_ID : {id: 0, label: "Application ID"},
            /**
             * Number of reported flows
             */
            FLOW_COUNT : {id: 1, label: "Number of Flows"},
            /**
             * Number of downlink packets
             */
            DL_PACKET_COUNT: {id: 2, label: "DL Packet Count"},
            /**
             * Number of uplink packets
             */
            UL_PACKET_COUNT: {id: 3, label: "UL Packet Count"},
            /**
             * Downlink data volume in Bytes
             */
            DL_VOLUME_COUNT: {id: 4, label: "DL Volume Count"},
            /**
             * Uplink data volume in Byte
             */
            UL_VOLUME_COUNT: {id: 5, label: "UL Volume Count"}
         },

         /**
          * RTP flow metrics
          */
         RTPMetricId : {
            /** Identifier of packet loss rate metric */
            PACKET_LOSS       : "Packet Loss",
            /** Identifier of packet loss burstiness metric */
            PACKET_LOSS_BURST : "Loss Burstiness",
            /** Identifier of jitter metric */
            JITTER            : "Jitter",
            /** Identifier of quality index metric */
            QUALITY_INDEX     : "Quality Index",
         },


         LicenseColumnId           : {
            /** Index of the format id column */
            FORMAT_ID               : {id: 0, label:"Format"} ,
            /** Index of the probe id column */
            PROBE_ID                : {id: 1, label:"Probe"},
            /** Index of the data source id column */
            SOURCE_ID               : {id: 2, label:"Source"},
            /** Index of the format id column */
            TIMESTAMP               : {id: 3, label:"Timestamp"},
            NUMBER_OF_MAC           : {id: 5, lable: ""},
            MAC_ADDRESSES           : {id: 6, lable: ""},
            EXPIRY_DATE             : {id: 7, lable: ""},
            VERSION_PROBE           : {id: 8, label: ""},
            VERSION_SDK             : {id: 9, label: ""},
         },
         StatColumn:{
            /** Index of the format id column */
            FORMAT_ID               : {id: 0, label:"Format"} ,
            /** Index of the probe id column */
            PROBE_ID                : {id: 1, label:"Probe"},
            /** Index of the data source id column */
            SOURCE_ID               : {id: 2, label:"Source"},
            /** Index of the format id column */
            TIMESTAMP               : {id: 3, label:"Timestamp"},
            CPU_USER : { id: 4, label: "User CPU" },
            CPU_SYS  : { id: 5, label: "System CPU" },
            CPU_IDLE : { id: 6, label: "IDLE CPU" },
            MEM_AVAIL: { id: 7, label: "Avail. Mem." },
            MEM_TOTAL: { id: 8, label: "Total Mem." },
            COUNT    : { id: 9, label: "" }
         },
         NdnColumn : {
            /** Index of the format id column */
            FORMAT_ID         : {id: 0,  label: "Format"},
            /** Index of the probe id column */
            PROBE_ID          : {id: 1,  label: "Probe"},
            /** Index of the data source id column */
            SOURCE_ID         : {id: 2,  label: "Source"},
            /** Index of the format id column */
            TIMESTAMP         : {id: 3,  label: "Timestamp"},
            /** Index of the application id column */
            PACKET_ID        : {id: 4,  label: "Pkt. ID"},

            /** Index of the MAC address source column */
            MAC_SRC           : {id: 5, label: "MAC Src."},
            /** Index of the MAC address source column */
            MAC_DST          : {id: 6 , label: "MAC Dst."},
            IS_OVER_TCP       : {id: 7,  label: "Parent Protocol"},
            IP_SRC            : {id: 8, label: "IP Src."},
            IP_DST           : {id: 9, label: "IP Dst."} ,
            QUERY             : {id: 10, label: "Query"},
            NAME              : {id: 11,  label: "Name"},
            PACKET_TYPE           : {id: 12, label: "Pkt. Type"},
            CAP_LEN               : {id: 13, label: "Cap. len."},
            NDN_DATA              : {id: 14, label: "NDN Data"},
            INTEREST_NONCE        : {id: 15, label: "Int. Nonce"},
            INTEREST_LIFETIME     : {id: 16, label: "Int. Lifetime"},
            DATA_FRESHNESS_PERIOD : {id: 17, label: "Refresh Period"},
            IFA 										 : {id: 18,  label: "IFA"}
         },
         NdnMetricFilter : {
            NDN_DATA              : {id: 14, label: "Data"},
            INTEREST_NONCE        : {id: 15, label: "Packet"},
         },

         OTTQoSColumn: {
            FORMAT_ID                   : {id: 0 , label: "" },
            PROBE_ID                    : {id: 1 , label: "" },
            SOURCE_ID                   : {id: 2 , label: "" },
            TIMESTAMP                   : {id: 3 , label: "" },
            VIDEO_URI                   : {id: 4 , label: "" },
            VIDEO_QUALITY               : {id: 5 , label: "Video Quality" },
            NETWORK_BITRATE             : {id: 6 , label: "Network Bitrate" },
            VIDEO_BITRATE               : {id: 7 , label: "Video Bitrate" },
            TOTAL_VIDEO_DURATION        : {id: 8 , label: "" },
            TOTAL_VIDEO_DOWNLOAD        : {id: 9 , label: "" },
            DL_RETRANSMISSION        : {id: 10, label: "Retransmision" },
            OUT_OF_ORDER                : {id: 11, label: "Out-of-order" },
            PROBABILITY_BUFFERING       : {id: 12, label: "Probability Buffering" }
         },

         /**
          * Mapping between RTP meric IDs and metric names
          */
         RTPMetricID2Name : {
            1 : "Packet Loss",
            2 : "Loss Burstiness",
            3 : "Jitter",
            4 : "Quality Index",
         },

         /**
          * Mapping between HTTP meric IDs and metric names
          */
         HTTPMetricID2Name : {
            1 : "Response Time",
            2 : "Interaction Time",
            3 : "Transactions Nb",
         },

         /**
          * Flow metric
          *
          * This will be represented as options of flow metric filters created by {@link MMTDrop.filterFactory.createFlowMetricFilter}
          *
          */
         FlowMetricFilter : {
            /** Data volume.
             *
             * This column must be created (id not in {@link MMTDrop.constants.FlowStatsColum})
             */
            DATA_VOLUME    : {id: 101, label:"Data volume"},
            /** Number of packets.
             *
             * This column must be created (id not in {@link MMTDrop.constants.FlowStatsColum})
             */
            PACKET_COUNT   : {id: 102, label:"Packet count"},
            /** Payload volume.
             *
             * This column must be created (id not in {@link MMTDrop.constants.FlowStatsColum})
             */
            PAYLOAD_VOLUME : {id: 103, label:"Payload volume"},
            /** Number of active flows
             *
             * This column must be created (id not in {@link MMTDrop.constants.FlowStatsColum})
             */
            ACTIVE_FLOWS   : {id: 104, label:"Session count"},

            /** Number of upload packets
             *
             * This column is the one from {@link MMTDrop.constants.FlowStatsColum}
             */
            UL_PACKET_COUNT: {id: 12, label:"UL Packet count"},
            /** Number of download packets
             *
             * This column is the one from {@link MMTDrop.constants.FlowStatsColum}
             */
            DL_PACKET_COUNT: {id: 13, label:"DL Packet count"},
            /** Upload data volume
             *
             * This column is the one from {@link MMTDrop.constants.FlowStatsColum}
             */
            UL_DATA_VOLUME : {id: 14, label:"UL Data volume"},
            /** Download data volume
             *
             * This column is the one from {@link MMTDrop.constants.FlowStatsColum}
             */
            DL_DATA_VOLUME : {id: 15, label:"DL Data volume"},
            /** Duration of flow
             *
             * This column is the one from {@link MMTDrop.constants.FlowStatsColum}
             */
            FLOW_DURATION  : {id: 105, label:"Flow duration"}
         },

         /**
          * A table of Protocol-Id : Name
          */
         ProtocolsIDName: {
            "-1": "_other",
            0: '_unknown',
            1: "_unknown",
            2: '163', 3: '360', 4: 'ZONE_TELECHARGEMENT', 5: '360BUY', 6: '56', 7: 'VLAN', 8: '888', 9: 'ABOUT', 10: 'ADCASH', 
            11: 'ADDTHIS', 12: 'ADF', 13: 'ADOBE', 14: 'AFP', 15: 'AH', 16: 'AIM', 17: 'AIMINI', 18: 'ALIBABA', 19: 'ALIPAY',  20: 'ALLEGRO', 
            21: 'AMAZON', 22: 'AMEBLO', 23: 'ANCESTRY', 24: 'ANGRYBIRDS', 25: 'ANSWERS', 26: 'AOL', 27: 'APPLE', 28: 'APPLEJUICE', 29: 'ARMAGETRON', 30: 'ARP', 
            31: 'ASK', 32: 'AVG', 33: 'AVI', 34: 'AWEBER', 35: 'AWS', 36: 'BABYLON', 37: 'BADOO', 38: 'BAIDU', 39: 'BANKOFAMERICA', 40: 'BARNESANDNOBLE', 
            41: 'BATMAN', 42: 'BATTLEFIELD', 43: 'BATTLENET', 44: 'BBB', 45: 'BBC_ONLINE', 46: 'BESTBUY', 47: 'BETFAIR', 48: 'BGP', 49: 'BIBLEGATEWAY', 50: 'BILD', 
            51: 'BING', 52: 'BITTORRENT', 53: 'BLEACHERREPORT', 54: 'BLOGFA', 55: 'BLOGGER', 56: 'BLOGSPOT', 57: 'BODYBUILDING', 58: 'BOOKING', 59: 'CBSSPORTS', 60: 'CENT', 
            61: 'CHANGE', 62: 'CHASE', 63: 'CHESS', 64: 'CHINAZ', 65: 'CITRIX', 66: 'CITRIXONLINE', 67: 'CLICKSOR', 68: 'CNN', 69: 'CNZZ', 70: 'COMCAST', 
            71: 'CONDUIT', 72: 'COPYSCAPE', 73: 'CORREIOS', 74: 'CRAIGSLIST', 75: 'CROSSFIRE', 76: 'DAILYMAIL', 77: 'DAILYMOTION', 78: 'DCERPC', 79: 'DIRECT_DOWNLOAD_LINK', 80: 'DEVIANTART', 
            81: 'DHCP', 82: 'DHCPV6', 83: 'DIGG', 84: 'DIRECTCONNECT', 85: 'DNS', 86: 'DOFUS', 87: 'DONANIMHABER', 88: 'DOUBAN', 89: 'DOUBLECLICK', 90: 'DROPBOX', 

            91: 'EBAY', 92: 'EDONKEY', 93: 'EGP', 94: 'EHOW', 95: 'EKSISOZLUK', 96: 'ELECTRONICSARTS', 97: 'ESP', 98: 'ESPN', 99: 'ETH', 100: 'ETSY', 
            101: 'EUROPA', 102: 'EUROSPORT', 103: 'FACEBOOK', 104: 'FACETIME', 105: 'FASTTRACK', 106: 'FC2', 107: 'FEIDIAN', 108: 'FIESTA', 109: 'FILETOPIA', 110: 'FIVERR', 
            111: 'FLASH', 112: 'FLICKR', 113: 'FLORENSIA', 114: 'FOURSQUARE', 115: 'FOX', 116: 'FREE', 117: 'FTP', 118: 'GADUGADU', 119: 'GAMEFAQS', 120: 'GAMESPOT', 
            121: 'GAP', 122: 'GARANTI', 123: 'GAZETEVATAN', 124: 'GIGAPETA', 125: 'GITHUB', 126: 'GITTIGIDIYOR', 127: 'GLOBO', 128: 'GMAIL', 129: 'GNUTELLA', 130: 'GOOGLE_MAPS', 
            131: 'GO', 132: 'GODADDY', 133: 'GOO', 134: 'GOOGLE', 135: 'GOOGLE_USER_CONTENT', 
            136: 'JEUXVIDEO', 137: 'GRE', 138: 'GROOVESHARK', 139: 'GROUPON', 140: 'GTALK', 
            141: 'GTP', 142: '20MINUTES', 143: 'GUARDIAN', 144: 'GUILDWARS', 145: 'HABERTURK', 146: 'HAO123', 147: 'HEPSIBURADA', 148: 'HI5', 149: 'HALFLIFE2', 150: 'HOMEDEPOT', 
            151: 'HOOTSUITE', 152: 'HOTMAIL', 153: 'HTTP', 154: 'REUTERS', 155: 'HTTP_PROXY', 156: 'HTTP_APPLICATION_ACTIVESYNC', 157: 'HUFFINGTON_POST', 158: 'HURRIYET', 159: 'I23V5', 160: 'IAX', 
            161: 'ICECAST', 162: 'APPLE_ICLOUD', 163: 'ICMP', 164: 'ICMPV6', 165: 'IFENG', 166: 'IGMP', 167: 'IGN', 168: 'IKEA', 169: 'IMAP', 170: 'IMAPS', 
            171: 'INTERNET_MOVIE_DATABASE', 172: 'IMESH', 173: 'ALIEXPRESS', 174: 'IMGUR', 
            175: 'LEBONCOIN', 176: 'INDIATIMES', 177: 'INSTAGRAM', 178: 'IP', 179: 'IP_IN_IP', 180: 'IPP', 
            181: 'IPSEC', 182: 'IP6', 183: 'IRC', 184: 'IRS', 185: 'APPLE_ITUNES', 186: 'UNENCRYPED_JABBER', 187: 'JAPANPOST', 188: 'KAKAO', 189: 'KAT', 
            190: 'ORANGEFR', 
            191: 'KERBEROS', 192: 'KING', 193: 'KOHLS', 194: 'KONGREGATE', 195: 'KONTIKI', 196: 'L2TP', 197: 'LASTFM', 198: 'LDAP', 199: 'LEAGUEOFLEGENDS', 200: 'LEGACY', 
            201: 'LETV', 202: 'LINKEDIN', 203: 'LIVE', 204: 'LIVEDOOR', 205: 'LIVEMAIL', 206: 'LIVEINTERNET', 207: 'LIVEJASMIN', 208: 'LIVEJOURNAL', 209: 'LIVESCORE', 210: 'LIVINGSOCIAL', 
            211: 'LOWES', 212: 'MACYS', 213: 'MAIL_RU', 214: 'FNAC', 215: 'MANOLITO', 216: 'MAPLESTORY', 217: 'MATCH', 218: 'MDNS', 219: 'MEDIAFIRE', 220: 'MEEBO', 
            221: 'MGCP', 222: 'MICROSOFT', 223: 'MILLIYET', 224: 'MINECRAFT', 225: 'MINICLIP', 226: 'MLBASEBALL', 227: 'MMO_CHAMPION', 228: 'MMS', 229: 'MOVE', 230: 'MOZILLA', 
            231: 'MPEG', 232: 'MSN', 233: 'MSSQL', 234: 'MULTIPLY', 235: 'MYNET', 236: 'MYSPACE', 237: 'MYSQL', 238: 'MYWEBSEARCH', 239: 'NBA', 240: 'NEOBUX', 
            241: 'NETBIOS', 242: 'NETFLIX', 243: 'NETFLOW', 244: 'NEWEGG', 245: 'NEWSMAX', 246: 'NFL', 247: 'NFS', 248: 'NICOVIDEO', 249: 'NIH', 250: 'NORDSTROM', 
            251: 'NTP', 252: 'NYTIMES', 253: 'ODNOKLASSNIKI', 254: 'OFF', 255: 'OGG', 256: 'ONET', 257: 'OPENFT', 258: 'ORANGEDONKEY', 259: 'OSCAR', 260: 'OSPF', 
            261: 'OUTBRAIN', 262: 'OVERSTOCK', 263: 'PANDO', 264: 'PAYPAL', 265: 'PCANYWHERE', 266: 'PCH', 267: 'PCONLINE', 268: 'PHOTOBUCKET', 269: 'PINTEREST', 270: 'PLAYSTATION', 
            271: 'POGO', 272: 'POP', 273: 'POPS', 274: 'POPO', 275: 'PORNHUB', 276: 'POSTGRES', 277: 'PPLIVE', 278: 'PPP', 279: 'PPPOE', 280: 'PPSTREAM', 
            281: 'PPTP', 282: 'PREMIERLEAGUE', 283: 'QQ', 284: 'QQLIVE', 285: 'QUAKE', 286: 'FORBES', 287: 'R10', 288: 'RADIUS', 289: 'RAKUTEN', 290: 'RDP', 
            291: 'REALMEDIA', 292: 'REDDIT', 293: 'REDTUBE', 294: 'REFERENCE', 295: 'RENREN', 296: 'ROBLOX', 297: 'ROVIO', 298: 'RTP', 299: 'RTSP', 300: 'SABAHTR', 
            301: 'SAHIBINDEN', 302: 'SALESFORCE', 303: 'SALON', 304: 'SCTP', 305: 'SEARCHNU', 306: 'SEARCH_RESULTS', 307: 'SEARS', 308: 'SECONDLIFE', 309: 'SECURESERVER', 310: 'SFLOW', 
            311: 'SHAZAM', 312: 'SHOUTCAST', 313: 'SINA', 314: 'SIP', 315: 'SITEADVISOR', 316: 'SKY', 317: 'SKYPE', 318: 'SKYROCK', 319: 'SKYSPORTS', 320: 'SLATE', 
            321: 'SLIDESHARE', 322: 'SMB', 323: 'SMTP', 324: 'SMTPS', 325: 'SNMP', 326: 'SOCRATES', 327: 'SOFTONIC', 328: 'SOGOU', 329: 'SOHU', 330: 'SOPCAST', 
            331: 'SOSO', 332: 'SOULSEEK', 333: 'SOUNDCLOUD', 334: 'SOURGEFORGE', 335: 'SPIEGEL', 336: 'SPORX', 337: 'SPOTIFY', 338: 'SQUIDOO', 339: 'SSDP', 340: 'SSH', 
            341: 'SSL', 342: 'STACK_OVERFLOW', 343: 'STATCOUNTER', 344: 'STEALTHNET', 345: 'STEAM', 346: 'STUMBLEUPON', 347: 'STUN', 348: 'SULEKHA', 349: 'SYSLOG', 350: 'TAGGED', 
            351: 'TAOBAO', 352: 'TARGET', 353: 'TCO', 354: 'TCP', 355: 'TDS', 356: 'TEAMVIEWER', 357: 'TELNET', 358: 'TFTP', 359: 'THEMEFOREST', 360: 'THE_PIRATE_BAY', 
            361: 'THUNDER', 362: 'TIANYA', 
            363: 'CDISCOUNT', 364: 'TMALL', 365: 'TORRENTZ', 366: 'TRUPHONE', 367: 'TUBE8', 368: 'TUDOU', 369: 'TUENTI', 370: 'TUMBLR', 
            371: 'TVANTS', 372: 'TVUPLAYER', 373: 'TWITTER', 374: 'UBI', 375: 'UCOZ', 376: 'UDP', 377: 'UDPLITE', 378: 'UOL', 379: 'USDEPARTMENTOFSTATE', 380: 'USENET', 
            381: 'USTREAM', 382: 'HTTP_APPLICATION_VEOHTV', 383: 'VIADEO', 384: 'VIBER', 385: 'VIMEO', 386: 'VK', 387: 'VKONTAKTE', 388: 'VNC', 389: 'WALMART', 390: 'WARRIORFORUM', 
            391: 'WAYN', 392: 'WEATHER', 393: 'WEBEX', 394: 'WEEKLYSTANDARD', 395: 'WEIBO', 396: 'WELLSFARGO', 397: 'WHATSAPP', 398: 'WIGETMEDIA', 399: 'WIKIA', 400: 'WIKIMEDIA', 
            401: 'WIKIPEDIA', 402: 'WILLIAMHILL', 403: 'WINDOWSLIVE', 404: 'WINDOWSMEDIA', 405: 'WINMX', 406: 'WINUPDATE', 407: 'WORLD_OF_KUNG_FU', 408: 'WORDPRESS_ORG', 409: 'WARCRAFT3', 410: 'WORLDOFWARCRAFT', 
            411: 'WOWHEAD', 412: 'WWE', 413: 'XBOX', 414: 'XDMCP', 415: 'XHAMSTER', 416: 'XING', 417: 'XINHUANET', 418: 'XNXX', 419: 'XVIDEOS', 420: 'YAHOO', 

            421: 'ALLOCINE', 422: 'YAHOOMAIL', 423: 'YANDEX', 424: 'YELP', 425: 'YOUKU', 426: 'YOUPORN', 427: 'YOUTUBE', 428: 'ZAPPOS', 429: 'ZATTOO', 430: 'ZEDO', 
            431: 'ZOL', 432: 'ZYNGA', 433: '3PC', 434: 'ANY_0HOP', 435: 'ANY_DFS', 436: 'ANY_HIP', 437: 'ANY_LOCAL', 438: 'ANY_PES', 439: 'ARGUS', 440: 'ARIS', 
            441: 'AX_25', 442: 'BBN_RCC_MON', 443: 'BNA', 444: 'BR_SAT_MON', 445: 'CBT', 446: 'CFTP', 447: 'CHAOS', 448: 'COMPAQ_PEER', 449: 'CPHB', 450: 'CPNX', 
            451: 'CRTP', 452: 'CRUDP', 453: 'DCCP', 454: 'DCN_MEAS', 455: 'DDP', 456: 'DDX', 457: 'DGP', 458: 'EIGRP', 459: 'EMCON', 460: 'ENCAP', 
            461: 'ETHERIP', 462: 'FC', 463: 'FIRE', 464: 'GGP', 465: 'GMTP', 466: 'HIP', 467: 'HMP', 468: 'I_NLSP', 469: 'IATP', 470: 'IDPR', 
            471: 'IDPR_CMTP', 472: 'IDRP', 473: 'IFMP', 474: 'IGP', 475: 'IL', 476: 'IPCOMP', 477: 'IPCV', 478: 'IPLT', 479: 'IPPC', 480: 'IPTM', 
            481: 'IPX_IN_IP', 482: 'IRTP', 483: 'IS_IS', 484: 'ISO_IP', 485: 'ISO_TP4', 486: 'KRYPTOLAN', 487: 'LARP', 488: 'LEAF_1', 489: 'LEAF_2', 490: 'MERIT_INP', 
            491: 'MFE_NSP', 492: 'MHRP', 493: 'MICP', 494: 'MOBILE', 495: 'MOBILITY_HEADER', 496: 'MPLS_IN_IP', 497: 'MTP', 498: 'MUX', 499: 'NARP', 500: 'NETBLT', 
            501: 'NSFNET_IGP', 502: 'NVP_II', 503: 'PGM', 504: 'PIM', 505: 'PIPE', 506: 'PNNI', 507: 'PRM', 508: 'PTP', 509: 'PUP', 510: 'PVP', 
            511: 'QNX', 512: 'RSVP', 513: 'RSVP_E2E_IGNORE', 514: 'RVD', 515: 'SAT_EXPAK', 516: 'SAT_MON', 517: 'SCC_SP', 518: 'SCPS', 519: 'SDRP', 520: 'SECURE_VMTP', 
            521: 'SHIM6', 522: 'SKIP', 523: 'SM', 524: 'SMP', 525: 'SNP', 526: 'SPRITE_RPC', 527: 'SPS', 528: 'SRP', 529: 'SSCOPMCE', 530: 'ST', 
            531: 'STP', 532: 'SUN_ND', 533: 'SWIPE', 534: 'TCF', 535: 'TLSP', 536: 'TP_PP', 537: 'TRUNK_1', 538: 'TRUNK_2', 539: 'UTI', 540: 'VINES', 
            541: 'VISA', 542: 'VMTP', 543: 'VRRP', 544: 'WB_EXPAK', 545: 'WB_MON', 546: 'WSN', 547: 'XNET', 548: 'XNS_IDP', 549: 'XTP', 550: 'BUZZNET', 
            551: 'COMEDY', 552: 'RAMBLER', 553: 'SMUGMUG', 554: 'ARCHIEVE', 555: 'CITYNEWS', 556: 'SCIENCESTAGE', 557: 'ONEWORLD', 558: 'DISQUS', 559: 'BLOGCU', 560: 'EKOLEY', 
            561: '500PX', 562: 'FOTKI', 563: 'FOTOLOG', 564: 'JALBUM', 
            565: 'LEMONDE', 566: 'PANORAMIO', 567: 'SNAPFISH', 568: 'WEBSHOTS', 569: 'MEGA', 570: 'VIDOOSH', 
            571: 'AFREECA', 572: 'WILDSCREEN', 573: 'BLOGTV', 574: 'HULU', 575: 'MEVIO', 576: 'LIVESTREAM', 577: 'LIVELEAK', 578: 'DEEZER', 579: 'BLIPTV', 580: 'BREAK', 
            581: 'CITYTV', 582: 'COMEDYCENTRAL', 583: 'ENGAGEMEDIA', 584: 'SCREENJUNKIES', 585: 'RUTUBE', 586: 'SEVENLOAD', 587: 'MUBI', 588: 'IZLESENE', 589: 'VIDEO_HOSTING', 590: 'BOX', 
            591: 'SKYDRIVE', 592: '7DIGITAL', 593: 'CLOUDFRONT', 594: 'TANGO', 595: 'WECHAT', 596: 'LINE', 597: 'BLOOMBERG', 
            598: 'LEFIGARO', 599: 'AKAMAI', 600: 'YAHOOMSG', 
            601: 'BITGRAVITY', 602: 'CACHEFLY', 603: 'CDN77', 604: 'CDNETWORKS', 605: 'CHINACACHE', 
            606: 'FRANCETVINFO', 607: 'EDGECAST', 608: 'FASTLY', 609: 'HIGHWINDS', 610: 'INTERNAP', 
            611: 'LEVEL3', 612: 'LIMELIGHT', 613: 'MAXCDN', 614: 'NETDNA', 615: 'VOXEL', 616: 'RACKSPACE', 617: 'GAMEFORGE', 618: 'METIN2', 619: 'OGAME', 620: 'BATTLEKNIGHT', 
            621: '4STORY', 622: 'FBMSG', 
            623: 'TWITCH',
            624: 'SLL',
            625: 'NDN',
            626: 'NDN_HTTP',
            627: 'QUIC',
            628: 'ORACLE',
            629: 'REDIS',
            630: 'VMWARE',
            631: 'SCTP_DATA',
            632: 'SCTP_SACK',
            633: 'SCTP_INIT',
            634: 'LLMNR',
            635: 'ECLIPSE_TCF',
            636: 'LOOPBACK',
            637: 'TPKT',
            638: 'COTP',
            639: 'S7COMM',
            640: 'CTP',
            641: 'LLC',
            642: 'XID',
            643: 'CDP',
            644: 'DTP',
            645: "SCTP_HEARTBEAT", 646: "SCTP_SHUTDOWN", 647: "SCTP_SHUTDOWN_COMPLETE", 648: "SCTP_ABORT", 649: "SCTP_ERROR", 650: "SCTP_COOKIE_ECHO",
            651: "SCTP_ECNE", 652: "SCTP_CWR", 653: "SCTP_AUTH", 654: "SCTP_ASCONF", 655: "SCTP_RE_CONFIG",
            656: "8021AD", 657: "mqtt", 658: "INT", 659: "INT_REPORT", 660: "DTLS", 661: "QUIC_IETF",
            700: "HTTP2",
            800: "IEEE802154", 801: "LOWPAN",
            900: "S1AP", 901: "DIAMETER", 902: "GTPv2", 903: "NGAP", 904: "NAS-5G"
         },

         /**
          * A table of Category-Id : Name
          */
         CategoriesIdsMap: {
            0:'All', 
            1:'Web', 
            2:'P2P', 
            3:'Gaming', 
            4:'Streaming', 
            5:'Conversational', 
            6:'Mail', 
            7:'FileTransfer', 
            8:'CloudStorage', 
            9:'DirectDownloadLink', 
            10:'Network',
            // 11:'Tunnelling',
            12:'DataBase',
            // 13:'Remote', 14:'Misc',
            15:'CDN',
            16: 'SocialNetwork',
         },

         /**
          * Maps the Protocol ID to a Protocol Name
          * @param {number} id
          * @returns {string} Protocol name
          */
         getProtocolNameFromID : function( app_id ) {
            var protocolName = protocolName =  MMTDrop.constants.ProtocolsIDName[ app_id ];;
            if( protocolName != undefined ){
               return protocolName;
            }else if( MMTDrop.constants.OtherProtocolsIDName && ( id in MMTDrop.constants.OtherProtocolsIDName)){
               var id = parseInt( app_id );
               protocolName = MMTDrop.constants.OtherProtocolsIDName[id];

               var arr = protocolName.split(":");
               if( isNaN( arr[1] ) ){
                  protocolName = arr[1]; //domain name
               }else{
                  //parent: port_number
                  protocolName = MMTDrop.constants.ProtocolsIDName[ arr[0] ] + ":" + arr[1];
               }

            }
            if( protocolName == undefined )
               return "proto_" + app_id;

            return protocolName;
         },
         getProtocolIDFromName : function( proto_name ){
            if( proto_name == undefined ) return;

            //ProtocolName
            if( proto_name.indexOf(":") == -1 ){
               for( var key in this.ProtocolsIDName )
                  if( this.ProtocolsIDName[ key ] == proto_name ){
                     return parseInt( key );
                  }
               return;
            }

            var arr = proto_name.split(":"); //protocol:port
            arr[0] = this.getProtocolIDFromName( arr[0] );
            proto_name = arr.join(":"); //proto_id:port
            for( var key in MMTDrop.constants.OtherProtocolsIDName )
               if( MMTDrop.constants.OtherProtocolsIDName[ key ] == proto_name ){
                  return parseInt( key );
               }
         },
         getAppListFromCategoryName: function( cat_name ){
            for( var key in this.CategoriesIdsMap )
               if( this.CategoriesIdsMap[ key ] == cat_name ){
                  if( this.CategoriesAppIdsMap[ key ] == undefined )
                     return [];
                  return this.CategoriesAppIdsMap[ key ];
               }
         },
         /**
          * Return the path friendly name.
          * @param {string} path application protocol path (given by application IDs)
          */
         getPathFriendlyName : function(path, separator) {
            if( path == undefined )
               return "";

            var id = path.split(".");
            var arr = [];
            for( var i=0; i<id.length; i++){
               if( id[i] == 0 )
                  arr.push( "_unk" );
               else{
                  var name = MMTDrop.constants.getProtocolNameFromID( id[i] );
                  if( name.indexOf(":") != -1 )
                     name = ":" + name.split(":")[1]; //HTTP:80 => get only :80
                  arr.push( name );
               }
            }

            if( separator == undefined )
               separator = "/";

            return arr.join(".");
         },

         /**
          * Return the parent of the given protocol path. <br>
          * ("1.2" is the parent of "1.2.3"; "." is the parent of "1")
          * @param {string} path application protocol path
          * @returns {string} parent path
          */
         getParentPath : function(path) {
            var n = path.lastIndexOf(".");
            if (n == -1) {
               return ".";
            }
            var p = path.substring(0, n);
            return p;
         },

         /**
          * Return the child of the given protocol path. <br>
          * ("2.3" is the child of "1.2.3"; "." is the child of "1")
          * @param {string} path application protocol path
          * @returns {string} child path
          */
         getChildPath : function(path) {
            var n = path.indexOf(".");
            if (n == -1) {
               return ".";
            }
            var child = path.substring(n + 1);
            return child;
         },

         /**
          * Returns the application id given the application path.
          * @param {string} path - application protocol path
          * @returns {number} application ID
          */
         getAppIdFromPath : function(path) {
            var n  = path.toString().lastIndexOf(".");
            var id = path.toString().substring(n + 1);
            return parseInt( id );
         },

         /**
          * Returns the root application id given the application path.
          * @param {string} path - application protocol path
          * @returns {string} root
          */
         getRootAppId : function(path) {
            var n = path.toString().indexOf(".");
            if (n == -1)
               return path;
            return path.toString().substring(0, n);
         },
         /**
          * Maps the Protocol ID to a Protocol Name
          * @param {number} id
          * @returns {string} Protocol Name
          */
         getCategoryNameFromID : function(id) {
            var protocolName = "_unknown";
            if ( id in MMTDrop.constants.CategoriesIdsMap)
               protocolName = MMTDrop.constants.CategoriesIdsMap[id] ;
            return protocolName;
         },
         getCategoryIdFromName : function( cat_name ){
            for( var key in this.CategoriesIdsMap )
               if( this.CategoriesIdsMap[ key ] == cat_name ){
                  return parseInt( key );
               }
            return -1;
         },
         /**
          * List of period Id.
          *
          * This will be used as:
          *
          * * options of period filters created by {@link MMTDrop.filterFactory.createPeriodFilter}.
          * * period parameter of {@link MMTDrop.Database}
          *
          */
         period : {
            MINUTE      : "minute",
            HOUR        : "hour",
            HALF_DAY    : "12hours",
            QUARTER_DAY : "6hours",
            DAY         : "day",
            WEEK        : "week",
            MONTH       : "month",
            YEAR         : "year"
         },
   };


///////////////////////////////////////////////////////////////////////////////////////////
// Add some methods to general object

// Do not add this prototype to Object.prototype. They may be called incidentally.
// These methodes can be fired automatically in some object (e.g., by: for var k in obj)
// e.g. $.ajax will try to fire all all methods (before submitting and after getting data to/from server)
///////////////////////////////////////////////////////////////////////////////////////////

   /**
    * A set of support tools
    * @namespace
    */
   MMTDrop.tools = function () {
      var _this = {}; //this = Window when this inside function(){ ... }();

      /**
       * add zero points
       * @param   {Array}    data       [[Description]]
       * @param   {Number} period_sampling  interval between 2 consecutif samples (in millisecond)
       * @param   {Number} period_total     total intervals (in millisecond)
       * @param   {Number} time_id    column id of timestamp (=3 normally)
       *
       * @returns {Array} [[Description]]
       */
      _this.addZeroPointsToData = function (data, period_sampling, time_id, start_time, end_time) {

         if (data instanceof Array == false)
            data = MMTDrop.tools.object2Array(data);

         if (time_id == undefined)
            time_id = 3;
         if (period_sampling == undefined)
            period_sampling = 5000;

         //order ASC of time
         data.sort(function (a, b) {
            return a[time_id] - b[time_id]
         })


         //add first element if need
         if( data.length == 0 || start_time < (data[0][ time_id ] - period_sampling) ){
            var zero = {};
            zero[time_id] = start_time;
            data.unshift(zero);
         }
         //add last element if need
         if( data.length == 0 || end_time > (data[ data.length - 1 ][ time_id ] + period_sampling ) ){
            var zero = {};
            zero[time_id] = end_time;
            data.push(zero);
         }

         var len    = data.length;
         var arr    = [];
         var lastTS = start_time;

         while( lastTS <= end_time ){
            lastTS += period_sampling;

            var existPoint = false;
            for (var i = 0; i < len; i++) {
               var ts = data[i][time_id];

               if( ts <= lastTS && ts > lastTS - period_sampling ){
                  existPoint       = true;
                  data[i][time_id] = lastTS;
                  arr.push(data[i]);
               }
            }

            if ( !existPoint ) {
               var zero = {};
               zero[time_id] = lastTS;
               arr.push(zero);
            }
         }
         return arr;
      };

      _this.random = function( n ){
         return Math.round(Math.random()* n);
      }
      /**
       *
       * @param   {[[integer]]} value
       * @returns {[[string]]}
       */
      _this.formatDataVolume = function (v, round) {
         if( v == undefined ) return "unknown";

         if( MMTDrop.config.format_payload !== true )
            return Math.round(v);

         if (v >= 1000000000)
            return (v / 1000000000).toFixed(2) + "G";
         if (v >= 1000000)
            return (v / 1000000).toFixed(2) + "M";
         if (v >= 1000)
            return (v / 1000).toFixed(2) + "k";
         if( round === true )
            return Math.round(v);
         return v.toFixed(2) ;
      };

      _this.formatPercentage = function( v ){
         v *= 100;
         return v.toFixed(2) + "%";
      }

      _this.formatLocaleNumber = function( v ){
         return v.toLocaleString();
      }

      _this.formatInterval = function( no_seconds, doNotShowMiliSecond ){
         if( no_seconds == undefined ) return "undefined";
         var d = Math.floor( no_seconds / 3600 / 24 );
         no_seconds -= d*3600*24;
         var h = Math.floor( no_seconds / 3600 );
         no_seconds -= h*3600;
         var m = Math.floor( no_seconds / 60 );
         no_seconds -= m*60;

         no_seconds = Math.round( no_seconds * 1000 )/1000;

         var ret = (d>0? (d + "d ") : "") + (h>0? (h + "h"): "") + (m>0? (m + "m"): "");
         if( no_seconds > 0 || ret === "" ){
            if( doNotShowMiliSecond === true )
               ret += no_seconds.toFixed(0) + "s";
            else
               ret += no_seconds.toFixed(3) + "s";
         }

         return ret;
      }

      /**
       * Get date and time string from a date object
       * @param   {Date}
       * @returns {string}
       */
      _this.formatDateTime = function (v, withMillisecond) {
         //return v.toLocaleString();
         //accept timestamp
         if( typeof v === "number")
            v = new Date( v );

         if ( isNaN( v.getTime() ) ) {
            // date is not valid
            return "n/a";
         }

         var milli = "";
         if( withMillisecond === true )
            milli = "." + ("00" + v.getMilliseconds()).slice(-3);

         var time = v.getFullYear();
         time += "-" + ("0" + (v.getMonth() + 1)).slice(-2);
         time += "-" + ("0" + v.getDate()).slice(-2);
         time += " " + ("0" + v.getHours()).slice(-2);
         time += ":" + ("0" + v.getMinutes()).slice(-2);
         time += ":" + ("0" + v.getSeconds()).slice(-2);
         time += milli ;


         return time;
      };
      _this.formatString = function( val, len ){
         if( typeof( val ) != "string" )
            return val;
         var str = val.toString();

         len = len || 50;
         if( len > str.length )
            return str;
         var new_str = str.substr( 0, len ) + "...";
         return '<span title="'+ str +'">'+ new_str +'</span>';
      };

      _this.printStack = function(){
         try{
            throw new Error( "Get Stack" );
         }catch( err ){
            console.log( err.stack );
         }
      }

      /**
       * Convert an object to an array
       * @param {Object} obj - object tobe converted
       * @returns {Array}
       * @alias object2Array
       * @memberof! MMTDrop.tools
       */
      _this.object2Array = function ( obj ){
         return Object.keys(obj).map(function(key){
            return obj[ key ];
         });
      };


      /**
       * Check whether a value existing in an array
       * @param {object} val
       * @param {Array} arr
       * @returns <code>true</code> if <code>val</code> existing in <code>arr</code>, otherwise <code>false</code>
       */
      _this.inArray = function( val, arr){
         for( var i in arr){
            if( arr[i] == val )
               return i;
         }
         return -1;
      };

      /**
       * Get the first element of an Object or Array
       * @param {object} obj
       * @returns {object} the first elemen
       * @alias getFirstElement
       * @memberof! MMTDrop.tools
       */
      _this.getFirstElement = function( obj ){
         for (var key in obj)
            if (obj.propertyIsEnumerable(key))
               return obj[key];
      };

      /**
       * Overwrites recursively obj1's values with obj2's and adds obj2's if non existent in <code>obj1</code>
       * @param {object} obj1
       * @param {object} obj2
       * @returns {object} obj1
       * @alias mergeObjects
       * @memberof! MMTDrop.tools
       */
      _this.mergeObjects = function( obj1, obj2 ){
         var ret = {}, obj = obj1;
         for (var p in obj) {
            // Property in destination object set; update its value.
            if ( obj[p] != undefined && obj[p].constructor == Object ) {
               if( ret[p] == undefined ) ret[p] = {};
               ret[p] = MMTDrop.tools.mergeObjects( ret[p], obj[p]);
            }
            else
               ret[p] = obj[p];
         }

         obj = obj2;
         for (var p in obj) {
            // Property in destination object set; update its value.
            if ( obj[p] != undefined && obj[p].constructor == Object ) {
               if( ret[p] == undefined ) ret[p] = {};
               ret[p] = MMTDrop.tools.mergeObjects( ret[p], obj[p]);
            }
            else
               ret[p] = obj[p];
         }
         return ret;
      };


      /**
       * Clone a data object
       * @param {object} obj - object tobe cloned
       * @returns {object} a new object having the same data<br/>
       * This cannot clone object's functions
       * @alias cloneData
       * @memberof! MMTDrop.tools
       */
      _this.cloneData = function (obj){
         if( Array.isArray( obj ) ){
            var _data = [];
            var msg;
            for( var i=0; i<obj.length; i++ ){
               msg = obj[i];
               if( Array.isArray( msg ))
                  msg = msg.slice( 0 );
               else
                  msg = JSON.parse( JSON.stringify( msg ) );
               _data.push( msg );
            }
            return _data;
         }

         var seen = [];
//       return JSON.parse( JSON.stringify (obj));
         var str = JSON.stringify(obj, function(key, val) {
            if (typeof(val) === "object") {
               if (seen.indexOf(val) >= 0)
                  return seen.push(val);
            }
            return val;
         });

         return JSON.parse(str);
      };

      var _uniqueNumber = 0;

      /**
       * Get an unique number.
       * This counter will be reseted when the page loaded. It starts from 1.
       * @returns {number}
       * @alias getUniqueNumber
       * @memberof! MMTDrop.tools
       */
      _this.getUniqueNumber = function(){
         return (++ _uniqueNumber);
      };

      /**
       * Generate a global unique ID
       * https://www.ietf.org/rfc/rfc4122.txt
       */
      _this.guid = function(){
         return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
         });
      }

      /**
       * Capitalize the first letter of a string
       * @param {string} str
       * @returns {string} s
       * @alias capitalizeFirstLetter
       * @memberof! MMTDrop.tools
       */
      _this.capitalizeFirstLetter = function(str) {
         return str.charAt(0).toUpperCase() + str.slice(1);
      };


      _this.localStorage = function (){
         var _prefix = function( useFullURI ){
            //each page has a separated parameter
            var pre = window.location.pathname;
            if( useFullURI )
               pre += window.location.search;

            return "mmtdrop." + pre + ".";
         };

         var _storage = window.localStorage;

//       check if browser supports localStorage
         try {
            _storage.setItem("test", "1");
            _storage.removeItem("test");
         } catch (error) {
//          parameters will be stocked into global variable @{fakeStorage}
//          ==> this variable will remove when the page being reloaded
//          TODO set code for permanent storage
            window.fakeStorage = {};
            _storage = window.fakeStorage;
         }

         var _get = function (key, useFullURI){
            useFullURI = (useFullURI !== false );
            return JSON.parse(_storage.getItem(_prefix(useFullURI) + key));
         };

         var _set = function(key, value, useFullURI){
            useFullURI = (useFullURI !== false );
            _storage.setItem(_prefix(useFullURI) + key, JSON.stringify(value));
         };

         var _remove = function (key, useFullURI){
            useFullURI = (useFullURI !== false );
            _storage.removeItem(_prefix(useFullURI) + key);
         };

         return {
            get   : _get,
            set   : _set,
            remove: _remove
         };
      }();


      _this.cookie = {
            set: function(name, value, days) {
               var expires;

               if (days) {
                  var date = new Date();
                  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                  expires = "; expires=" + date.toGMTString();
               } else {
                  expires = "";
               }
               document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
            },

            get: function(name) {
               var nameEQ = encodeURIComponent(name) + "=";
               var ca = document.cookie.split(';');
               for (var i = 0; i < ca.length; i++) {
                  var c = ca[i];
                  while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                  if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
               }
               return null;
            },

            remove: function(name) {
               createCookie(name, "", -1);
            }

      }

      /**
       * Check if an object is a function
       * @param {Object} callback - object tobe checked
       * @returns {boolean} true if yes
       * @alias isFunction
       * @memberof! MMTDrop.tools
       */
      _this.isFunction = function (callback){
         return (typeof(callback) === "function");
      };

      /**
       * Check whether a value is a number
       * @param {object} n - data to check
       * @returns {boolean} true if yes, false if no
       * @alias isNumber
       * @memberof! MMTDrop.tools
       */
      _this.isNumber = function isNumber(n) {
         return !isNaN(parseFloat(n)) && isFinite(n);
      };

      /**
       * Get value of an attribute of an object
       * Example: obj = {
       * 	a : {
       * 		b : 1
       * 	}
       * }
       * => getValue( obj, "a" ) => {b:1}
       * => getValue( obj, "b" ) => null
       * => getValue( obj, ["a","b"] ) => 1
       * => getValue( obj, ["c","b"] ) => null
       */
      _this.getValue = function( obj, attr ){
         if( Array.isArray( attr )){
            for( var i=0; i<attr.length; i++ ){
               obj = obj[ attr[i] ];

               if( obj == undefined )
                  return undefined;
            }
            return obj;
         }

         return obj[ attr ];
      }

      _this.openURLInNewTab = function( url, title, frameName) {
         if( frameName == undefined )
            frameName = "_blank";
         const win = window.open(url, frameName);
         if( win == undefined ){
            MMTDrop.alert.error("Cannot popup a new window");
         }else
            win.focus();
         return win;
      }
      _this.openURLInNewFrame = function( url, title, frameName) {
         if( frameName == undefined )
            frameName = "urlFrame";

         const $modal = _this.getModalWindow( frameName );
         $modal.$title.html( title );
         $modal.$content.html( '<iframe src="'+ url +'" style="width: 100%; height: auto"/>' );
         $modal.modal();
         return $modal;
      }

      _this.modalCounter = 0;

      _this.getModalWindow = function( id ){
         id = id || "modalWindow";

         if( $( "#" + id ).length === 0 ){
            var modal = '<div class="modal modal-wide fade" tabindex="-1" role="dialog" aria-hidden="true" id="'+ id +'">'
            +'<div class="modal-dialog">'
            +'<div class="modal-content" >'
            +'<div class="modal-header">'
            +'<button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>'
            +'<h4 class="modal-title">Title</h4>'
            +'</div>'
            +'<div class="modal-body">'
            +'<div class="modal-sub-title"/>'
            +'<div class="modal-body-content"/>'
            +'</div>'
            +'</div></div></div>';

            $("body").append( $(modal) );
         }

         var $modal       = $("#"+ id );
         $modal.$title    = $("#"+ id +" .modal-title");
         $modal.$subTitle = $("#"+ id +" .modal-sub-title");
         $modal.$content  = $("#"+ id +" .modal-body-content");
         return $modal;
      };

      _this.modal = function(domID, title, subTitle, content ){
         var $modal = _this.getModalWindow( domID );
         $modal.$title.html( title );
         $modal.$subTitle.html( subTitle );
         $modal.$content.html( content );

         //when the modal is hidden completely (will wait for CSS transitions to complete)
         $modal.on('hidden.bs.modal', function (e) {
            if( _this.modalCounter > 0 )
               _this.modalCounter --;
            else
               _this.modalCounter = 0;
         })

         //increase the number of modal windows
         if( _this.modalCounter == undefined )
            _this.modalCounter = 1;
         else
            _this.modalCounter ++;

         $modal.modal();
         return $modal;
      }

      /**
       * create DOM object and its children using jQuery
       * @param  {[type]} config
       *  {
       *    type : "<form>",
       *    attr: {
       *      action: "",
       *      method: "get"
       *    },
       *    children: [
       *      {
       *        type: "<file>",
       *        attr: {
       *        }
       *      },
       *      {
       *        type: "<button>"",
       *        attr: {
       *          text : "Upload",
       *          class: "btn btn-primary"
       *        }
       *    ]
       *  }
       * @return {[type]}        [description]
       */
      _this.createDOM = function( config ){
         if( config == undefined )
            return null;

         //combine classs
         if( config.class != undefined ){
            if( config.attr == undefined )
               config.attr = {};
            if( config.attr.class == undefined )
               config.attr.class = "";
            config.attr.class = config.class + " " + config.attr.class;
         }

         //create the object
         var $obj = $( config.type, config.attr );

         //create children and append to $obj
         for( var i in config.children ){
            var $o = _this.createDOM( config.children[ i ] );
            if( $o != undefined )
               $obj.append( $o  )
         }
         return $obj;
      };


      /**
       * create form and its children using jQuery
       * @param  {[type]} config
       *  {
       *    type : "<form>",
       *    attr: {
       *      action: "",
       *      method: "get"
       *    },
       *    children: [
       *      {
       *        type: "<input>",
       *        label: "Select file",
       *        attr: {
       *        }
       *      },
       *      {
       *        type: "<button>"",
       *        label: "Select file",
       *        attr: {
       *          text : "Upload",
       *          class: "btn btn-primary"
       *        }
       *    ]
       *  }
       * @return {[type]}        [description]
       */
      _this._domElementCount = 0;
      _this.createForm = function( config, isVertical ){
         if( config.label != undefined  ){
            if( config.attr == undefined )
               config.attr = {};

            if( config.attr.id == undefined )
               config.attr.id = "_" + (++ _this._domElementCount);
            if( config.attr.class == undefined )
               config.attr.class = "form-control";
         }

         //create the object
         var $obj = $( config.type, config.attr );
         //create children and append to $obj
         for( var i in config.children ){
            var $o = _this.createForm( config.children[ i ], isVertical );
            if( $o != undefined )
               $obj.append( $o  )
         }

         if( config.label != undefined  ){
            $obj = $("<div>", {
               "class" : "form-group"
            })
            .append( $("<label>", {
               "class": (isVertical )? "col-sm-3  control-label": "control-label",
                     "for"  : config.attr.id,
                     "text" : config.label
            }))
            .append(
                  ( isVertical )?
                        $("<div>", {class: "col-sm-9"}).append(
                              $obj
                        )
                        ://verticalAlign
                           $obj
            );
         }

         return $obj;
      };

      /**
       * Split data into n array, each array contains only element having the same value of the @{col}th column
       *
       * @param {Array} data - is an array of array
       * @param {number} col - is a key of an element of @{data}
       * @returns {{string : Array}}
       * @alias splitData
       * @memberof! MMTDrop.tools
       */
      _this.splitData = function(data, col){
         if (col == null)
            throw new Error("Need to define an id");
         if (Array.isArray (data) == false)
            return data;
         //throw new Error("Need data tobe an array");
         if (data.length === 0)
            return {};

            var obj = {};
            for (var i=0; i<data.length; i++){
               var msg = data[i];
               if (msg){
                  //if msg has the key col
                  if (col in msg){
                     var key = msg[col];
                     if (key in obj == false)
                        obj[key] = [];

                     obj[key].push(msg);
                  }
                  else
                     throw new Error(i + "th element of data does not contain the key [" + JSON.stringify(col) +"]");
               }
            }
            return obj;
      };

      /**
       * Split data
       * @returns {Object} data
       * @alias splitDataByGroupAndSubgroup
       * @memberof! MMTDrop.tools
       */
      _this.splitDataByGroupAndSubgroup = function( data, colGroup, colSubgroup){
         var obj = _this.splitData( data, colGroup );

         var obj2 = {};
         for (var i in obj){
            if (obj[i].length > 0){
               obj2[i] = _this.splitData(obj[i], colSubgroup);
            }
         }

         return obj2;
      };


      /**
       * @param {Data} data - array of array
       * @param {Array.<number>} colSums - array of numbers
       * @returns {Object}
       * @alias sumUp
       * @memberof! MMTDrop.tools
       */
      _this.sumUp = function(data, colSums){
         if (colSums == null)
            throw new Error("Need to define an id");
         if ( Array.isArray( colSums ) == false)
            colSums = [ colSums ];
         if (Array.isArray (data) == false)
            //throw new Error("Need data tobe an array");
            return data;

         var obj = {};

         for (var i=0; i<data.length; i++){
            var msg = data[i];

            for (var key in msg){
               //check if key existing in colSums
               if ((colSums.length === 1 && colSums[0] != key) || MMTDrop.tools.inArray(key, colSums) == -1)
                  continue;
               var val = msg[key];

               if ( val == null)
                  continue;

               var isNumber = typeof( val ) === "number";//MMTDrop.tools.isNumber(msg[key]);
               if (obj[key] == null){
                  if (isNumber)
                     obj[key] = 0;
                  else
                     obj[key] = [];
               }


               if (isNumber)
                  obj[key] += parseInt( val ); //store only the total of values
               else
                  if( obj[key].indexOf( val ) == -1 )
                     obj[key].push( val );    //store all distinguished values
            }
         }

         return obj;
      };

      /**
       * Sum data by group
       * @return {{string: Array.<Array>}}
       * @see {@link MMTDrop.tools#sumByGroups}
       * @alias sumByGroup
       * @memberof! MMTDrop.tools
       */
      _this.sumByGroup = function(data, colsSum, colGroup){
         return _this.sumByGroups( data, colsSum, [colGroup]);
      };

      /**
       * Sum up element of {@link Data} by group, sub group, ... and so more
       * @param {Data} data
       * @param {Index[]} colsToSum list of column Ids to sumup
       * @param {Index[]} colsToGroup list of column Ids to group by
       * @return {Data} data
       * @alias sumByGroups
       * @memberof! MMTDrop.tools
       */
      _this.sumByGroups = function( data, colsToSum, colsToGroup){
         if (colsToSum == null)
            throw new Error("Need one column tobe sumUp");

         if( Array.isArray( colsToGroup ) == false || colsToGroup.length == 0 )
            return _this.sumUp( data, colsToSum );

         colsToGroup = colsToGroup.slice(0);  //clone colsToGroup
         var col = colsToGroup.shift();      //remove the first elem

         var obj = _this.splitData( data, col );
         for (var i in obj){
            var o = obj[i];

            obj[i] = _this.sumByGroups(o, colsToSum, colsToGroup);
         }

         return obj;
      };


      /**
       * Sum data by group and subgroup
       * @returns {{string : Array<{string: Array}>}}
       * @see {@link MMTDrop.tools#sumByGroups}
       * @alias sumByGroupAndSubgroup
       * @memberof! MMTDrop.tools
       */
      _this.sumByGroupAndSubgroup = function( data, colsSum, colGroup, colSubgroup){
         if (colGroup == null)
            throw new Error("Need one column tobe grouped");
         if (colSubgroup == null)
            throw new Error("Need one column tobe sub grouped");

         return _this.sumByGroups( data, colsSum, [colGroup, colSubgroup]);
      };

      _this.parseURLParameters = function( url ){
         var obj    = {}, hash,
         hashes = url.split("&");

         for(var i = 0; i < hashes.length; i++){
            hash = hashes[i].split('=');
            obj[hash[0]] = hash[1];
         }
         return obj;
      };
      /**
       * Get an object representing the parameters of the current url
       * @return {[type]} [description]
       */
      _this.getURLParameters  = function( key ){
         var d = window.location.href.indexOf('?');
         if( d == -1 )
            return {};

            var hashes = window.location.href.slice(d + 1);
            var vars = _this.parseURLParameters( hashes );
            if( key )
               return vars[ key ];

            return vars;
      };

      _this.createStylesheet = function( content ){
         $('<style>',{
            type : "text/css",
            html : content
         }).appendTo("head");
      };

      _this.getQueryString = function( param, add_query_str ){
         var obj     = _this.getURLParameters();
         var arr     = [];
         var add_obj = {};
         if( add_query_str !== undefined && add_query_str !== "" ){
            add_obj = _this.parseURLParameters( add_query_str );
         }

         var paramObj;

         //get all parameters
         if( !Array.isArray( param ) ){
            paramObj = obj;
         }else{
            paramObj = {};

            //by default, we maintain the following parameters: 
            ["app_id", "probe_id", "period" ].forEach( function(el){
               paramObj[ el ] = true;
            } );
            param.forEach( function( el){
               paramObj[ el ] = true;
            } );
         }

         for( var i in paramObj ){
            var val = obj[ i ];
            if( val != undefined && add_obj[ i ] == undefined )
               arr.push( i + "=" +  val);
         }

         for(  var i in add_obj ){
            if( !(add_obj[i] == undefined || add_obj[i] == "undefined" || add_obj[i] == "null" ))
               arr.push( i + "=" + add_obj[i] )
         }
         /*
    if( add_query_str !== undefined && add_query_str !== "" ){
      arr.push( add_query_str );
    }*/

         if( arr.length > 0 )
            arr = "?" + arr.join("&");
         else
            arr = "";
         return arr;
      };
      _this.getCurrentURL = function( param, add_query_str ){
         var href = window.location.href;
         if( href.indexOf( "#") > 1 )
            href = href.substr(0, href.indexOf("#"));
         if( href.indexOf( "?") > 1 )
            href = href.substr(0, href.indexOf("?"));

         return href + _this.getQueryString( param, add_query_str);
      };
      _this.gotoURL = function( url, options ){
         var param = "";
         if( options && options.param )
            param = _this.getQueryString( options.param, options.add );

         document.location.href = url + param;
         throw new Error("abort to goto " + url);
      },
      _this.reloadPage = function( add_param_string ){
         _this.gotoURL( _this.getCurrentURL( null, add_param_string) );
      }

      _this.proxy = function( url, data, method, callback, options ){
         _this.ajax( "/proxy?url="+ url, data, method, callback, options  ); 
      },
      _this.ajax  =  function( url, data, method, callback, options ){
         options = options || {};

         //convert to string for POST request
         if( method == "POST")
            if( typeof data == "object" )
               data = JSON.stringify( data );

         // asyn
         if (callback) {
            //callback is a function => that is call when success
            if( typeof callback == "function" ){
               callback = {
                     success: callback
               };
            }

            //if ignore "error" => call alert
            if( callback.error == undefined )
               callback.error = function( err ){
               var text = "<b>" + err.statusText + "</b>:<br/>" + err.responseText;
               if( ! MMTDrop.config.others.is_in_debug_mode ){
                  console.error( text );
                  text = "Cannot connect to server";
               }
               MMTDrop.alert.error( text )
            }


            $.ajax({
               url        : url,
               type       : method,
               headers    : options.headers,
               dataType   : options.dataType ? options.dataType :"json",
                     contentType: options.contentType ? options.contentType : "application/json",
                           data       : data,
                           cache      : (method == "GET" ? true: false),
                           timeout    : options.timeout? options.timeout : (MMTDrop.config.db_timeout ? MMTDrop.config.db_timeout : 60000), //60 seconds
                                 error      : callback.error, // (xhr, status, error),
                                 success    : function(data) {
                                    callback.success(data);
                                 },
                                 statusCode: {
                                    //acces denied
                                    403 : function (){
                                       if( callback.error ) return; MMTDrop.alert.error( "Forbidden", 5);
                                    },

                                    404 : function (){ if( callback.error ) return; MMTDrop.alert.error( "Page not found", 10); },
                                    500 : function (){ if( callback.error ) return; MMTDrop.alert.error( "Internal Error 500", 10); }
                                 }
            });
            return;
         }


         var data = {};
         $.ajax({
            url  : url,
            type : method,
            dataType : "json",
            contentType: "application/json",
            data  : data,
            cache : (method == "GET" ? true: false),
            async : false,
            timeout    : MMTDrop.config.db_timeout ? MMTDrop.config.db_timeout : 10000, //10 seconds
                  error : function(xhr, status, error) {
                     throw new Error("Cannot get data from database. " + error);
                     return null;
                  },
                  success : function(d) {
                     data = d;

                  }
         });
         return data;
      };
      return _this;
   }();


///////////////////////////////////////////////////////////////////////////////////////////
// class MMTDrop.Database
// get data from database via MMT-Operator
///////////////////////////////////////////////////////////////////////////////////////////


   /**
    * @class
    * A class representing data getting from server
    * @param {DatabaseParam} param
    * @param {DatabaseProcessFn} [dataProcessingFn=null] - processing data
    * @param {boolean} [isAutoLoad=false] auto load data for the first call of <code>data()</code>
    * @constructor
    */
   MMTDrop.Database = function(param, dataProcessingFn, isAutoLoad) {
      //add to list of created object
      if( MMTDrop.object.database == undefined )
         MMTDrop.object.database = [];
      MMTDrop.object.database.push( this );

      //this an abstract class
      //if (this.constructor === MMTDrop.Database){
      //  throw new Error("Cannot instantiate abstract class MMTDrop.Database\n" +
      //      "Try with MMTDrop.Database.Traffic/Flow/Raw or create a new one!");
      //}
      if( isAutoLoad ==undefined )
         isAutoLoad = false;

      var _serverURL = MMTDrop.config.serverURL || "http://localhost:8088";
      if (_serverURL.substring(_serverURL.length - 1, 1) !== "/")
         _serverURL += '/';
            
      var _param = param || {};
      var _data = [];        //it is data getting from MMT-Operator and it can    be modified during using of this object
      var _originalData = []; //it is data getting from MMT-Operator and it cannot be modified
      var _this = this;    //pointer using in private methods

      var _reloadCallback = []; //list of functions being called after db reloaded

      this.afterReload = function( cb ){
         _reloadCallback.push( cb );
      }
      this.updateParameter = null;

      this.delete = function(){
         _data = [];
         _originalData = [];
         _callbacks = [];
         _reloadCallback = [];
         if( _sockets )
            for( var i in _sockets)
               _sockets[i].disconnect();

         var db = MMTDrop.object.database;
         for( var i in db )
            if( db[i] == this ){
               db.splice( i, 1 );
               break;
            }
      }
      /**
       * Get data of database
       * @returns {Data} data
       *//**
       * Set data
       * @param {Data} val
       * @returns {MMTDrop.Database} this
       */
      this.data = function( val ){
         if (val == undefined){
            return _data ;
         }
         //do something here
         _data = val;
         return this;
      };

      this.time = {
            begin: 0,
            end  : 0
      };

      var isFirstTime = true;
      /**
       * Reload data from MMT-Operator.
       * @param {DatabaseParam} [new_param=null] - a new parameter of database.
       * The new parameter will merge with the current one of the database.
       * @see {@link MMTDrop.tools#mergeObjects}
       */
      this.reload = function(new_param, callback, user_data){
         if( typeof this.updateParameter == "function" ){
            var user_param = this.updateParameter( _param );
            if( user_param != undefined )
               _param = MMTDrop.tools.mergeObjects(_param, user_param);
         }

         if (new_param && _param.no_override_when_reload !== true ){
            _param = MMTDrop.tools.mergeObjects(_param, new_param);
         }

         if( isFirstTime ){
            _param.isReload = false;
            isFirstTime = false;
            console.log("Load database: " + JSON.stringify(_param));
         }else{
            _param.isReload = true;
            console.log("Reload database: " + JSON.stringify(_param));
         }
         const onSuccess = function( newData ){
            //dismiss error message if any
            $("#alertify-db-error").trigger("click");

            console.log("  - got " + newData.data.length + " elements");
            _originalData = newData.data;
            _this.time    = newData.time;
            if( newData.probeStatus )
               _this.probeStatus = newData.probeStatus;
            if( newData.protocols )
               MMTDrop.constants.OtherProtocolsIDName = newData.protocols;

            if (typeof(dataProcessingFn) == "function"){
               _originalData = dataProcessingFn( _originalData );
            }

            this.reset();

            if( callback ) callback( _originalData, user_data );
            for( var i in _reloadCallback )
               _reloadCallback[i]( _originalData, user_data );
         };

         var getDataFn = _get;

         if( param.id != undefined )
            getDataFn = _getRestful;
         
         
         getDataFn (_param, {
            success: onSuccess.bind( this ),
            error  : function( xhr, status, msg){
               if( status == "timeout")
                  msg = "Error: Connection timeout";
               else if( msg == "" || msg == undefined ){
                  msg = 'Error: Cannot connect to server</span>';
               }else
                  msg = "Error: " + msg;

               MMTDrop.alert.error( '<span id="alertify-db-error">' + msg + '</span>', 10000 );
            }
         });

      };

      /**
       * This resets any changes of data.
       */
      this.reset = function(){
         if (_originalData){
            _data = MMTDrop.tools.cloneData(_originalData);
         }
      };


      var _callbacks = {};
      var _sockets    = {};

      /**
       * Register a callback when receiving a new message in realtime from MMT-Operator.
       *
       * @param {function} callback The callback will be passed two paramenters: the received message and the <code>userData</code>
       * @param {object} userData
       */
      this.onMessage = function( channel, callback, userData ){
         if( channel == null )
            channel = "protocol.flow.stat";

         if( _callbacks[ channel ]  == undefined )
            _callbacks[ channel ] = [];
         else{
            if(MMTDrop.tools.isFunction( callback ))
               _callbacks[ channel ].push( {callback: callback, data: userData} );
            //io was created before
            return;
         }

         if(MMTDrop.tools.isFunction( callback )){
            _callbacks[ channel ].push( {callback: callback, data: userData} );
         }
         else
            return;

         if( _sockets[ channel ] == null){
            var socket = new io.connect(MMTDrop.config.serverURL);
            socket.emit("subscribe", channel );
            socket.on( channel , function( msg ){
               console.log( "received " + msg.length + " records from server on the channel " + channel);
               //update database with new message
               //_originalData.shift();
               //_originalData.push( msg );
               _originalData = _originalData.concat( msg );
               _data = _data.concat( msg );

               var cb = _callbacks[ channel ];
               //fire callbacks
               for( var i=0; i<cb.length; i++){
                  var fn = cb[i];
                  fn.callback( msg, fn.data );
               }
            });
            _sockets[ channel ] = socket;
         }
      };

      /**
       * Statistic
       * @type {object}
       */
      this.stat = function(){
         var stat = {};

         /**
          * Group data by probeID
          * @alias stat.splitDataByProbe
          * @memberof! MMTDrop.Database#
          */
         stat.splitDataByProbe = function(){
            return MMTDrop.tools.splitData( _this.data(),
                  MMTDrop.constants.StatsColumn.PROBE_ID.id);
         };


         /**
          * Get set of probe
          * @returns {string[]} list of probe Ids existing in data
          * @alias stat.getProbes
          * @memberof! MMTDrop.Database#
          */
         stat.getProbes = function(){
            var obj = MMTDrop.tools.splitData( _this.data(),
                  MMTDrop.constants.StatsColumn.PROBE_ID.id);
            return Object.keys( obj );
         };

         /**
          * Filter out data that do not satisfy some criteria.
          * This function does not change data <code>Database.data()</code>
          * @param {Array.<{id: Value, data: object[]}>} criteria List of criteria to retain data.
          * It states that each element <code>msg</code> of <code>Database.data()</code> having <code>msg[id]</code> equals to
          * one of element in <code>data</code>.
          * @return {Data} data after filtering out.
          * @alias stat.filter
          * @memberof! MMTDrop.Database#
          */
         stat.filter = function( criteria, data ){
            var arr = [];
            if( data === undefined )
               data = _this.data();
            for( var i in data){
               var msg = data[i];
               var satisfy = true;
               for( var j in criteria){
                  var c = criteria[j];
                  var val = msg[c.id];
                  if( c.data.indexOf( val ) == -1){
                     satisfy = false;
                     break;
                  }
               }
               if( satisfy )
                  arr.push( msg );
            }
            return arr;
         };

         return stat;
      }();
      
      /**
       * Get data from restful api
       */
      function _getRestful( param, callback ){
         if( param == undefined )
            param = {};
         
         //auto add time if it is not defined
         if( param.period === undefined && typeof( status_db ) !== 'undefined')
            param.period = status_db.time
         
         if( param.query == undefined )
            param.query = {};
         
         //auto add probe filter if it is not defined
         if( param.probe === undefined  && typeof( fProbe ) !== 'undefined'){
            var probe_id = parseInt( fProbe.selectedOption().id );
            if( probe_id !== 0 )
               param.query.probe = probe_id;
         }
         

         var url = _serverURL + "restful/" + param.id + '/' + param.period.begin + '/' + param.period.end;
         var query = param.query; //JSON.stringify( param.query );
         MMTDrop.tools.ajax(url, query, "GET", callback);
      };
      
      function _get(param, callback) {
         var url = _serverURL + 'api';
         
         if( param.url !== undefined )
            return MMTDrop.tools.ajax( param.url, param, "GET", callback );

         //old
         if( param.collection == undefined ){
            return MMTDrop.tools.ajax( url, param, "GET", callback );
         }

         //new
         if( param.action == undefined ){
            throw new Error("action is not defined");
            return;
         }
         
         var group_by = "";
         if( param.no_group == undefined )
            switch ( param.period_groupby ) {
            case MMTDrop.constants.period.MINUTE:
            case MMTDrop.constants.period.HOUR:
               group_by = "_real";
               break;
            case MMTDrop.constants.period.HALF_DAY:
            case MMTDrop.constants.period.QUARTER_DAY:
            case MMTDrop.constants.period.DAY:
               group_by = "_minute";
               break;
            case MMTDrop.constants.period.WEEK:
            case MMTDrop.constants.period.MONTH:
               group_by = "_hour";
               break;
            case MMTDrop.constants.period.YEAR:
               group_by = "_day";
               break;
            default:
            }

         //data_ip + "_" + real
         url += "/" + param.collection + group_by + "/" + param.action;
         if( param.raw )
            url += "?raw";

         var query = [];
         if( param.query != undefined ){
            if( !Array.isArray( param.query ))
               throw new Error("query must be an Array");

            //clone
            query = param.query.slice(0);
         }

         if( param.period != undefined || param.probe != undefined ){
            var $match = {};

            //if the first stage is $match, then add this condition
            if( query[0]["$match"] != undefined )
               $match = query[0]["$match"];
            else
               query.unshift( {"$match" : $match} );

            //timestamp
            if( param.period != undefined )
               $match[ MMTDrop.constants.StatsColumn.TIMESTAMP.id ] =  {"$gte": param.period.begin, "$lte" : param.period.end };

            if( param.probe != undefined ){
               if( ! Array.isArray( param.probe ) )
                  $match[ MMTDrop.constants.StatsColumn.PROBE_ID.id ] = param.probe;
               else
                  $match[ MMTDrop.constants.StatsColumn.PROBE_ID.id ] = {$in:  param.probe};
            }
         }
         
         if( param.action == "aggregate" ){
            if( ! param.keepId )
               query.push({$project: {_id: 0}})
         }
         
         //need for "POST"
         query = JSON.stringify( query );
         MMTDrop.tools.ajax(url, query, "POST", callback);
      }

      /*
       * Get data from MMT-Operator
       *
       * @param param = {
       *            format: {99, 0, 1, 2, 3}, //default: 99 <br/> probe : set of
       *            number // any <br/> source: set of text // any <br/> period:
       *            {minute, hour, day, week, month} // minute <br/> raw : {true,
       *            false} // true <br/>
       * @param callback -
       *            is an object containing callback functions. It has form
       *            {error: callback1, success: callback2}: callback1 and
       *            callback2 are called when getting data fail or success,
       *            respectively.<br/> They take the form:
       * @{callback1(xhr, status, error)} and
       * @{callback2(data)}
       * @returns null if the parameter
       * {@link callback} presents. Otherwise, the function is call synchronously and
       *             returns
       * {@link data} after getting them from database<br/>. The return data is an
       *         object. Each key-value is a pair of probeID and its data.
       *
       */
   };

   /**
    * Create new instances of {@link MMTDrop.Database}.
    *
    * Add some special processing depending on kinds of data format, see {@link MMTDrop.constants.CsvFormat}.
    * @namespace
    */
   MMTDrop.databaseFactory = {
         /**
          * Create database for statistic of traffic (format = 99)
          * @param {DatabaseParam} param option to get data from server.
          * It will be overridden <code>format</code> property, e.g., <code>param.format=99</code>
          * @param {boolean} [isAutoLoad=false] - if it is true, database will load automatically when its data property is call for the first time
          * @returns {MMTDrop.DatabaseStat} database
          */
         createStatDB : function(param, isAutoLoad){
            param = param || {};
            //overwrite format to 99
            param.format = MMTDrop.constants.CsvFormat.SESSION_STATS_FORMAT;

            var db = new MMTDrop.Database(param, function (data){
               return data;
            },
            isAutoLoad);


            db.stat.sumDataByParent = function( ){

               var data = db.data();
               //how data is processed for stat
               var COL = MMTDrop.constants.StatsColumn;
               var colsToSum = [COL.ACTIVE_FLOWS.id, COL.DATA_VOLUME.id,
                  COL.PAYLOAD_VOLUME.id, COL.PACKET_COUNT.id]

               var obj = {};
               var ms, msg, ts, probe, src, path;
               for( var i in data ){
                  msg = data[i];
                  ts    = msg[ COL.TIMESTAMP.id ];
                  probe = msg[ COL.PROBE_ID.id ];
                  src   = msg[ COL.SOURCE_ID.id ];
                  path  = msg[ COL.APP_PATH.id ];

                  if( obj[ts]                    === undefined ) obj[ts]                    = {};
                  if( obj[ts][probe]             === undefined ) obj[ts][probe]             = {};
                  if( obj[ts][probe][src]        === undefined ) obj[ts][probe][src]        = {};

                  if( obj[ts][probe][src][path]  === undefined ) obj[ts][probe][src][path]  = msg;
                  else{
                     ms = obj[ts][probe][src][path];
                     for( var j=0; j<colsToSum.length; j++)
                        ms[ colsToSum[j] ] += msg[ colsToSum[j] ];
                  }
               }

               for (var time in obj)
                  for (var probe in obj[time])
                     for (var src in obj[time][probe]) {
                        data = obj[time][probe][src];

                        //STEP 1.
                        var hasChildren = {};

                        var keys = Object.keys(data); //keys is a set of APP_PATH
                        for (var i = 0; i < keys.length; i++) {
                           var key = keys[i];

                           hasChildren[key] = false;

                           for (var j = 0; j < keys.length; j++) {
                              if (i == j)
                                 continue;
                              if (keys[j].indexOf( key + ".") === 0 ) {
                                 hasChildren[key] = true;
                                 break;
                              }
                           }
                        }

                        for (var i = 0; i < keys.length; i++) {
                           var key = keys[ i ];
                           //if this has child
                           if (hasChildren[key]) {
                              var msg = data[key];

                              //create a new child of msg
                              var child = MMTDrop.tools.cloneData(msg);

                              var path = key + '.-1'; //
                              //add new child to data
                              data[path] = child;
                              hasChildren[path] = false;

                              //the data of msg will be represented by it child
                              // ==> reset data of msg to zero
                              for (var k in colsToSum)
                                 if (colsToSum[k] in msg)
                                    msg[colsToSum[k]] = 0;
                           }
                        }


                        //STEP 2. sumUp
                        keys = Object.keys(data); //keys is a set of APP_PATH
                        for (var i = 0; i < keys.length; i++) {
                           var key = keys[i];
                           if (hasChildren[key] == true)
                              continue;

                           var msg = data[key];
                           var parentKey = MMTDrop.constants.getParentPath(key);
                           //sum up
                           while (parentKey != ".") {

                              var parentMsg = data[parentKey];

                              //if parent does not exist, create it and add it to data
                              if (parentMsg === undefined) {
                                 parentMsg = MMTDrop.tools.cloneData(msg);
                                 data[parentKey] = parentMsg;
                              }
                              //if parent exists, cummulate its child
                              else
                                 for (var k in colsToSum) {
                                    var col = colsToSum[k];
                                    if (col in msg) {
                                       parentMsg[col] += msg[col];
                                    }
                                 }

                              parentKey = MMTDrop.constants.getParentPath(parentKey);
                           }
                        }
                     }

               data = [];
               for (var time in obj)
                  for (var probe in obj[time])
                     for (var src in obj[time][probe])
                        for (var path in obj[time][probe][src]) {
                           var msg = obj[time][probe][src][path];
                           //msg[COL.FORMAT_ID.id] = MMTDrop.constants.CsvFormat.SESSION_STATS_FORMAT;
                           //msg[COL.PROBE_ID.id]  = parseInt(probe);
                           //msg[COL.SOURCE_ID.id] = src;
                           //msg[COL.TIMESTAMP.id] = parseInt(time);
                           msg[COL.APP_PATH.id]  = path;
                           msg[COL.APP_ID.id]    = MMTDrop.constants.getAppIdFromPath(path);
                           //msg[ COL.APP_ID.id  ] = MMTDrop.constants.getProtocolNameFromID( MMTDrop.constants.getAppIdFromPath( path ) );
                           data.push(msg);
                        }
               return data;
            }


            /**
             * Change path of application Ids to path of application names
             * @param {Data} data
             * @return {Data} data after update path Ids
             * @alias stat.updateFriendlyAppName
             * @memberof! MMTDrop.dataFactory.createStatDB
             */
            db.stat.updateFriendlyAppName = function( data ){
               data = MMTDrop.tools.cloneData( data );
               var k = MMTDrop.constants.StatsColumn.APP_ID.id;
               for (var i in data){
                  var msg = data[i];
                  if (k in msg)
                     msg[k] = MMTDrop.constants.getProtocolNameFromID(msg[k]);
               }
               return data;
            };

            /**
             * Get applications in database
             * @return {Object} of application ID
             */
            db.stat.splitDataByApp = function(){
               return MMTDrop.tools.splitData(db.data(), MMTDrop.constants.StatsColumn.APP_ID.id);
            };


            /**
             * Get set of AppID
             */
            db.stat.getAppIDs = function(){
               var obj = db.stat.splitDataByApp();
               var keys = Object.keys( obj );
               return keys;
            };

            /**
             * Get set of class Ids
             */
            db.stat.getAppClasses = function(){
               var obj = db.stat.splitDataByClass();
               var keys = Object.keys( obj );
               return keys;
            };

            /**
             * Get categories in database
             */
            db.stat.splitDataByClass = function(){
               var data = db.data();
               var obj = {};
               var catId = -1;
               var path ;
               for (var i=0; i<data.length; i++){
                  catId = data[i][MMTDrop.constants.StatsColumn.PROFILE_ID.id];

                  if (obj[catId] == null)
                     obj[catId] = [];
                  obj[catId].push( data[i] );
               }

               return obj;
            };

            /**
             * Create data for Timeline chart
             * @param {Index} col - column to be calculated
             * @param {boolean} [isAppPath=true]   - labeling of series by app name or path name
             * @param {boolean} [isInAppMode=true] - a threshold to decide show a serie for each probe of total data or
             * a serie for each app (or path) of each probe
             * @return {ChartData}
             */
            db.stat.getDataTimeForChart = function( col, isAppPath, isInAppMode){

               col = col || MMTDrop.constants.StatsColumn.PACKET_COUNT;

               var label = col.label;
               col       = col.id;

               var group = {id: MMTDrop.constants.StatsColumn.APP_ID.id, label: "Name"};

               if( isAppPath == null || isAppPath ){
                  group = {id: MMTDrop.constants.StatsColumn.APP_PATH.id, label: "Name"};
                  isAppPath = true;
               }
               else
                  isAppPath = false;

               if( isInAppMode == null)
                  isInAppMode = true;


               //splite data by probes
               //probes is an object each key is a probeId and value of key is msg containing this probeId
               var probes = db.stat.getProbes();
               var noProbe = probes.length;              //numbere of Probe

               var header = [];
               var columns = [MMTDrop.constants.StatsColumn.TIMESTAMP];
               var arr    = [];

               //If there are more than 1 apps && 1 probes
               // ==> show a line of total for each probe
               //       install of showing a line for each app of each probe
               if( isInAppMode == false ){

                  var obj = MMTDrop.tools.sumByGroups(
                        db.data(),
                        [col],
                        [MMTDrop.constants.StatsColumn.TIMESTAMP.id,
                           MMTDrop.constants.StatsColumn.PROBE_ID.id]
                  );

                  if( noProbe == 1)
                     columns.push( {id: col, label: "Probe " + probes[0]});
                  else
                     columns.push( {id: col, label: "Probe", probes: probes} );
                  //the first column is timestamp
                  //the next column are probes
                  for( var time in obj){
                     var oo = {};

                     oo[ MMTDrop.constants.StatsColumn.TIMESTAMP.id ] = time;
                     oo[ col ] = {};
                     for(var probe in obj[time])
                        if( noProbe > 1)
                           oo[ col ][ probe ] = obj[time][probe][col];
                        else
                           oo[ col ] = obj[time][probe][col];

                     arr.push( oo );
                  }
               }
               else{

                  var obj = MMTDrop.tools.sumByGroups(
                        db.data(),
                        [col],
                        [
                           MMTDrop.constants.StatsColumn.TIMESTAMP.id,
                           group.id,
                           MMTDrop.constants.StatsColumn.PROBE_ID.id]
                  );


                  for( var time in obj ){
                     var oo = {};
                     //the first column is timestamp
                     oo[ MMTDrop.constants.StatsColumn.TIMESTAMP.id ] = parseInt( time );

                     for ( var app in obj[time] ){
                        var key = app;

                        if( header.indexOf( key ) == -1){
                           header.push( key );

                           var appName;
                           if( isAppPath )
                              appName = MMTDrop.constants.getPathFriendlyName( app );
                           else
                              appName = MMTDrop.constants.getProtocolNameFromID( app );

                           if( noProbe > 1 )
                              columns.push( {id: key, label: appName, probes: probes});
                           else
                              columns.push( {id: key, label: appName});
                        }

                        oo[key] = {};
                        for( var probe in obj[ time ][ app ])
                           if( noProbe == 1)
                              oo[key] = obj[time][app][probe][col];
                           else
                              oo[key][probe] = obj[time][app][probe][col];
                     }
                     arr.push( oo );
                  }
               }

               return {data: arr, columns: columns, ylabel: label, probes: probes};
            };

            /**
             * Create data for Table/Tree/Pie/Bar/ charts
             * @param {Index[]} cols - columns tobe calculated
             * @param {boolean} [isAppPath = true] - labeling series by APP_ID name or APP_PATH name
             * @return {ChartData}
             */
            db.stat.getDataTableForChart = function( args, isAppPath ){
               //pre-trait args
               if( Array.isArray( args) == false || args.length == 0 ){
                  args = [{id: MMTDrop.constants.StatsColumn.PACKET_COUNT.id, label: "Packets"}];
                  console.log( "  use default arguments: " + JSON.stringify( args ) );
               }

               var group = {id: MMTDrop.constants.StatsColumn.APP_ID.id, label: "Name"};

               if( isAppPath == null || isAppPath ){
                  group = {id: MMTDrop.constants.StatsColumn.APP_PATH.id, label: "Name"};
                  isAppPath = true;
               }
               else
                  isAppPath = false;

               var label = "";
               if( args.length == 1)
                  label = args[0].label;

               //id of columns tobe sumUp
               var cols = [];
               for( var i in args )
                  cols.push( args[i].id );

               var obj = MMTDrop.tools.sumByGroups( db.data(),
                     cols,
                     [group.id,
                        MMTDrop.constants.StatsColumn.PROBE_ID.id]);

               //splite data by probes
               //probes is an object each key is a probeId and value of key is msg containing this probeId
               var probes = db.stat.getProbes();
               var nProbe = probes.length;

               var data = [];
               for( var app in obj){
                  var o = {};
                  if( isAppPath)
                     o[group.id] = app;
                  else
                     o[group.id] = MMTDrop.constants.getProtocolNameFromID( app );

                  var isZero = true;

                  for( var i in args){
                     var oo = {};
                     var temp = 0;
                     for( var prob in obj[app] ){
                        temp = obj[app][prob][ args[i].id ];

                        if( !isNaN(temp) && parseInt(temp) != 0 )
                           isZero = false;

                        oo[prob] = temp;
                     }
                     //asign to value if there is only one probe
                     if( nProbe == 1)
                        o[ args[i].id ] = temp;
                     else
                        o[ args[i].id ] = oo;
                  }

                  //only add the item o if there data number != 0
                  if( isZero == false)
                     data.push( o );
               }
               //columns to show. The first column is APP_PATH
               var columns = [ group ];

               for( var i in args ){
                  if( nProbe == 1)
                     columns.push( args[i] );
                  else{
                     columns.push( {id: args[i].id, label: args[i].label, probes: probes } );
                  }
               }

               return {data: data, columns: columns, probes: probes, ylabel: label};
            };

            return db;
         },

         /**
          * Create database for statistic of flow (format = 0)
          * @param {DatabaseParam} param It will be overridden with <code>param.format = 0 </code>
          * @returns {MMTDrop.Database}
          */
         createFlowDB : function (param, isAutoLoad){
            param = param || {};
            //overwrite format to 0
            if( param.format == undefined )
               param.format = [0, 1, 2];

            var db = new MMTDrop.Database(param, function( data ){
               //how data is process for flow
               var COL  = MMTDrop.constants.FlowMetricFilter;
               var FLOW = MMTDrop.constants.FlowStatsColumn;
               var arr = [];
               for(var i=0; i<data.length; i++){
                  var msg = {};
                  for( var j in data[i])
                     msg[j] = data[i][j];

                  //add some other properties
                  msg[ COL.PAYLOAD_VOLUME.id ] =
                     msg[ COL.DATA_VOLUME.id ] = msg[ FLOW.UL_DATA_VOLUME.id ]  + msg[ FLOW.DL_DATA_VOLUME.id ];

                  msg[ COL.PACKET_COUNT.id ]   = msg[ FLOW.UL_PACKET_COUNT.id ] + msg[ FLOW.DL_PACKET_COUNT.id ];

                  msg[ COL.FLOW_DURATION.id ]= msg[ FLOW.START_TIME.id ] - msg[ FLOW.TIMESTAMP.id ];

                  //TODO
                  //msg[ COL.ACTIVE_FLOWS.id ] = ?
                  arr.push( msg );
               }
               return arr;
            }, isAutoLoad);

            /**
             * Get set of class Ids
             */
            db.stat.getAppClasses = function(){
               var obj = db.stat.splitDataByClass();
               var keys = Object.keys( obj );
               return keys;
            };
            db.stat.splitDataByApp = function(){
               return MMTDrop.tools.splitData(db.data(), MMTDrop.constants.FlowStatsColumn.APP_NAME.id);
            }
            /**
             * Get categories in database
             */
            db.stat.splitDataByClass = function(){
               var data = db.data();
               var obj = {};
               var appId = 0;
               var catId = -1;
               for (var i=0; i<data.length; i++){
                  appId = data[i][MMTDrop.constants.FlowStatsColumn.APP_NAME.id];
                  catId = MMTDrop.constants.getCategoryIdFromAppId( appId );

                  if (obj[catId] == null)
                     obj[catId] = [];
                  obj[catId].push( data[i] );
               }

               return obj;
            };

            db.stat.getTimePointsForChart = function( col, sorted ){
               var COL = MMTDrop.constants.FlowStatsColumn;

               sorted = (sorted === true) ? true : false; //do not sort by default

               var label = col.label;
               col = col.id;

               var probes  = db.stat.getProbes();
               var noProbes= probes.length;

               var obj = MMTDrop.tools.sumByGroups( db.data(),
                     [col],
                     [COL.TIMESTAMP.id, COL.PROBE_ID.id] );
               var arr = [];
               for( var time in obj){
                  var oo = {};
                  oo[COL.TIMESTAMP.id] = parseInt( time );

                  oo[col] = {};
                  for( var probe in obj[time] )
                     if( noProbes == 1 )
                        oo[col] =  obj[time][probe][col];
                     else
                        oo[col][probe] =  obj[time][probe][col];

                  arr.push( oo );
               }

               var columns = [COL.TIMESTAMP];
               if( noProbes == 1)
                  columns.push( {id: col, label: "Probe " + probes[0]} );
               else
                  columns.push( {id: col, label: "Probe", probes: probes} );

               return {data: arr, columns: columns, ylabel: label, probes: probes};
            };

            db.stat.getFlowDensityForChart = function( col ){
               var label = col.label;
               col       = col.id;

               var data    = db.data();
               var arr     = [];
               var columns = [{id: 0, label: label}];
               var obj  = MMTDrop.tools.splitData( data, MMTDrop.constants.FlowStatsColumn.PROBE_ID.id );
               for( var probe in obj){
                  columns.push( {id: probe, label: "Probe " + probe} );
                  data = obj[probe];
                  data.sort( function( a, b ){
                     return a[col] - b[col];
                  } );
                  var flowcount = data.length;

                  for( var i=0; i<flowcount; i++){
                     var oo = {};
                     oo[0]  = data[i][col];
                     oo[probe]= 100*i/flowcount;
                     arr.push( oo );
                  }
               }

               return {data: arr, columns: columns, ylabel: "%"};
            };

            return db;
         },
   };

///////////////////////////////////////////////////////////////////////////////////////////
// end MMTDrop.Database
///////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////
// MMTDrop.Filter
///////////////////////////////////////////////////////////////////////////////////////////
   /**
    * @class
    * Filter data before visualizing them by {@link MMTDrop.Chart}
    *
    * @param {FilterParam} param
    * @param {function} filterFn  This function defines how database is filtered.
    * It takes the form <code>callback(sel, db)</code>:
    * with <code>sel</code> typed of {@link Index} is current selected option and
    * <code>db</code> typed of {@link MMTDrop.Database} is a database the filter attached to.
    *
    * @param {function} [prepareDataFn=null] This function may be usedful for caching data
    * when an option being selected again. That is, instead of re-calculate/filter database
    * we cache data that were filtered at the first time of selecting the option and reuse for next times.
    * This is called when calling <code>.filter()</code>.
    * @constructor
    */
   MMTDrop.Filter = function (param, filterFn, prepareDataFn){
      //add to list of created object
      if( MMTDrop.object.filter == undefined )
         MMTDrop.object.filter = [];
      MMTDrop.object.filter.push( this );

      var _currentSelectedOption = null;
      var _onFilterCallbacks = [];
      var _onChangeCallbacks = [];
      var _afterChangeCallbacks = [];
      //database attached to this filter
      var _database = null;
      var _option = param.options;
      var _this = this;
      _this.storeState = true;
      
      this.getId = function(){
         return param.id;
      }

      this.hide = function(){
         $("#" + param.id + "_container").hide();
      }

      this.show = function(){
         $("#" + param.id + "_container").show();
      }

      this.isVisible = function(){
         return $("#" + param.id + "_container").is(":visible");
      }
      this.getDatabase = function(){
         return _database;
      }
      /**
       * Render the filter into an HTML element
       * @param {string} elemID Id of the HTML element
       */
      this.renderTo = function (elemID){
         //remove older if exist
         $("#" + param.id + "_container").remove();

         //var fcontainer = $('<div>',  {class: 'col-xs-6 col-sm-4 col-md-3 col-lg-2  pull-right', id: param.id + "_container"});
         var fcontainer = $('<div>',  {class: 'filter-container  pull-right', id: param.id + "_container"});
         var fdiv =       $('<div>',  {class: 'input-group input-group-sm'});
         var span =       $('<span>', {class: 'input-group-addon', text: param.label});
         var filter =     $('<select>',{class: "form-control",     id  : param.id});
         this.select = filter;
         if( param.style )
            filter.css( param.style )

         span.appendTo( fdiv );
         filter.appendTo( fdiv );
         fdiv.appendTo(fcontainer);
         fcontainer.appendTo($('#' + elemID));

         _this.domElement = fcontainer;
         //add a list of options to the filter

         _this.redraw();

         //handle when the filter changing
         filter.change(function(e){
            //annonce to its callback registors
            for (var i in _onChangeCallbacks){
               var callback = _onChangeCallbacks[i];
               callback[0](_currentSelectedOption, _database, callback[1]);
            }

            _currentSelectedOption = _option[this.selectedIndex];   //the selected option of the filter

            console.log(param.label + " - selection index change: " + JSON.stringify( _currentSelectedOption ));

            //save the current selected index
            if( _this.storeState === true)
               MMTDrop.tools.localStorage.set(param.id, _currentSelectedOption, param.useFullURI);

            for (var i in _afterChangeCallbacks){
               var callback = _afterChangeCallbacks[i];
               callback[0](_currentSelectedOption, _database, callback[1]);
            }

            //applying the filter to the current selection
            setTimeout( function(){
               _filter();
            }, 10);
         });
      };


      /**
       * Get the current selected option
       * @returns {Index} the current selected option
       *//**
       * Set the current selected option
       * @param {Index} sel
       * @returns {MMTDrop.Filter} this
       */
      this.selectedOption = function( opt ){
         if( opt == undefined ){
            return _currentSelectedOption;
         }
         else{
            //check if the defaultOption is in the current option list
            if( _this.storeState === true )
               for (var i in _option){
                  if (opt.id == _option[i].id){
                     MMTDrop.tools.localStorage.set(param.id, _option[i], param.useFullURI);
                     break;
                  }
               }
            else{
               for( var i=0; i<_option.length; i++ )
                  if( _option[i].selected )
                     delete( _option[i].selected );
               for( var i=0; i<_option.length; i++ )
                  if( _option[i].id == opt.id ){
                     _option[i].selected  = true;
                     _currentSelectedOption = _option[i];
                     break;
                  }
               _this.select.val( opt.id );
            }
         }
         return this;
      };

      /**
       * Get list of options of the filter
       * @returns {Index[]} lst
       *//**
       * Set a new list of options of the filter
       * @param {Index[]} lst
       * @returns [MMTDrop.Filter] this
       */
      this.option = function( val ){
         if ( val == undefined ){
            return _option;
         }
         if (Array.isArray( val ))
            _option = val;
         return this;
      };

      /**
       * Redraw the filter.
       * This should be called after updating new option by <code>.option(lst)</code>
       */
      this.redraw = function(){
         var filter = $('#' + param.id);

         //remove the old options
         filter.find('option').remove();

         if ( _option.length == 0){
            console.log(" There are no options in the filter " + param.id);
            return;
         }

         //create list of options
         for (var i in _option){
            var opt = $('<option>', {
               text : _option[i].label,
               value: _option[i].id,
            });
            opt.appendTo(filter);
         }

         var defaultOption;
         if( _this.storeState === true )
            defaultOption = MMTDrop.tools.localStorage.get(param.id, param.useFullURI);
         var isExist = false;

         //check if the defaultOption is in the current option list
         for (var i in _option){
            if (defaultOption != null && defaultOption.id == _option[i].id){
               isExist = true;
               break;
            }
         }
         //if not, set default is the first option in the list
         if( isExist == false ){
            //if there is one option selected by the code
            for (var i in _option){
               if( _option[i].selected === true){
                  defaultOption = _option[i];
                  isExist = true;
                  break;
               }
            }

            if( isExist == false )
               for (var i in _option){
                  defaultOption = _option[i];
                  break;
               }
         }
         //set selection to defaultValue (that is either the first option or the former selection)
         filter.val(defaultOption.id);
         _currentSelectedOption = defaultOption;
      };

      /**
       * Bind the filter to a database
       * @param {MMTDrop.Database} database
       */
      this.attachTo = function (database){
         _database = database;

      };

      /**
       * Register a callback after the filter filters out data.
       * User can register more than one callback.
       * @param {function} callback It takes the form
       * <code>callback(sel, db, userData)</code> where: <code>sel</code> is the current selected option,
       * <code>db</code> is database after filtering.
       * @param {object} userData It will be passed as the last parameter of <code>callback</code>.
       */
      this.onFilter = function (callback, obj){
         if (MMTDrop.tools.isFunction(callback))
            _onFilterCallbacks.push ([callback, obj]);
      };

      this.onChange = function (callback, obj){
         if (MMTDrop.tools.isFunction(callback))
            _onChangeCallbacks.push ([callback, obj]);
      };

      this.afterChanged = function (callback, obj){
         if (MMTDrop.tools.isFunction(callback))
            _afterChangeCallbacks.push ([callback, obj]);
      };
      /**
       * Filter out database with the current selected option
       */
      this.filter = function(){
         if (MMTDrop.tools.isFunction(prepareDataFn))
            prepareDataFn(_database);

         _filter();
      };

      function _filter(){
         if (MMTDrop.tools.isFunction(filterFn)){
            if (_database != null &&
                  _currentSelectedOption != null){

               if( _database.data )
                  console.log("filtering " + param.label + " [" + JSON.stringify(_currentSelectedOption) + "] on database (" + _database.data().length + " records)");

               filterFn(_currentSelectedOption, _database);

               if( _database.data )
                  console.log("  - retained " + _database.data().length + " records");
            }
            //annonce to its callback registors
            for (var i in _onFilterCallbacks){
               var callback = _onFilterCallbacks[i];
               //async
               setTimeout(function( cb, _c, _db ){
                  cb[0](_c, _db, cb[1]);
               }, 0, callback, _currentSelectedOption, _database);
            }
         }
         else
            throw new Error ("You need to implement how it filters data");
      };

      this.delete = function(){
         //unregistred the callbacks
         _onFilterCallbacks = [];

         //remove from list of filter objects
         var ft = MMTDrop.object.filter;
         for( var i in ft)
            if( ft[i] == this){
               ft.splice( i, 1 );
               break;
            }
         if( _this.domElement )
            _this.domElement.remove();

      }
   };

   /**
    * A namespace to create some instances of {@link MMTDrop.Filter}
    * @namespace
    */
   MMTDrop.filterFactory = {

         /**
          * Create a filter metric for flow statistic.
          * The list of options is defined by {@link MMTDrop.constants.FlowMetricFilter}.
          * This filter does not filter out its database.
          * @returns {MMTDrop.Filter} filter
          */
         createFlowMetricFilter : function(){
            var cols    = MMTDrop.constants.FlowMetricFilter;
            var options = [];
            for (var i in cols)
               options.push({id: cols[i].id, label: cols[i].label});

            var filter =  new MMTDrop.Filter({
               id      : "flow_metric_filter" + MMTDrop.tools.getUniqueNumber(),
               label   : "Flows",
               options : options,
            }, function (val, db){
               //how it filters database when the current selected option is @{val}

            });
            return filter;
         },

         createNdnMetricFilter : function(){
            var cols    = MMTDrop.constants.NdnMetricFilter;
            var options = [];
            for (var i in cols)
               options.push({id: cols[i].id, label: cols[i].label});

            var filter =  new MMTDrop.Filter({
               id      : "flow_metric_filter" + MMTDrop.tools.getUniqueNumber(),
               label   : "Metric",
               options : options,
            }, function (val, db){
               //how it filters database when the current selected option is @{val}

            });
            return filter;
         },
         /**
          * Create a filter matric for general statistic.
          * This filter does not filter out its database.
          * @returns {MMTDrop.Filter} filter
          */
         createMetricFilter : function(){
            var cols = [
               MMTDrop.constants.StatsColumn.DATA_VOLUME,
               MMTDrop.constants.StatsColumn.PACKET_COUNT,
               MMTDrop.constants.StatsColumn.PAYLOAD_VOLUME,
               MMTDrop.constants.StatsColumn.ACTIVE_FLOWS
               ];

            var options = [];
            for (var i in cols)
               options.push({id:  cols[i].id, label: cols[i].label});


            var filter =  new MMTDrop.Filter({
               id      : "metric_filter" + MMTDrop.tools.getUniqueNumber(),
               label   : "Metric",
               options : options,
               useFullURI: false,
            },
            function (val, db){
               //how it filters database when the current selected option is @{val}

            }
            );
            filter.getUnit = function(){
               var val = filter.selectedOption().id;
               switch( val ){
               case MMTDrop.constants.StatsColumn.PAYLOAD_VOLUME:
               case MMTDrop.constants.StatsColumn.DATA_VOLUME:
                  return "B";

               case MMTDrop.constants.StatsColumn.PACKET_COUNT:
               case MMTDrop.constants.StatsColumn.ACTIVE_FLOWS:
                  return "";
               }
            }
            return filter;
         },


         /**
          * Create a period filter for any database.
          * This filter will <code>reload</code> its database with a new <code>period</code> parameter, see {@link MMTDrop.Database#reload}.
          * The list of options is defined by {@link MMTDrop.constants.period}
          * @returns {MMTDrop.Filter} filter
          */
         createPeriodFilter : function(){
            //one period for any pages
            var filterID    = "period_filter";// + MMTDrop.tools.getUniqueNumber();
            var periods     = MMTDrop.constants.period;
            var options = [];


            if( MMTDrop.config.periodFilterOptions != undefined)
               options = MMTDrop.config.periodFilterOptions
               else{
                  options.push( { id: periods.MINUTE     , label: "Last 5 minutes", selected: true });
                  options.push( { id: periods.HOUR       , label: "Last hour"      });
                  options.push( { id: periods.QUARTER_DAY, label: "Last 6 hours"   });
                  options.push( { id: periods.HALF_DAY   , label: "Last 12 hours"  });
                  options.push( { id: periods.DAY        , label: "Last 24 hours"  });
                  options.push( { id: periods.WEEK       , label: "Last 7 days"    });
                  options.push( { id: periods.MONTH      , label: "Last 30 days"   });
               }
            var period_id_preselected_from_url = MMTDrop.tools.getURLParameters().period;
            if( period_id_preselected_from_url )
               for( var i=0; i<options.length; i++ ){
                  //delete default selected
                  if( options[i].selected == true )
                     delete( options[i].selected )
                     if( options[i].id ==  period_id_preselected_from_url ){
                        options[i].selected = true;
                     }
               }
            //var otherOpt = { id: "00", label: "Other"};

            //options.push( otherOpt );
            var filter =  new MMTDrop.Filter({
               id        : filterID,
               label     : "Period",
               options   : options,
               useFullURI: false,
            },

            function (val, db){
            });

            filter.otherOpt = {};

            filter._renderTo = filter.renderTo;
            filter.renderTo = function( elemID ){
               filter._renderTo( elemID );

               $('#'+ filterID + '_container' ).css({'max-width': '200px'});
               
               var $cal = $('<div id="'+ filterID +'-datepicker" class="datepicker-icon input-group-addon"> <span class="glyphicon glyphicon-calendar"/></div>');
               $cal.appendTo( $("#" + filterID + "_container .input-group") );

               $cal.on("click", function(){
                  if( filter.datepicker == undefined )
                     filter.datepicker = new DatePicker( "#" + filterID + "-datepicker", function( d1, d2 ){
                        if( d1 == undefined )
                           return;
                        if( filter.otherOpt.id == undefined )
                           filter.option().push( filter.otherOpt );

                        d1 = moment(d1).startOf("day").valueOf();
                        d2 = moment(d2).startOf("day").valueOf() + (24*60*60*1000 - 1);

                        filter.otherOpt.id    = JSON.stringify({begin: d1, end: d2});

                        d1 = (new Date(d1)).toLocaleDateString();
                        d2 = (new Date(d2)).toLocaleDateString();
                        filter.otherOpt.label = d1 + " - " + d2;

                        filter.selectedOption( filter.otherOpt );
                        filter.redraw();
                        //fire the filter on this option
                        filter.filter();
                     } );
                  filter.datepicker.show();
               });


            };

            /**
             * Get the total interval
             * @returns {[[Type]]} [[Description]]
             */
            filter.getSamplePeriodTotal = function(){
               var period = 1;
               var sel    = this.selectedOption().id;
               switch ( sel ){
               case MMTDrop.constants.period.MINUTE :
                  period = 5*60//5 min
                  break;
               case MMTDrop.constants.period.HOUR :
                  period = 60*60;    //1 hour
                  break;
               case MMTDrop.constants.period.QUARTER_DAY :
                  period = 6*60*60;    //6 hours
                  break;
               case MMTDrop.constants.period.HALF_DAY :
                  period = 12*60*60;    //12 hours
                  break;
               case MMTDrop.constants.period.DAY :
                  period = 24*60*60;    //24 hours
                  break;
               case MMTDrop.constants.period.WEEK :
                  period = 7*24*60*60;    //7 days
                  break;
               case MMTDrop.constants.period.MONTH :
                  period = 30*24*60*60;    //30 days
                  break;
               default:
                  sel = JSON.parse( sel );
               period = (sel.end - sel.begin)/1000;
               }
               return period;
            };

            /**
             * get the interval between two consecutive samples
             * @returns {Number} second
             */
            filter.getDistanceBetweenToSamples = function(){
               var period = 1;
               var sel    = this.selectedOption().id;
               switch ( sel ){
               case MMTDrop.constants.period.MINUTE :
               case MMTDrop.constants.period.HOUR   :
                  period = MMTDrop.config.probe_stats_period;
                  break;
               case MMTDrop.constants.period.QUARTER_DAY :
               case MMTDrop.constants.period.HALF_DAY    :
               case MMTDrop.constants.period.DAY         :
                  period = 60;    //each minute
                  break;
               case MMTDrop.constants.period.WEEK :
                  period = 60*60;    //each hour
                  break;
               case MMTDrop.constants.period.MONTH :
                  period = 24*60*60;    //each day
                  break;
               default:
                  period = 24*60*60;
               }
               return period;
            }

            filter.getTimeFormat = function(){
               var format = "YYYY/MM/DD HH:mm";
               var sel    = this.selectedOption().id;
               switch ( sel ){
               case MMTDrop.constants.period.MINUTE :
               case MMTDrop.constants.period.HOUR :
                  format = "HH:mm:ss";
                  break;
               case MMTDrop.constants.period.QUARTER_DAY :
                  format = "HH:mm";    //each minute
                  break;
               case MMTDrop.constants.period.HALF_DAY    :
               case MMTDrop.constants.period.DAY         :
                  format = "MM/DD HH:mm";    //each minute
                  break;
               case MMTDrop.constants.period.WEEK :
                  format = "YYYY/MM/DD HH[h]";    //each hour
                  break;
               case MMTDrop.constants.period.MONTH :
                  format = "YYYY/MM/DD";    //each day
                  break;
               default:
                  format = "YYYY/MM/DD";    //each day
               }
               return format;
            }

            return filter;
         },

         /**
          * Create a probe filter.
          * This filter retains in database only element having <code>PROBE_ID.id</code> equals to <code>id</code> of the current selected option.
          * The list of options is automatically updated by probe Ids existing in <code>database</code> its attached to.
          * @returns {MMTDrop.Filter} filter
          */
         createProbeFilter : function(){
            var probeID = "probe_filter" + MMTDrop.tools.getUniqueNumber();

            //create a list of options
            var options = [{id: 0, label: "All"}];
            var data = {};

            var filter =  new MMTDrop.Filter({
               id      : probeID,
               label   : "Probe",
               options : options,
            }, function (val, db){
               //show data from probeID = val (val.value=0 ==> any)
               db.data( data[val.id] );
            },
            //cache data
            function (db){
               //update the list of probes when database changing
               console.log("  - update list of probes when DB loaded");
               //update a list of probe IDs when database beeing available
               //to speedup, data are splited into groupes having the same probeID

               data       = db.stat.splitDataByProbe();

               //get a list of probe IDs
               var keys = Object.keys(data);

               //all
               data[0] = db.data();

               //create list of options
               var opts = [];
               for (var i in keys){
                  opts.push({id:  keys[i], label: keys[i]});
               }
               //if there are more than one option or no option ==> add "All" to top
               if (opts.length != 1)
                  opts.unshift(MMTDrop.tools.cloneData(options[0]));

               filter.option( opts );
               filter.redraw();
               if( opts.length == 1 ){
                  filter.hide();
               }else
                  filter.show();
            });

            return filter;
         },

         /**
          * Create an application filter.
          * This filter retains only in database the element having <code>APP_ID.id</code> equals to <code>id</code> of the current selected option.
          * Its lits of options is automatically updated by application Ids existing in the <code>database</code> the filter attached to.
          * @returns {MMTDrop.Filter} filter
          */
         createAppFilter : function(){
            var filterID = "app_filter" + MMTDrop.tools.getUniqueNumber();

            //create a list of options
            var data = {};
            var options = [{id: 0, label: "All"}];
            var filter =  new MMTDrop.Filter({
               id      : filterID,
               label   : "App",
               options : options,
            },
            function (val, db){
               //how filtering data
               if (data[val.id] != null)
                  db.data( data[val.id] );
            },
            function (db){
               //update the list of probes when database changing
               console.log("  - update list of App when DB loaded");
               //update a list of probe IDs when database beeing available
               //get a list of probe IDs
               //to speedup, data are splited into groupes having the same AppID
               data     = db.stat.splitDataByApp();
               var keys = Object.keys(data);

               //when an app is selected, its children are also selected
               for( var i=0; i<keys.length; i++){
                  var arr = data[ keys[i] ];

                  var obj = MMTDrop.tools.splitData( arr, MMTDrop.constants.StatsColumn.APP_PATH.id );

                  for( var path in obj){
                     var parentKey = MMTDrop.constants.getParentPath( path );
                     var parentApp = MMTDrop.constants.getAppIdFromPath( parentKey );
                     //keys[j] is a children of parentApp
                     if(  parentApp in data ){
                        data[ parentApp ] = data[parentApp].concat( obj[path] );
                     }
                  }
               }

               //All
               data[0] = db.data();

               //create list of options
               var opts = [];
               for (var i in keys){
                  opts.push({id:  keys[i], label: MMTDrop.constants.getProtocolNameFromID( keys[i] ) });
               }
               //alphabet of labels
               opts.sort( function( a,b ){
                  if(a.label < b.label) return -1;
                  if(a.label > b.label) return 1;
                  return 0;
               });
               //if there are more than one option or no option ==> add "All" to top
               if (opts.length != 1)
                  opts.unshift(MMTDrop.tools.cloneData(options[0]));

               filter.option( opts );
               filter.redraw();
            });

            return filter;
         },

         /**
          * Create an application filter.
          * This filter retains only in database the element having <code>APP_ID.id</code> equals to <code>id</code> of the current selected option.
          * Its lits of options is automatically updated by application Ids existing in the <code>database</code> the filter attached to.
          * @returns {MMTDrop.Filter} filter
          */
         createUserFilter : function(  ){


            var filterID = "user_filter" + MMTDrop.tools.getUniqueNumber();

            //create a list of options
            var data = {};
            var options = [{id: 0, label: "All"}];
            var filter =  new MMTDrop.Filter({
               id      : filterID,
               label   : "Users",
               options : options,
            },
            function (val, db){
               //how filtering data
               if (data[val.id] != null)
                  db.data( data[val.id] );
            },
            function (db){
               //update the list of probes when database changing
               console.log("  - update list of User when DB loaded");
               //update a list of probe IDs when database beeing available
               //get a list of probe IDs
               //to speedup, data are splited into groupes having the same AppID
               data = db.data();
               var user_col_id = MMTDrop.constants.StatsColumn.IP_SRC.id;

               var format = MMTDrop.constants.CsvFormat.SESSION_STATS_FORMAT;
               if( data[0] )
                  format = data[0][0];
               if( format == MMTDrop.constants.CsvFormat.DEFAULT_APP_FORMAT
                     ||format == MMTDrop.constants.CsvFormat.WEB_APP_FORMAT
                     ||format == MMTDrop.constants.CsvFormat.SSL_APP_FORMAT )
                  user_col_id = MMTDrop.constants.FlowStatsColumn.CLIENT_ADDR.id;

               data = MMTDrop.tools.splitData( data, user_col_id );
               var keys = Object.keys(data);

               //All
               data[0] = db.data();

               //create list of options
               var opts = [];
               for (var i in keys){
                  opts.push({id:  keys[i], label:  keys[i]  });
               }

               //if there are more than one option or no option ==> add "All" to top
               if (opts.length != 1)
                  opts.unshift(MMTDrop.tools.cloneData(options[0]));

               filter.option( opts );
               filter.redraw();
            });

            return filter;
         },
         /**
          * Create an application filter.
          * This filters retains only in database the element having <code>APP_ID.id</code> in the current selected class, see {@link MMTDrop.constants.CategoriesAppIdsMap}.
          * The list of options is automatically updated by classes existing in <code>database</code> its attached to.
          * @returns {MMTDrop.Filter}
          */
         createClassFilter : function(){
            var filterID = "class_filter" + MMTDrop.tools.getUniqueNumber();

            //create a list of options
            var data = {};
            var options = [{id: 0, label: "All"}];
            var filter =  new MMTDrop.Filter({
               id      : filterID,
               label   : "Profile",
               options : options,
            },
            function (val, db){
               //how filtering data
               if (data[val.id] != null)
                  db.data( data[val.id] );
            },
            function (db){
               //update the list of probes when database changing
               console.log("  - update list of Class when DB loaded");
               //update a list of Category IDs when database beeing available
               //to speedup, data are splited into groupes having the same ClasssID
               data = db.stat.splitDataByClass();
               var keys = Object.keys(data);

               data[0] = db.data();

               //create list of options
               var opts = [];
               for (var i in keys){
                  opts.push({id:  keys[i], label: MMTDrop.constants.getCategoryNameFromID( keys[i] ) });
               }

               //if there are more than one option or no option ==> add "All" to top
               if (opts.length != 1)
                  opts.unshift(MMTDrop.tools.cloneData(options[0]));

               filter.option( opts );
               filter.redraw();
            });

            return filter;
         },
         /**
          * Create a filter representing types of reports (data format).
          * The list of options is fixed by the data types defined in <code>MMTDrop.constants.CsvFormat</code>.
          * When the selected option is changed, the database will reload the corresponding data from the server.
          * @returns {MMTDrop.Filter}
          */
         createDataTypeFilter : function(){
            var csv = MMTDrop.constants.CsvFormat;
            //create a list of options
            var data = {};
            var options = [{id: csv.SESSION_STATS_FORMAT,            label: "Protocol"},
               {id: csv.DEFAULT_APP_FORMAT,      label: "Flow"},
               {id: csv.WEB_APP_FORMAT,          label: "Web"},
               {id: csv.SSL_APP_FORMAT,          label: "SSL"},
               {id: csv.RTP_APP_FORMAT,          label: "RTP"},
               {id: csv.RADIUS_REPORT_FORMAT,    label: "Radius"},
               {id: csv.MICROFLOWS_STATS_FORMAT, label: "Microflow"}
               ];
            var filter =  new MMTDrop.Filter({
               id      : "data_type_filter" + MMTDrop.tools.getUniqueNumber(),
               label   : "Format",
               options : options,
            },
            function (val, db){
               //how it filters database when the current selected option is @{val}
               //It reloads data from MMT-Operator
               var param = {format:val.id};
               db.reload(param);

               console.log("Got " + db.data().length + " from DB");
            });

            return filter;
         },


         createDirectionFilter: function( withAll ){
            if( withAll == undefined )
               withAll = true;

            var options = [{id: 0,  label: "All"},
               {id: 1,  label: "Inbound"},
               {id: -1, label: "Outbound"}];
            if( !withAll )
               options.shift();

            var filter =  new MMTDrop.Filter({
               id      : "direction_filter" + MMTDrop.tools.getUniqueNumber(),
               label   : "Direction",
               options : options,
            },
            function (val, db){
               //how it filters database when the current selected option is @{val}
               //It reloads data from MMT-Operator
               //console.log("Got " + db.data().length + " from DB");
            });

            return filter;
         },
   };
///////////////////////////////////////////////////////////////////////////////////////////
// end MMTDrop.Filter
///////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////
// MMTDrop.Report
///////////////////////////////////////////////////////////////////////////////////////////
   /**
    * @class
    * Report
    *
    * @param {string} title - title of report
    * @param {MMTDrop.Database} database
    * @param {MMTDrop.Filter[]} filters - list of filters
    * @param {Array.<{charts: MMTDrop.Chart[], width: number}>} groupCharts - groups of charts
    * @param {DataFlow} dataFlow - flow of data
    * @constructor
    */
   MMTDrop.Report = function(title, database, filters, groupCharts, dataFlow){
      //add to list of created object
      if( MMTDrop.object.report == undefined )
         MMTDrop.object.report = [];
      MMTDrop.object.report.push( this );
      /**
       * The charts being showing
       * @type {MMTDrop.Chart[]}
       */
      this.activeCharts = [];

      var _this = this;
      _this.database    = database;
      _this.title       = title;
      _this.filters     = filters;
      _this.groupCharts = groupCharts;
      _this.dataFlow    = dataFlow;
      _this.charts      = [];
      _this.callback    = [];

      for( var i in groupCharts ){
         var charts = groupCharts[i].charts;
         _this.charts = _this.charts.concat( charts );
      }


      this.delete = function(){
         _this.charts = [];
         _this.callback = [];

         var re = MMTDrop.object.report;
         for( var i in re )
            if( re[i] == _this ){
               re.splice( i, 1 );
               break;
            }

      }

      /**
       * Register triggers
       * @param {DataFlow} filter - object tobe registed. {object: obj, effect: [o1, o2]}
       * @private
       */
      function _registTrigger(fluxItem){
         if (fluxItem == null || fluxItem.object == null || Array.isArray(fluxItem.effect) == false)
            return;

         if (fluxItem.effect.length === 0)
            return;

         if (MMTDrop.tools.isFunction(fluxItem.object.onFilter) == false)
            return;

         fluxItem.object.onFilter(  function (val, db, obj){

            if (Array.isArray(obj) == false)
               obj = [obj];

            for (var k=0; k<obj.length; k++){
               var o = obj[k].object;

               o.attachTo( db );
               //o is either a filter or a chart
               if (o instanceof MMTDrop.Filter){
                  o.filter();
               }else{
                  //o.option =
                  //only active chart is rendered
                  if ( o.isVisible() )
                     o.redraw();

                  //o.option.data.columns = [{id: val, label: "keke"}];
                  //var opt = o.option.data.columns[o.option.data.columns.length - 1];
                  //opt.id = val;
               }
            }

         }, fluxItem.effect);

         //register trigger for effect objects
         for (var k=0; k<fluxItem.effect.length; k++)
            _registTrigger( fluxItem.effect[k] );
      };

      this.afterRender = function(callback, data){
         _this.callback.push( {callback: callback, data: data} );
      }

      /**
       * Render the report to an HTML element
       * @param {string} elemID - id of the HTML element
       */
      this.renderTo = function(elemID){
         var $elemID = $('#' + elemID);

         if( $elemID.length == 0 ){
            console.warn( " I cannot find a DOM element ["+ elemID +"] to render report.");
            return;
         }

         _this.activeCharts = [];

         $elemID.html('');

         var rootDiv = $('<div>', {'class' : 'container-fluid'});
         rootDiv.appendTo( $elemID );
         //draw header
         if(title) {
            /*
      var report_header =  $('<div>', {
        'class': 'row'
      });
      report_header.appendTo(rootDiv);

      var report_title = $('<h1>', {'class': 'page-header',
        'style': 'margin-bottom: 10px;', 'text': title});
      report_title.appendTo(report_header);
             */
            //$('#'+ elemID + '-header').html( title );
         }

         //draw filter
         var filter_bar = $('<div>', {'class' : 'row filter-bar'});
         filter_bar.appendTo(rootDiv);

         var filterID = elemID + "_filters";
         var control_row = $('<div>', {'class': 'col-md-12',
            'style': 'margin-bottom: 10px;', id: filterID});
         control_row.appendTo(filter_bar);


         //render from left-right: filters[0] on the left
         for (var i = filters.length - 1; i>= 0; i--)
            filters[i].renderTo(filterID);

         //charts groups
         var rowDiv = $('<div>', {
            'class': 'row',
         });
         rowDiv.appendTo(rootDiv);

         //list of chart buttons
         for (var i=0; i<groupCharts.length; i++){

            //width of each group is maximal 12 (cols)
            var colDiv = $('<div>', {
               'class': 'col-md-' + ((groupCharts[i].width > 12) ? 12: groupCharts[i].width)
            });
            colDiv.appendTo(rowDiv);

            var elemDiv = $('<div>', {
               'class': 'report-element'
            });
            elemDiv.appendTo(colDiv);


            var charts = groupCharts[i].charts;

            //draw icons of the charts in the group
            if (charts.length > 1){
               var btngroup = $('<div>', {
                  'class' : 'report-element-top btn-group center',
                  'id'    : 'btn_group_' + i,
               });

               for (var j=0; j<charts.length; j++) {
                  if ((charts[j] instanceof MMTDrop.Chart) == false){
                     console.log(charts[j]);
                     continue;
                  }
                  var btn = $('<button>', {
                     'id' :  'btn_' + i + "_" + j,
                     'class' : 'btn btn-large',
                  }).append(charts[j].getIcon());

                  btn.appendTo(btngroup);

                  if( j==0 )
                     btn.addClass("active");

                  btn.click({chart: j, group: i, report: _this}, function (e){
                     e.preventDefault();

                     var lastBtn = $('#btn_group_' + e.data.group + " .active");
                     lastBtn.each( function(){
                        $(this).removeClass("active");
                     });

                     $(this).addClass("active");

                     var charts = groupCharts[e.data.group].charts;
                     //inactive the older chart in the group
                     var oldChart = e.data.report.activeCharts[e.data.group];
                     if ( oldChart.isVisible() ){
                        oldChart.isVisible( false );
                        oldChart.clean();
                     }

                     //set active and render it
                     var chart = charts[e.data.chart];
                     chart.isVisible( true );
                     chart.redraw();

                     e.data.report.activeCharts[e.data.group] = chart;
                     //chart.data is a copy of database.data at the moment its filter filters out
                     //chart.data is assigned to database.data in _registTrigger function
                  });
               }
               btngroup.appendTo(elemDiv);
            }

            var chartID = "charts_group_" + i + MMTDrop.tools.getUniqueNumber();
            $('<div>', {
               'id' : chartID,
            }).appendTo(elemDiv);

            //
            for (var j in charts){
               charts[j].isVisible( false );
               charts[j].renderTo( chartID );
            }
            charts[0].isVisible( true );
            _this.activeCharts.push( charts[0] );
         }

         //registing some callbacks of data changing/loading
         for (var i in dataFlow){

            var filter = dataFlow[i];
            _registTrigger(filter);
         };

         //for (var i in charts)
         //  charts[i].attachTo(database, false);
         for (var i in filters)
            filters[i].attachTo(database);


         for( var i in dataFlow ){
            //filter for the element that is either a filter or a chart
            var elem = dataFlow[ i ];
            if( elem.autoTrigger === true ){
               var obj = elem.object;
               if (obj instanceof MMTDrop.Filter)
                  obj.filter();
               else if(obj)
                  obj.renderTo( obj.htmlID, database.data() );

            }
         }

         //after render
         if( _this.callback.length > 0)
            for( var i=0; i<_this.callback.length; i++){
               var obj = _this.callback[i];
               obj.callback( obj.data, _this );
            }



      };
   };


   /**
    * A namespace to create several kinds of reports.
    * @namespace
    */
   MMTDrop.reportFactory = {
         /**
          * Dashboard using a timeline chart to show traffic in realtime
          * @returns {MMTDrop.Report} report
          */
         createRealtimeReport : function(){
            var database = MMTDrop.databaseFactory.createStatDB({
            }, true);

            var fProbe  = MMTDrop.filterFactory.createProbeFilter();
            var fMetric  = MMTDrop.filterFactory.createMetricFilter();

            var cLine   = MMTDrop.chartFactory.createTimeline({
               getData: {
                  getDataFn : function( db ){
                     var col = fMetric.selectedOption();
                     return db.stat.getDataTimeForChart(col, false, fProbe.selectedOption().id != 0);
                  }
               }});


            //add data to chart each second (rather than add immediatlly after receiving data)
            //this will avoid that two data are added very closely each

            var newData = {};
            var lastAddMoment = 0;

            var appendMsg = function( msg ){
               //console.log( msg );
               var chart = cLine.chart;
               if( chart == undefined )
                  return;

               //the chart cLine in
               //- probeMode if it shows total data of each probe
               //- appMode   if it shows data of each app in a probe
               var probeId = fProbe.selectedOption().id;
               var isInProbeMode = probeId == 0;

               //receive msg of a probe different with the one beeing showing
               if( ! isInProbeMode &&
                     probeId != msg[ MMTDrop.constants.StatsColumn.PROBE_ID.id ]){
                  console.log( " donot concern");
                  return;
               }

               var serieName  = msg[ MMTDrop.constants.StatsColumn.APP_ID.id ];
               serieName = MMTDrop.constants.getProtocolNameFromID( serieName );

               if( isInProbeMode )
                  serieName = "Probe-" + msg[ MMTDrop.constants.StatsColumn.PROBE_ID.id ];


               var time = msg[ MMTDrop.constants.StatsColumn.TIMESTAMP.id ] + 0;
               var val  = msg[ fMetric.selectedOption().id ];

               if( newData[serieName] === undefined )
                  newData[serieName] = 0;

               newData[serieName] += val;

               //update to chart each x seconds
               if( time - lastAddMoment > 2000 ){
                  //chart.zoom.enable( false );

                  var date = new Date( time );
                  var xs = chart.xs();

                  var cols = [];

                  var newXS = {};
                  var needLoad = false;
                  var keys = [];
                  //convert newData to columns format of C3js
                  for( var s in newData ){
                     keys.push( s );  //list of apps will be appended data
                     cols.push( [s, newData[s]] );
                     cols.push( ["x-"+s, date] );

                     if( xs[ s ] == undefined){
                        newXS[ s ] = "x-" + s;
                        needLoad = true;
                     }
                  }

                  //load new pair nameY: nameX
                  if( needLoad )
                     chart.load({
                        xs: newXS
                     });


                  chart.flow( {
                     columns: cols,
                     length: 0,
                     done: function(){
                        //console.log( chart.xs()["nghia"] );
                     }} );

                  //highlight the update
                  chart.focus( keys );


                  var minX = date.getTime() - 1000*60*10;   //10 min

                  var data = chart.data.shown();

                  //set null to all points outside the chart
                  for( var i in data ){
                     var obj = data[i];

                     for( var j in obj.values ){
                        var p = obj.values[j];

                        if( p.x && p.x.getTime() < minX ){
                           p.value = null;
                           p.x = null;
                        }
                     }
                  }

                  //remove a target when all its data are null
                  var idsToRemove = [];
                  for( var i in data ){
                     var id = data[i].id ;
                     var arr = chart.data.values( id);

                     var isNull = true;
                     for( var j=0; j< arr.length; j++ )
                        if( arr[j] !== null ){
                           isNull = false;
                           break;
                        }
                     if( isNull  )
                        idsToRemove.push( id );
                  }


                  if( idsToRemove.length > 0){
                     chart.unload( idsToRemove );
                     console.log( "To remove: " + JSON.stringify( idsToRemove ) );
                  }

                  //reset newData
                  newData = {};
                  lastAddMoment = time;
               }
            };


            database.onMessage( function( msg ){
               if( msg[MMTDrop.constants.StatsColumn.FORMAT_ID.id] != MMTDrop.constants.CsvFormat.SESSION_STATS_FORMAT)
                  return;
               appendMsg( msg );
            });

            var report = new MMTDrop.Report(
                  //title
                  "Dashboard",

                  //database
                  database,

                  //filers
                  [fProbe, fMetric],

                  //charts
                  [{charts: [cLine], width: 12}],

                  //order of data flux
                  [{object: fProbe,
                     effect:[ {object: fMetric, effect: [{object: cLine, effect:[]} ]}]}]

            );

            //resetTimer();

            return report;
         },

         createActiveConnectionReport : function(){
            var COL = MMTDrop.constants.FlowStatsColumn;

            var database = new MMTDrop.Database({
               //probe : [10],
               format: MMTDrop.constants.CsvFormat.DEFAULT_APP_FORMAT,
               period: MMTDrop.constants.MINUTE
            }, function (data) {
               return data;
            }, true);

            var fProbe  = MMTDrop.filterFactory.createProbeFilter();
            var actApps = {};

            var cTable= MMTDrop.chartFactory.createTable({
               getData: {
                  getDataFn: function( db ){
                     var data = MMTDrop.tools.splitData(db.data(), COL.APP_NAME.id);
                     var arr = [];
                     for( var i in data){
                        var flows = data[i];
                        var flow = flows[0];
                        var app  = MMTDrop.constants.getProtocolNameFromID( i );
                        arr.push([
                           app,
                           flow[COL.CLIENT_ADDR.id],
                           flow[COL.SERVER_ADDR.id],
                           new Date(flow[COL.START_TIME.id])
                           ]);

                        actApps[ "<a>" + app + "</a>" ] = flow[COL.TIMESTAMP.id];
                     }
                     return {data: arr,
                        columns: [{id: 0, label:"Name"}, {id: 1, label: "Source"},
                           {id: 2, label: "Destination"}, {id: 3, label: "Start time"}]};
                  },
               }
            });

            var dataFlow = [ {
               object : fProbe,
               effect : [ {
                  object : cTable,
                  effect : []
               }, ]
            } ];

            var report = new MMTDrop.Report(
                  // title
                  "Active Connections",

                  // database
                  database,

                  // filers
                  [fProbe],

                  // charts
                  [
                     {charts: [cTable], width: 12},
                     ],

                     //order of data flux
                     dataFlow
            );


            database.onMessage( function( msg ){
               if( msg[COL.FORMAT_ID.id ] == MMTDrop.constants.CsvFormat.SESSION_STATS_FORMAT )
                  return;
               var app = msg[ COL.APP_NAME.id ];
               app = MMTDrop.constants.getProtocolNameFromID( app );
               app = "<a>" + app + "</a>";

               var src = msg[COL.CLIENT_ADDR.id];
               var dst = msg[COL.SERVER_ADDR.id];
               var ts  = msg[COL.START_TIME.id] * 1000;
               ts = new Date(ts);
               var arr = [app, src, dst, ts];

               actApps[app] = msg[COL.TIMESTAMP.id];
               console.log( actApps[ app ] );

               var isExist = false;
               var tbl = cTable.chart.dataTable();
               var data = tbl.fnGetData();
               for( var i=0; i<data.length; i++){
                  if( data[i][0] === app ){
                     isExist = true;
                     tbl.fnUpdate(arr, i);
                     console.log( "Update " + arr );
                     break;
                  }
               }

               if( !isExist ){
                  tbl.fnAddData( arr );
                  console.log( "Add " + arr );
               }
            });

            //remove old app
            setInterval(function(){
               var ts = (new Date()).getTime();
               for( var i in actApps ){
                  if( actApps[i] != null && ts - actApps[i] > 15000 ){
                     actApps[i] = null;
                  }
               }

               var tbl = cTable.chart.dataTable();
               var data = tbl.fnGetData();
               for( var i=0; i<data.length; i++){
                  var app = data[i][0] ;
                  if ( actApps[ app ] == null ){
                     console.log( "remove row "+ i + "=" + app);
                     tbl.fnDeleteRow( i );
                  }
               }
            }, 10000);

            return report;
         },

         /**
          * Create a report representing the hierarchy of protocols
          * @returns {MMTDrop.Report} report
          */
         createHierarchyReport : function(){
            var COL = MMTDrop.constants.StatsColumn;
            var database = MMTDrop.databaseFactory.createStatDB({
               //probe : [10]
            });

            var cTree  = MMTDrop.chartFactory.createTree({
               getData:{
                  getDataFn: function( db ){
                     var cols = [{id: COL.PACKET_COUNT.id,   label: "Packets"}];
                     if( fProbe.selectedOption().id != 0 )
                        cols.push( {id: COL.DATA_VOLUME.id,    label: "Data"} );
                     return db.stat.getDataTableForChart( cols, true );
                  }
               },
               click: function( e ){
                  if( Array.isArray( e ) == false)
                     return;

                  var data = database.stat.filter([{id: COL.APP_PATH.id, data: e}]);
                  var oldData = database.data();

                  //set new data for cLine
                  database.data( data );
                  cLine.attachTo( database );
                  cLine.redraw();

                  //reset
                  database.data( oldData );
               }
            });

            var cLine = MMTDrop.chartFactory.createTimeline({
               //columns: [MMTDrop.constants.StatsColumn.APP_PATH]
               getData:{
                  getDataFn   : function( db){
                     var colToSum   = fMetric.selectedOption().id;
                     var colsToGroup=[MMTDrop.constants.StatsColumn.TIMESTAMP.id,
                        MMTDrop.constants.StatsColumn.APP_PATH.id];

                     var data = db.data();
                     data = MMTDrop.tools.sumByGroups(data, [colToSum], colsToGroup);

                     var arr    = [];
                     var header = [];

                     for( var time in data){
                        var o = {};
                        o[MMTDrop.constants.StatsColumn.TIMESTAMP.id] = time;

                        var msg = data[time];
                        for( var path in msg ){
                           o[path] = msg[path][colToSum];
                           if( header.indexOf(path) == -1)
                              header.push(path);
                        }
                        arr.push( o );
                     }
                     var columns = [MMTDrop.constants.StatsColumn.TIMESTAMP];
                     for( var i=0; i<header.length; i++){
                        var path = header[i];
                        columns.push({ id: path, label: MMTDrop.constants.getPathFriendlyName( path ) });
                     }
                     return {data: arr, columns:columns, ylabel: fMetric.selectedOption().label};
                  },
               }
            });

            var fPeriod = MMTDrop.filterFactory.createPeriodFilter();
            var fProbe  = MMTDrop.filterFactory.createProbeFilter();
            var fMetric   = MMTDrop.filterFactory.createMetricFilter();

            //redraw cLine when changing fMetric
            fMetric.onFilter( function(){
               cLine.redraw();
            });

            var dataFlow = [ {
               object : fPeriod,
               effect : [ {
                  object : fProbe,
                  effect : [ {
                     object : cTree,
                     effect : []
                  }, ]
               }, ]
            }, ];

            var report = new MMTDrop.Report(
                  // title
                  "Protocol Hierarchy Report",

                  // database
                  database,

                  // filers
                  [fPeriod, fProbe, fMetric],

                  //charts
                  [
                     {charts: [cTree], width: 4},
                     {charts: [cLine], width: 8},
                     ],

                     //order of data flux
                     dataFlow
            );
            return report;
         },

         /**
          * Create a report representing the cateogries of protocols
          * @returns {MMTDrop.Report} report
          */
         createCategoryReport : function(){

            var database = MMTDrop.databaseFactory.createStatDB({
               //probe : [10]
            });

            var fPeriod = MMTDrop.filterFactory.createPeriodFilter();
            var fProbe  = MMTDrop.filterFactory.createProbeFilter();
            var fMetric   = MMTDrop.filterFactory.createMetricFilter();
            var fClass  = MMTDrop.filterFactory.createClassFilter();

            var chartOption = {
                  getData: {
                     getDataFn : function( db ){
                        var col = fMetric.selectedOption();
                        var obj = db.stat.getDataTableForChart( [col], false );
                        if( fClass.selectedOption().id != 0){
                           return obj;
                        }

                        //if the selected option of fClass is all classes
                        //do not show details, but total of each class
                        //obj = {data: data, columns: columns, probes: probes, ylabel: label};
                        var arr = [];

                        var data = db.stat.splitDataByClass();
                        for (var cls in data){
                           var ar = data[cls];
                           var name = MMTDrop.constants.getCategoryNameFromID( cls );

                           var oo = {};
                           if( obj.probes.length > 1){
                              var o = MMTDrop.tools.splitData(ar, MMTDrop.constants.StatsColumn.PROBE_ID.id);
                              for( var probe in o){
                                 var result = MMTDrop.tools.sumUp(o[probe], [col.id]);
                                 oo[probe] = result[col.id];
                              }
                           }else{
                              oo = MMTDrop.tools.sumUp(ar, [col.id]);
                              oo = oo[col.id];
                           }
                           arr.push( [name, oo] );
                        }

                        return {
                           data   : arr,
                           columns: [{id:0, label:"Class"}, {id:1, label:col.label, probes: obj.probes}],
                           probes : obj.probes,
                           ylabel :obj.ylabel};
                     }
                  }
            };

            var cBar  = MMTDrop.chartFactory.createBar(chartOption);
            var cPie  = MMTDrop.chartFactory.createPie(chartOption);

            var dataFlow = [ {
               object : fPeriod,
               effect : [ {
                  object : fProbe,
                  effect : [ {
                     object : fClass,
                     effect : [ {
                        object : fMetric,
                        effect : [ {
                           object : cBar,
                           effect : []
                        }, {
                           object : cPie,
                           effect : []
                        }, ]
                     }, ]
                  }, ]
               }, ]
            } ];

            var report = new MMTDrop.Report(
                  // title
                  "Application Categories Report",

                  // database
                  database,

                  // filers
                  [fPeriod, fProbe, fClass, fMetric],

                  // charts
                  [
                     {charts: [cPie, cBar], width: 12},
                     ],

                     // order of data flux
                     dataFlow
            );
            return report;
         },

         /**
          * Create a deail report of protocols
          * @returns {MMTDrop.Report} report
          */
         createApplicationReport : function(){
            var COL = MMTDrop.constants.StatsColumn;

            var database = MMTDrop.databaseFactory.createStatDB({
               //probe : [10]
            });

            var fPeriod = MMTDrop.filterFactory.createPeriodFilter();
            var fProbe  = MMTDrop.filterFactory.createProbeFilter();
            var fApp    = MMTDrop.filterFactory.createAppFilter();
            var fMetric   = MMTDrop.filterFactory.createMetricFilter();


            var chartOption = {
                  getData: {
                     getDataFn: function( db, cols ){
                        cols = cols || fMetric.selectedOption();
                        var app = fApp.selectedOption();
                        //all app
                        if( app.id == 0 || db.stat.getAppIDs().length == 1)
                           return db.stat.getDataTableForChart( cols, false);

                        var obj = db.stat.getDataTableForChart( cols, true);
                        for( var i in obj.data){
                           var msg  = obj.data[i];
                           var path = msg[COL.APP_PATH.id];
                           var arr  = path.split(".");
                           path = "";
                           for( var j=arr.length-1; j>=0; j--){
                              if( path == "")
                                 path = MMTDrop.constants.getProtocolNameFromID(arr[j]);
                              else
                                 path += "/" + MMTDrop.constants.getProtocolNameFromID(arr[j]);
                              if( arr[j] == app.id)
                                 break;
                           }
                           msg[COL.APP_PATH.id] = path;  //donot need add its grand parent name
                        }
                        return obj;
                     }
                  }
            };

            var cBar  = MMTDrop.chartFactory.createBar(chartOption);
            var cPie  = MMTDrop.chartFactory.createPie(chartOption);
            var cTable= MMTDrop.chartFactory.createTable({
               getData: {
                  getDataFn: function( db ){
                     var cols = [{id: COL.PACKET_COUNT.id,   label: "Packets"},
                        {id: COL.DATA_VOLUME.id,    label: "Data"},
                        {id: COL.PAYLOAD_VOLUME.id, label: "Payload"},
                        {id: COL.ACTIVE_FLOWS.id,   label: "Flows"}];
                     return chartOption.getData.getDataFn( db, cols );
                  },
               }
            });

            var cLine = MMTDrop.chartFactory.createTimeline({
               getData: {
                  getDataFn: function( db ){
                     var noApp = db.stat.getAppIDs().length;
                     var col = fMetric.selectedOption();
                     var app = fApp.selectedOption();

                     if( noApp == 1 || app.id == 0)
                        return db.stat.getDataTimeForChart( col, false, false );

                     var obj = db.stat.getDataTimeForChart( col, true, true );

                     for( var i=1; i<obj.columns.length; i++){
                        var msg  = obj.columns[i];
                        var path = msg.label;
                        var arr  = path.split(".");

                        path = "";
                        for( var j=arr.length-1; j>=0; j--){
                           if( path == "")
                              path = arr[j];
                           else
                              path += "/" + arr[j];
                           if( arr[j] == app.label)
                              break;
                        }
                        msg.label = path;  //donot need add its grand father name

                        //not root
                        if (path.indexOf("/") > 1){
                           obj.columns[i].type = "area";  //area-spline
                        }
                     }

                     //app UDP may come from IP.UDP or IPv6.UDP
                     var colsToRemove = {};

                     for( var i=1; i<obj.columns.length; i++){
                        if( colsToRemove[i] )
                           continue;

                        var id_i = obj.columns[i].id;

                        for(var j=i+1; j<obj.columns.length; j++)
                           if( obj.columns[i].label === obj.columns[j].label){
                              colsToRemove[j] = true;

                              var id_j = obj.columns[j].id;

                              for( var k in obj.data ){
                                 var arr = obj.data[k];

                                 if( arr[ id_i ] != undefined && arr[id_j] != undefined)
                                    arr[id_i] += arr[id_j];
                                 else if( arr[id_j] != undefined )
                                    arr[id_i] = arr[id_j];
                              }
                           }
                     }

                     //the first column is Timestamp
                     var cols = [ obj.columns[0] ];

                     for( var i=1; i<obj.columns.length; i++)
                        if( colsToRemove[i] == undefined)
                           cols.push( obj.columns[i] );

                     obj.columns = cols;

                     //
                     for( var k in obj.data ){
                        var arr = obj.data[k];
                        for( var i=1; i<cols.length; i++)
                           if( cols[i].type === "area" && arr[ cols[i].id ] == undefined)
                              arr[ cols[i].id ] = 0;
                     }

                     return obj;
                  }
               }
            });

            var dataFlow = [ {
               object : fPeriod,
               effect : [ {
                  object : fProbe,
                  effect : [ {
                     object : fApp,
                     effect : [ {
                        object : fMetric,
                        effect : [{object: cLine}, {object: cPie}, {object: cBar}]
                     }, {
                        object: cTable
                     }]
                  }, ]
               }, ],
            } ];

            var report = new MMTDrop.Report(
                  // title
                  "Application Report",

                  // database
                  database,

                  // filers
                  [fPeriod, fProbe, fApp, fMetric],

                  // charts
                  [
                     {charts: [cLine, cPie, cBar, cTable], width: 12},
                     ],

                     //order of data flux
                     dataFlow
            );
            return report;
         },


         /**
          * Create a report represeting a cloud of traffic
          * @returns {MMTDrop.Report} report
          */
         createFlowCloudReport : function(){
            var database = MMTDrop.databaseFactory.createFlowDB({
               //probe : [10]
            });

            var fPeriod = MMTDrop.filterFactory.createPeriodFilter();
            var fProbe  = MMTDrop.filterFactory.createProbeFilter();
            var fMetric   = MMTDrop.filterFactory.createFlowMetricFilter();

            var cLine = MMTDrop.chartFactory.createScatter({
               getData: {
                  getDataFn: function( db ){
                     var col = fMetric.selectedOption();

                     return db.stat.getTimePointsForChart(col);
                  }
               }
            });

            var dataFlow = [ {
               object : fPeriod,
               effect : [ {
                  object : fProbe,
                  effect : [ {
                     object : fMetric,
                     effect : [ {object: cLine}]
                  }, ]
               }, ],
            } ];

            var report = new MMTDrop.Report(
                  // title
                  "Flow Cloud Report",

                  // database
                  database,

                  // filers
                  [fPeriod, fProbe, fMetric],

                  // charts
                  [
                     {charts: [cLine], width: 12},
                     ],

                     //order of data flux
                     dataFlow
            );
            return report;
         },


         /**
          * Create a report representing the density of traffic
          * @returns {MMTDrop.Report} report
          */
         createFlowDensityReport : function(){
            var database = MMTDrop.databaseFactory.createFlowDB({
               //probe : [10]
            });

            var fPeriod = MMTDrop.filterFactory.createPeriodFilter();
            var fProbe  = MMTDrop.filterFactory.createProbeFilter();
            var fMetric   = MMTDrop.filterFactory.createFlowMetricFilter();

            var cLine = MMTDrop.chartFactory.createXY({
               getData: {
                  getDataFn: function( db ){
                     var col = fMetric.selectedOption();

                     return db.stat.getFlowDensityForChart(col);
                  }
               }
            });

            var dataFlow = [ {
               object : fPeriod,
               effect : [ {
                  object : fProbe,
                  effect : [ {
                     object : fMetric,
                     effect : [ {object: cLine}]
                  }, ]
               }, ],
            } ];

            var report = new MMTDrop.Report(
                  // title
                  "Flow Density Report",

                  // database
                  database,

                  // filers
                  [fPeriod, fProbe, fMetric],

                  // charts
                  [
                     {charts: [cLine], width: 12},
                     ],

                     //order of data flux
                     dataFlow
            );
            return report;
         },

         /**
          * Create a report representing the density of traffic
          * @returns {MMTDrop.Report} report
          */
         createCustomReport : function(){
            var database = new MMTDrop.Database({}, function( data ){
               return data;
            }, false);

            var fType   = MMTDrop.filterFactory.createDataTypeFilter();
            var fPeriod = MMTDrop.filterFactory.createPeriodFilter();
            var fProbe  = MMTDrop.filterFactory.createProbeFilter();

            var fMatrixX = new MMTDrop.Filter({
               id     : "filter_matrix_x",
               label  : "Matrix X",
               options: []
            }, function( sel, db){
            });
            var fMatrixY = new MMTDrop.Filter({
               id     : "filter_matrix_y",
               label  : "Matrix Y",
               options: []
            }, function( sel, db ){
               console.log( "filltered");
            });

            var con = MMTDrop.constants;
            //update list of matrix of X and Y when fType change
            fType.onFilter( function( sel, db ){
               var format = fType.selectedOption().id;
               var matrix = [];
               if( format == con.CsvFormat.SESSION_STATS_FORMAT ){
                  matrix = MMTDrop.tools.object2Array( con.StatsColumn );
               }else if ( format == con.CsvFormat.DEFAULT_APP_FORMAT ){
                  matrix = MMTDrop.tools.object2Array( con.FlowStatsColumn );
               }else if ( format == con.CsvFormat.WEB_APP_FORMAT ){
                  matrix = MMTDrop.tools.object2Array( con.HttpStatsColumn );
               }else if ( format == con.CsvFormat.SSL_APP_FORMAT ){
                  matrix = MMTDrop.tools.object2Array( con.TlsStatsColumn );
               }else if ( format == con.CsvFormat.RTP_APP_FORMAT ){
                  matrix = MMTDrop.tools.object2Array( con.RtpStatsColumn );
               }else if ( format == con.CsvFormat.RADIUS_REPORT_FORMAT ){
                  matrix = con.RadiusStatsColumn;
               }else if( format == con.CsvFormat.MICROFLOWS_STATS_FORMAT ){
                  matrix = con.MicroflowStatsColumn;
               }

               //add radical of sub-reports
               if( format == con.CsvFormat.SSL_APP_FORMAT ||
                     format == con.CsvFormat.WEB_APP_FORMAT ||
                     format == con.CsvFormat.RTP_APP_FORMAT){
                  var arr = MMTDrop.tools.object2Array( con.FlowStatsColumn );

                  var n = arr.length;
                  for( var i in matrix ){
                     var o = matrix[i];
                     arr.push( {id: n + o.id, label: o.label} );
                  }
                  matrix = arr;
               }

               //remove the first option: Format
               matrix = matrix.slice(1);
               fMatrixX.option( matrix );

               //remove the first option: Probe
               matrix = matrix.slice(1);
               fMatrixY.option( matrix );

               fMatrixX.redraw();
               fMatrixY.redraw();

               fMatrixX.filter();
               fMatrixY.filter();
            } );

            //paramter of charts
            var chartParam = {
                  getData: {
                     getDataFn: function( db ){
                        var colX = fMatrixX.selectedOption();
                        var colY = fMatrixY.selectedOption();

                        var obj = MMTDrop.tools.splitData( db.data(), colX.id );
                        var arr = [];
                        for( var x in obj ){
                           var o = obj[x];
                           o = MMTDrop.tools.sumUp( o, [colY.id] );
                           var y = o[colY.id];
                           if( typeof(y) == "object" )
                              y = JSON.stringify( y );

                           arr.push( [x, y] );
                        }
                        return {data: arr,
                           columns: [{id: 0, label: colX.label}, {id: 1, label: colY.label}],
                           ylabel : colY.label};
                     }
                  }
            };

            var cLine  = MMTDrop.chartFactory.createXY(chartParam);
            var cTable = MMTDrop.chartFactory.createTable( chartParam );
            var cBar   = MMTDrop.chartFactory.createBar(chartParam);
            var cPie   = MMTDrop.chartFactory.createPie(chartParam);

            var dataFlow = [ { object: fType,    effect: [{object: fProbe}]},
               { object: fPeriod,  effect: [{object: fProbe}]},
               { object: fMatrixX, effect: [{object: cLine}, {object: cTable}, {object: cBar}, {object: cPie}]},
               { object: fMatrixY, effect: [{object: cLine}, {object: cTable}, {object: cBar}, {object: cPie}]}];


            var report = new MMTDrop.Report(
                  // title
                  "Customization Report",

                  // database
                  database,

                  // filers
                  [fType, fPeriod, fProbe, fMatrixX, fMatrixY],

                  // charts
                  [
                     {charts: [cTable, cLine, cBar, cPie], width: 12},
                     ],

                     //order of data flux
                     dataFlow
            );
            return report;
         },
   };
///////////////////////////////////////////////////////////////////////////////////////////
// end MMTDrop.Report
///////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////
// MMTDrop.Chart
///////////////////////////////////////////////////////////////////////////////////////////

   /**
    * @class
    * A template to create a new chart.
    * @param {ChartRenderFn} renderFn -  is a callback using to render the chart to an HTML element
    * @param {ChartParam} [option={title:"", data: {getDataFn: null, columns: []}}]
    * @constructor
    */
   MMTDrop.Chart = function(option, renderFn){
      //add to list of created object
      if( MMTDrop.object.chart == undefined )
         MMTDrop.object.chart = [];
      MMTDrop.object.chart.push( this );

      var _option = {
            title : "",
            getData  : {
               getDataFn  : null,
               getDataArgs: [MMTDrop.constants.StatsColumn.DATA_VOLUME],
            },
            columns : [],  //columns to show and its header labels
      };

      var _elemID    = null;
      var _this      = this;
      this.database  = null;
      var _database  = null;
      var _data      = [];   //that is a copy of _database.data() at the moment of executing this.attachTo
      var _isCopyData= false; //whether _database.data() is copied to _data
      var _isVisible = true;

      this.delete = function(){

      }
      /**
       * Get the visibility property of the chart
       * @returns {boolean}
       *//**
       * Set the visibility property of the chart.
       * The chart will be redraw when it become visible.
       * @param {boolean} val
       */
      this.isVisible = function( val ){
         if ( val == undefined ){
            return _isVisible;
         }
         _isVisible = val;
         return _this;
      };

      this.clean = function(){
         $('#' + _elemID).empty();
      };

      /**
       * Attach the chart to a database.
       * @param {MMTDrop.Database} db
       * @param {boolean} [isCloneData=true] - clone data of database.
       * <br/> The <code>redraw</code> method will display database on the chart.
       * Database can be changed before <code>redraw</code> beeing called.
       * If this parameter is <code>true</code>, the chart will show data of <code>db</code> at
       * the moment of this method beeing called by preserving a copy of data.
       * Otherwise, the chart will show data of database ah the moment of <code>redraw</code> method beeing called.
       */
      this.attachTo = function ( db, isCloneData){
         if (db == null)
            return;

         _database = db;
         _data     = db.data();

         _isCopyData = isCloneData == undefined ? true: false;
         if( _isCopyData ){
            _data = MMTDrop.tools.cloneData( _data );
         }
         _this.database = _database;
      };


      /**
       * Set option property of the chart
       * @param {ChartParam} val - a new option will merge with the current option
       * @see {@link MMTDrop.tools#mergeObject}
       *//**
       * Get option property
       * @returns {ChartParam} opt
       */
      this.option = function( val ){
         if ( val == undefined ){
            return _option;
         }
         _option = MMTDrop.tools.mergeObjects( _option, val );
      };

      _this.option( option );

      /**
       * Render the chart to an HTML element
       * @param {string} elemID - id of the HTML element
       */
      this.renderTo = function (elemID){
         if (elemID == null){
            console.log("render chart to nothing");
            return;
         }

         _elemID = elemID;
         _this.elemID = _elemID;
         //redraw with the current _option
         this.redraw();
      };

      /**
       * Redraw the chart.
       * This should be called to redraw the chart when:
       *
       * * a new option is updated by <code>.option(opt)</code>
       * * attaching to a new database by <code>.attachedTo(db)</code>
       * * its database being changed by a filter
       */
      this.redraw = function(){
         if (! _isVisible)
            return;

         console.log("rendering chart ..."  + _option.title);

         if (_elemID == null){
            console.log("   no HTML element");
            return;
         }


         _this.clean();

         if (MMTDrop.tools.isFunction(renderFn)){

            if( MMTDrop.tools.isFunction( _option.beforeRender )  ){
               _option.beforeRender( _this );
               _option.beforeRender = null;
            }

            if( MMTDrop.tools.isFunction( _option.beforeEachRender )  ){
               _option.beforeEachRender( _this );
               _option.beforeEachRender = null;
            }

            //opt can be changed in this function
            var data = _prepareData( _option, _data, _this.database );

            if( _option.columns.length == 0){
               //throw new Error("   no columns to render" );
               console.log( " no column to render ");
            }
            else if( data.length == 0){
               //$("#" + _elemID).html('<div class="center-block text-warning" style="text-align:center">No data available</div>');
               console.log( "no data" );
            }
            this.chart = renderFn(_elemID, _option, data);
            this.chart.parent = this;
            if( MMTDrop.tools.isFunction( _option.afterRender )  ){
               _option.afterRender( _this );
               _option.afterRender = null;
            }

            if( MMTDrop.tools.isFunction( _option.afterEachRender )  ){
               _option.afterEachRender( _this );
            }

            var afterRender = (((MMTDrop.callback) || {}).chart || {}).afterRender;
            if( MMTDrop.tools.isFunction( afterRender )  ){
               afterRender( _this );
            }


            if( _option.bgPercentage ){
               setTimeout( function( opt ){
                  if( !Array.isArray( opt.column ))
                     opt.column = [ opt.column ];
                  for( var i in opt.column)
                     $(opt.table + " tr td:nth-child("+ opt.column[i] +")" ).each( function( index ){
                        var $this = $(this);
                        $this.addClass( opt.css );
                     });
               }, 1000, _option.bgPercentage);

               //aimation
               //change background-size
               setTimeout( function( opt ){
                  if( !Array.isArray( opt.column ))
                     opt.column = [ opt.column ];
                  for( var i in opt.column)
                     $(opt.table + " tr td:nth-child("+ opt.column[i] +")" ).each( function( index ){
                        var $this = $(this);
                        var val = 0;
                        if( opt.attr )
                           val = $this.children( opt.attr.children ).attr( opt.attr.att );
                        else
                           val = $this.text();
                        $this.attr("title", val);
                        $this.css( "background-size",  val + " 3px");
                     });
               }, 2000, _option.bgPercentage);


            }

         }else
            throw new Error ("No render function is defined");
      };


      /**
       * Icon reprenting for this chart.
       * This method must be implemented when createing a chart.
       * @returns {JQueryObject} a DOM element
       */
      this.getIcon = function(){
         throw new Error ("No icon is defined");
      };


      function _prepareData ( opt, data, db){
         if ( ! db)
            return [];

         if (opt && opt.getData && MMTDrop.tools.isFunction(opt.getData.getDataFn)){

            //arguments
            var arg = opt.getData.getDataArgs;
            if (MMTDrop.tools.isFunction( arg ))
               arg =  arg();

            var obj;
            if( _isCopyData ){
               //as _database.data() can be changed its content
               // but we want to draw the chart with the data got at the moment of executing this.attachTo
               var oldData = db.data();  //a copy of current data of _database
               db.data( _data );    //set database to the moment this.attachTo

               obj = opt.getData.getDataFn( db, arg );

               db.data( oldData );    //reset to its data
            }
            else
               obj = opt.getData.getDataFn( db, arg );

            if( obj == null){
               throw new Error("The return data from 'getDataFn' does not correct.\n" + opt.getData.getDataFn);
            }
            data = obj.data;

            //override _option.columns
            if( Array.isArray(obj.columns) && obj.columns.length > 0){
               opt.columns = obj.columns;
            }

            if( obj.ylabel )
               opt.ylabel = obj.ylabel;

            if( obj.height )
               opt.height = obj.height;
            if( obj.addZeroPoints )
               opt.addZeroPoints = obj.addZeroPoints;
            //dynamically create option for rendering chart

            if( obj.chart )
               opt.chart = MMTDrop.tools.mergeObjects( opt.chart, obj.chart );
         }

         //copy data to an array of array containing only data to show
         var arrData = [];
         for (var i in data){
            var msg = data[ i ];
            var a = [];
            for (var j=0; j<opt.columns.length; j++){
               var id = opt.columns[j].id;
               a.push( msg[id] );
            }
            arrData.push(a);
         }
         return arrData;
      };
   };



   /**
    * Create several kinds of charts.
    * @namespace
    */
   MMTDrop.chartFactory = {
         /**
          * Create Bar Chart
          * @param {ChartParam} param
          * @returns {MMTDrop.Chart} chart
          */
         createBar : function (param){
            var _param = {};
            _param = MMTDrop.tools.mergeObjects( _param, param );


            var chart = new MMTDrop.Chart( _param,
                  function (elemID, option, data){

               //flat data: retain the first columns
               //the next ones are of each probe
               //get list of probes
               var probes = [];
               for( var i in option.columns){
                  if( Array.isArray(option.columns[i].probes) && option.columns[i].probes.length > 1)
                     for( var j=0; j<option.columns[i].probes.length; j++){
                        var prob = option.columns[i].probes[j];
                        if( probes.indexOf( prob ) == -1)
                           probes.push( prob );
                     }
               }

               var columns = option.columns;
               var arrData     = data;

               if( probes.length > 1){
                  columns = [];
                  columns.push( option.columns[0]  );
                  for( var i in probes)
                     columns.push( {label: "Probe " + probes[i]} );

                  arrData = [];
                  for( var i in data){
                     var msg = data[i];
                     var arr = [];
                     arr.push( msg[ 0 ] );

                     var oo = msg[ 1 ];
                     for( var j in probes){
                        var probe = probes[j];
                        if( probe in oo)
                           arr.push( oo[probe] );
                        else
                           arr.push( 0 );
                     }

                     arrData.push( arr );
                  }
               }



               var ylabel = (columns.length == 2) ? columns[1].label : option.ylabel;
               var categories = [];

               //init series from 1th column
               for (var j=1; j<columns.length; j++)
                  categories.push( columns[j].label );

               var chart_opt = {
                     bindto: "#" + elemID,
                     data: {
                        type: 'bar',
                        columns: arrData,
                        order: null
                     },
                     axis : {
                        x : {
                           type: 'category',
                           categories: [""]
                        },
                        y: {
                           label: ylabel,
                           tick: {
                              format: function( val ){
                                 return val;
                              }
                           }
                        }
                     },
                     tooltip:{
                        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                           var $$ = this, config = $$.config,
                           titleFormat = config.tooltip_format_title || defaultTitleFormat,
                           nameFormat  = config.tooltip_format_name  || function (name) { return name; },
                           valueFormat = config.tooltip_format_value || defaultValueFormat,
                           text, i, title, value, name, bgcolor;
                           for (i = 0; i < d.length; i++) {
                              if (! (d[i] && (d[i].value || d[i].value === 0))) { continue; }

                              if (! text) {
                                 title = titleFormat ? titleFormat(d[i].x) : d[i].x;
                                 text = "<table class='" + $$.CLASS.tooltip + "'>" + (title || title === 0 ? "<tr><th colspan='2'>" + title + "</th></tr>" : "");
                              }

                              name = nameFormat(d[i].name);
                              value = valueFormat(d[i].value, d[i].ratio, d[i].id, d[i].index);
                              bgcolor = $$.levelColor ? $$.levelColor(d[i].value) : color(d[i].id);

                              text += "<tr class='" + $$.CLASS.tooltipName + "-" + d[i].id + "'>";
                              text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + name + "</td>";
                              text += "<td class='value'>" + value + "</td>";
                              text += "</tr>";
                           }
                           return text + "</table>";
                        },
                        grouped: true
                     },
               };
               if( option.chart )
                  chart_opt = MMTDrop.tools.mergeObjects( chart_opt, option.chart );

               var chart = c3.generate( chart_opt );
               return chart;
            });

            chart.getIcon = function(){
               return $('<i>', {'class': 'fa fa-bar-chart'});
            };

            return chart;
         },

         /**
          * Create Pie Chart
          * @param {ChartParam} param
          * @returns {MMTDrop.Chart} chart
          */
         createPie : function ( param ){
            //default parameter
            var _param = {};
            _param = MMTDrop.tools.mergeObjects( _param, param );

            var chart = new MMTDrop.Chart( _param,
                  function (elemID, option, data){
               //

               //flat data: retain the first columns
               //the next ones are of each probe
               //get list of probes
               var probes = [];
               for( var i in option.columns){
                  if( Array.isArray(option.columns[i].probes) && option.columns[i].probes.length > 1)
                     for( var j=0; j<option.columns[i].probes.length; j++){
                        var prob = option.columns[i].probes[j];
                        if( probes.indexOf( prob ) == -1)
                           probes.push( prob );
                     }
               }

               var columns = option.columns;
               var arrData     = data;

               if( probes.length > 1){
                  columns = [];
                  columns.push( option.columns[0]  );
                  for( var i in probes)
                     columns.push( {label: "Probe " + probes[i]} );

                  arrData = [];
                  for( var i in data){
                     var msg = data[i];
                     var arr = [];
                     arr.push( msg[ 0 ] );

                     var oo = msg[ 1 ];
                     for( var j in probes){
                        var probe = probes[j];
                        if( probe in oo)
                           arr.push( oo[probe] );
                        else
                           arr.push( 0 );
                     }

                     arrData.push( arr );
                  }
               }

               var series = [];

               if( columns.length < 2 )
                  throw new Error( "  no columns to show in pie chart" );

               //init series from 1th column
               var nSeries = columns.length - 1;

               var nRow   =  Math.ceil(nSeries / 2);//two columns
               var height = 90 / nRow;
               var space  = 10 / nRow;

               for (var j=1; j<columns.length; j++){
                  var x    = "50%";
                  var y    = "50%";
                  var size = height/2 + "%";
                  var row  = Math.ceil(j/2);
                  y = row*(height + space) - height/2 + "%";

                  if( nSeries > 1){
                     if( j % 2 == 1)
                        x = "20%";
                     else
                        x = "80%";
                  }


                  var serie = {
                        name  : columns[j].label,
                        data  : [],
                        center: [ x, y],
                        size  : size,
                        showInLegend: j > 1 ? false : true,
                  } ;

                  if (nSeries > 1)
                     serie.title = {
                        align: 'center',
                        //x: -20,
                        // style: { color: XXX, fontStyle: etc }
                        text: '<b>'+ columns[j].label +'</b>',
                        verticalAlign: 'top',
                        y: -80
                  };

                  series.push( serie );
               }

               var len = arrData.length;
               if( len > 50 ){
                  arrData.length = len = 0;
                  //MMTDrop.alert.error("Pie chart draws only the first 20 elements", 10*1000);
               }

               for (var i=0; i<len; i++){
                  var msg = arrData[i];

                  var name = msg[0];
                  //the first column is categorie, the next ones are series
                  //seriesSize is used in plotOptions
                  for (var j=1; j<msg.length; j++){
                     series[j-1].data.push( {name: name, y: msg[j],  seriesSize: nSeries} );
                  }
               }

               var chart_opt = {
                     bindto : "#" + elemID,
                     data : {
                        columns: arrData,
                        type: "pie"
                     },

               };
               if( option.chart )
                  chart_opt = MMTDrop.tools.mergeObjects( chart_opt, option.chart );

               var chart = c3.generate( chart_opt );
               chart.color = function( key ){
                  if( chart.colors == undefined )
                     chart.colors = chart.data.colors();
                  var c = chart.colors[ key ];
                  if( c )
                     return c;
                  return "#FFF";
               }



               return chart;
            });

            chart.getIcon = function(){
               return $('<i>', {'class': 'fa fa-pie-chart'});
            };



            return chart;
         },

         createTimeline : function (param, type){
            if( location.search === "?highchart" )
               return this.createTimelineHighChart( param, type );
            return this.createTimelineC3JS( param, type );
         },

         /**
          * Create Timeline Chart
          * @param {ChartParam} param
          * @returns {MMTDrop.Chart} chart
          */
         createTimelineHighChart : function (param, type){
            var _param = {};
            _param = MMTDrop.tools.mergeObjects( _param, param );

            var chart = new MMTDrop.Chart( _param,
                  function (elemID, option, data){

               //flat data: retain the first columns
               //the next ones are of each probe
               //get list of probes
               var probes = [];
               for( var i in option.columns){
                  if( Array.isArray(option.columns[i].probes) && option.columns[i].probes.length > 1)
                     for( var j=0; j<option.columns[i].probes.length; j++){
                        var prob = option.columns[i].probes[j];
                        if( probes.indexOf( prob ) == -1)
                           probes.push( prob );
                     }
               }

               var columns = option.columns;
               var arrData     = data;

               if( probes.length > 1){
                  columns = [];
                  columns.push( option.columns[0]  );
                  for( var i=1; i<option.columns.length; i++)
                     for( var k=0; k<probes.length; k++)
                        columns.push( {label: option.columns[i].label + "-" + probes[k]} );

                  arrData = [];
                  for( var i in data){
                     var msg = data[i];
                     var arr = [];
                     arr.push( msg[ 0 ] );

                     for( var j=1; j<msg.length; j++){
                        var oo = msg[j];
                        for( var k=0; k<probes.length; k++)  {
                           var probe = probes[k];
                           if( typeof(oo) == "object" && probe in oo)
                              arr.push( oo[probe] );
                           else
                              arr.push( 0 );
                        }
                     }

                     arrData.push( arr );
                  }
               }


               //the first column is timestamp
               for (var i=0; i<arrData.length; i++)
                  arrData[i][0] = parseInt(arrData[i][0]);

               //sort by the first column
               //arrData.sort( function (a, b){
               //  return a[0] - b[0];
               //});

               var height = option.height;
               if( height === undefined )
                  height = 200;

               var ylabel = option.ylabel;
               var series = [];

               //init series from 1th column
               //type: areaspline, line
               for (var j=1; j<columns.length; j++){
                  var obj =  {name:columns[j].label, data : [] };

                  if( columns[j].type == "area-stack" ){
                     obj.type  = "area";
                  }
                  else if( columns[j].type == "area-step-stack" ){
                     obj.step  = true;
                     obj.type  = "area";
                  }
                  obj.step  = true;
                  series.push( obj );
               }

               //set data for each serie
               for (var i=0; i<arrData.length; i++){
                  var msg = arrData[i];

                  //the first column is categorie, the next ones are series
                  for (var j=1; j<msg.length; j++){
                     if( msg[j] == undefined){
                        //continue;
                        msg[j] = 0;
                     }
                     series[j-1].data.push([ msg[0], msg[j] ]);
                  }
               }

               var isTimeLine = (type == undefined || type === "timeline" || type === "scatter");

               var chartOption = {
                     chart : {
                        renderTo    : elemID,
                        //type        : type || 'spline',
                        zoomType    : 'xy',
                        spacingTop  :30,
                        spacingRight:30,
                        height      : height,
                     },
                     navigation:{
                        buttonOptions: {
                           verticalAlign: 'top',
                           y: -25,
                           x: 20
                        }
                     },
                     credits: {
                        text: 'Montimage',
                        href: 'http://www.montimage.com',
                        position: {
                           align: 'right',
                           x: -40,
                           verticalAlign: 'top',
                           y: 20
                        }
                     },
                     xAxis : {
                        maxZoom:isTimeLine? 15000 : 1, // 15seconds
                              gridLineWidth: 0,
                              type : isTimeLine? 'datetime' : '',
                     },
                     yAxis : {
                        title : {
                           text : ylabel,
                        },
                        gridLineDashStyle: "longdash",
                        min : 0,
                     },
                     title : {
                        text : "",
                     },
                     tooltip: {
                        shared: true,
                     },
                     plotOptions: {
                        scatter: {
                           marker: {
                              radius: 3,
                              states: {
                                 hover: {
                                    enabled: true,
                                    lineColor: 'rgb(100,100,100)',
                                 }
                              }
                           },
                           states: {
                              hover: {
                                 marker: {
                                    enabled: false,
                                 }
                              }
                           },
                           tooltip: {
                              headerFormat: '<b>{series.name}</b><br>',
                              pointFormat: '{point.y}',
                              crosshairs: [false, true],
                           },
                           events : {
                              click : option.click,
                           },
                        },
                        areaspline: {
                           lineWidth: 1,
                           marker: {
                              enabled: false
                           },
                           shadow: false,
                           states: {
                              hover: {
                                 lineWidth: 2
                              }
                           },
                           stacking: 'normal',
                           events : {
                              click : option.click,
                           },
                        },
                        area: {
                           lineWidth: 1,
                           marker: {
                              enabled: false
                           },
                           shadow: false,
                           states: {
                              hover: {
                                 lineWidth: 2
                              }
                           },
                           stacking: 'normal',
                           events : {
                              click : option.click,
                           },
                        },
                        spline: {
                           lineWidth: 1,
                           marker: {
                              enabled: false
                           },
                           shadow: false,
                           states: {
                              hover: {
                                 lineWidth: 2
                              }
                           },
                           events : {
                              click : option.click,
                           },
                        },
                        line: {
                           lineWidth: 1,
                           marker: {
                              enabled: false
                           },
                           shadow: false,
                           states: {
                              hover: {
                                 lineWidth: 2
                              }
                           },
                           events : {
                              click : option.click,
                           },
                        },
                     },
                     series : series
               };

               var hightChart = new Highcharts.Chart(chartOption);

               hightChart.color = function( k ){
                  var series = this.series;
                  for( var i in series )
                     if( series[i].name === k )
                        return series[ i ].color;
               };
               hightChart.focus = function( k ){
                  var series = this.series;
                  for( var i in series )
                     if( series[i].name === k )
                        series[i].lineWdith = 2;
               };
               hightChart.revert = function( ){
                  var series = this.series;
                  for( var i in series )
                     if( series[i].lineWidth === 2 )
                        series[i].lineWdith = 1;
               };
               hightChart.resize = function( size ){
                  this.setSize( size.width, size.height );
               }

               return hightChart;
            });

            chart.getIcon = function(){
               return $('<i>', {'class': 'glyphicons-chart'});
            };


            return chart;
         },
         /**
          * Create Timeline Chart
          * @param {ChartParam} param
          * @returns {MMTDrop.Chart} chart
          */
         createTimelineC3JS : function (param, type){
            var _param = {};
            _param = MMTDrop.tools.mergeObjects( _param, param );

            var chart = new MMTDrop.Chart( _param,
                  function (elemID, option, data){

               //flat data: retain the first columns
               //the next ones are of each probe
               //get list of probes
               var probes = [];
               for( var i in option.columns){
                  if( Array.isArray(option.columns[i].probes) && option.columns[i].probes.length > 1)
                     for( var j=0; j<option.columns[i].probes.length; j++){
                        var prob = option.columns[i].probes[j];
                        if( probes.indexOf( prob ) == -1)
                           probes.push( prob );
                     }
               }

               var columns = option.columns;
               var arrData = data;

               if( probes.length > 1){
                  columns = [];
                  columns.push( option.columns[0]  );
                  for( var i=1; i<option.columns.length; i++)
                     for( var k=0; k<probes.length; k++)
                        columns.push( {label: option.columns[i].label + "-" + probes[k]} );

                  arrData = [];
                  for( var i in data){
                     var msg = data[i];
                     var arr = [];
                     arr.push( msg[ 0 ] );

                     for( var j=1; j<msg.length; j++){
                        var oo = msg[j];
                        for( var k=0; k<probes.length; k++)  {
                           var probe = probes[k];
                           if( typeof(oo) == "object" && probe in oo)
                              arr.push( oo[probe] );
                           else
                              arr.push( null );
                        }
                     }

                     arrData.push( arr );
                  }
               }

               //sort by the first column (time)
               for( var i in arrData )
                  arrData[i][ 0 ] = parseInt( arrData[i][ 0 ] );

               arrData.sort( function (a, b){
                  return a[0] - b[0];
               });

               var obj = [];
               var n   = columns.length;
               //if( n > 11 ){
               //   //console.log("There are totally " + n + " line charts. I draw only the first 20 lines on the chart");
               //   MMTDrop.alert.error("Line chart draws only the first 10 elements", 10);
               //   n = 10;
               //}

               //header
               obj[0] = ["x"];    //ox
               for( var j=1; j<n; j++){
                  obj[j] = [ columns[j].label];
               }

               if( option.addZeroPoints ){
                  var time        = option.addZeroPoints.time;
                  var period      = option.addZeroPoints.sample_period;
                  var probeStatus = option.addZeroPoints.probeStatus;
                  //the first column is timestamp
                  var start_time  = time.begin, end_time = time.end;
                  var time_id     = 0;

                  if( (time.end - time.begin) / period > 2000 ){
                     throw new Error("too long");
                  }

                  var create_zero = function( ts ){
                     var zero = {};
                     zero[time_id] = ts;
                     return zero;
                  }

                  //check if probe was runing at ts
                  var is_probe_running_at = function( ts ){
                     //for each probe
                     for( var p_id in probeStatus )
                        //for each running period of a probe
                        for( var i in probeStatus[ p_id ])
                           if( probeStatus[p_id].indexOf( ts ) != -1 )
                              return true;
                     return false;
                  }

                  //add first element if need
                  if( arrData.length == 0 || start_time < (arrData[0][ time_id ] - period) )
                     arrData.unshift( create_zero( start_time ) );

                  //add last element if need
                  if( arrData.length == 0 || end_time > (arrData[ data.length - 1 ][ time_id ] + period ) )
                     arrData.push( create_zero( end_time ));

                  var len = arrData.length;
                  var arr = [ arrData[0] ];
                  for (var i = 1; i < len; i++) {
                     var t = arrData[i-1][ time_id ];
                     //if there exist any hole between two consecutif reports
                     while( arrData[i][ time_id ] - t >= 1.5 * period ){
                        t += period;
                        arr.push( create_zero( t )  );
                     }
                     arr.push( arrData[i] );
                  }

                  arrData = arr;

                  for (var i=0; i<arrData.length; i++){
                     //the first column is timestamp
                     var x = arrData[i][0];
                     var is_running = is_probe_running_at( x );

                     obj[0].push( new Date(x) );        //x

                     for( var j=1; j<n; j++){
                        var val = arrData[i][j];
                        if( val == null){
                           if( is_running )
                              val = 0;
                           else{
                              //at this point, probe is not running

                              //this point is null but its precedent is not ==> put down to zero
                              if( i>0 && arrData[i-1][j] != null )
                                 val = 0;
                              //this point is null but its following is not ==> put down to zero
                              else if( i<arrData.length -1 && arrData[i+1][j] != null ) 
                                 val = 0;
                              else
                                 val = null;//should be null, not undefined
                           }
                        }
                        obj[j].push( val );  //y
                     }
                  }
               }
               else if( option._addZeroPoints  ){
                  const time        = option.addZeroPoints.time;
                  const period      = option.addZeroPoints.sample_period;
                  const probeStatus = option.addZeroPoints.probeStatus;
                  //the first column is timestamp
                  const time_id     = 0;
                  //the first column is timestamp
                  var begin  = 0, end = 0; 
                  //first timestamp
                  //TODO: this is correct only for one probe
                  var probeTS = null;
                  for( var i in probeStatus ){
                     probeTS = probeStatus[ i ];
                     break;
                  }

                  //no probe is running
                  if( probeTS == null )
                     probeTS = [];
                  else
                     probeTS.sort(); //increase of timestamp;
                  /*
            //insert the first end to timeline if need
            if( probeTS.length == 0 || probeTS[0] > time.begin )
	            	probeTS.unshift( time.begin );
            //add the s end to timeline if need
            if( probeTS.length == 0 || probeTS[0] < time.end )
	            	probeTS.push( time.end );
                   */

                  //add data to timeline
                  for( var i=0; i<probeTS.length; i++ ){
                     var ts = probeTS[ i ];

                     //first colum is timestamp
                     obj[0].push( new Date( ts ) );
                     //next columns are data

                     //find a msg in data having the same timestamp with ts of probeStatus
                     var msg = {};
                     for( var j=0; j<arrData.length; j++ )
                        if( arrData[i][ 0 ] == ts ){
                           msg  = arrData[i];
                           break;
                        }

                     for( var j=1; j<n; j++ ){
                        var val = msg[j];
                        if( val === undefined )
                           val = 0;
                        obj[j].push( 0 );  //y
                     }
                  }


                  //	for( var j=1; j<n; j++ )
                  //		obj[j].push( null );  //y: //must be null, not undefined

               }
               else
                  for (var i=0; i<arrData.length; i++){
                     //the first column is timestamp
                     var x = arrData[i][0];

                     obj[0].push( new Date(x) );        //x

                     for( var j=1; j<n; j++){
                        var val = arrData[i][j];
                        if( val === undefined )
                           val = 0;
                        obj[j].push( val );  //y
                     }
                  }

               //as j starts from 1 ==> obj starts from 1
               // I will remove the first index of obj
               //obj.shift();



               var ylabel = option.ylabel;
               var height = 200;
               if( option.height )
                  height = option.height;

               var groups = [];
               for (var j=1; j<columns.length; j++){
                  //not root
                  //if( columns[j].label.indexOf("/") > 0 )
                  if( columns[j].type == "area-stack" ){
                     columns[j].type = "area";
                     groups.push( columns[j].label );
                  }
                  else if( columns[j].type == "area-step-stack" ){
                     columns[j].type = "area-step";
                     groups.push( columns[j].label );
                  }
               }

               var types = {};
               //init series from 1th column
               //type: areaspline, line
               for (var j=1; j<columns.length; j++){
                  if( columns[j].type )
                     types[ columns[j].label ] = columns[j].type;
               }


               var isTimeLine = (type == undefined || type === "timeseries" || type === "scatter");

               var formatNumber = function( v ){
                  if( v == 0)
                     return "";
                  else return " " + v;
               }

               var radius = (type === "scatter" )? 3 : 1;

               var chart_opt = {
                     bindto : "#" + elemID,
                     data : {
                        x      : "x",
                        columns: obj,
                        type   : (type === "scatter")? type:  "",
                              types  : types,
                              groups : [ groups ],
                              //order  : 'desc' // stack order by sum of values descendantly. this is default.
                              //order: 'asc'  // stack order by sum of values ascendantly.
                              order: null,   // stack order by data definition.}
                     },
                     size:{
                        height: height
                     },

                     axis: {
                        x: {
                           type: "timeseries",
                           tick: {
                              format: function( v ){
                                 return v.getHours() + ":" + v.getMinutes() + ":" + v.getSeconds() ;
                              },
                              count : 10,
                           }
                        },
                        y: {
                           label: {
                              text: ylabel,
                              position: "outer-top"
                           },
                           min: 0,
                           padding: {
                              top: 10,
                              bottom: 2
                           },
                           tick: {
                              format: function( v ) {
                                 if( v < 0 ) return 0;
                                 return MMTDrop.tools.formatDataVolume( v );
                              },
                              count: 5,
                           }
                        }
                     },
                     tooltip:{
                        format: {
                           title: MMTDrop.tools.formatDateTime
                        },
                        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                           var $$ = this, config = $$.config,
                           titleFormat = config.tooltip_format_title || defaultTitleFormat,
                           nameFormat  = config.tooltip_format_name  || function (name) { return name; },
                           valueFormat = config.tooltip_format_value || defaultValueFormat,
                           text, i, title, value, name, bgcolor;
                           for (i = 0; i < d.length; i++) {
                              if (! (d[i] && (d[i].value || d[i].value === 0))) { continue; }

                              if (! text) {
                                 title = titleFormat ? titleFormat(d[i].x) : d[i].x;
                                 text = "<table class='" + $$.CLASS.tooltip + "'>" + (title || title === 0 ? "<tr><th colspan='2'>" + title + "</th></tr>" : "");
                              }

                              name = nameFormat(d[i].name);
                              value = valueFormat(d[i].value, d[i].ratio, d[i].id, d[i].index);
                              bgcolor = $$.levelColor ? $$.levelColor(d[i].value) : color(d[i].id);

                              text += "<tr class='" + $$.CLASS.tooltipName + "-" + d[i].id + "'>";
                              text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + name + "</td>";
                              text += "<td class='value'>" + value + "</td>";
                              text += "</tr>";
                           }
                           return text + "</table>";
                        },
                        grouped: true
                     },
                     grid: {
                        x: {
                           show: true
                        },
                        y:{
                           show: true
                        }
                     },
                     point: {
                        //show: false,
                        r: 1,
                        focus: {
                           expand: {
                              r: 5
                           }
                        }
                     },
                     line: {
                        connectNull: false
                     },
                     zoom: {
                        enabled: true,
                        rescale: true
                     }
               };
               //console.log( chart_opt );
               if( option.chart )
                  chart_opt = MMTDrop.tools.mergeObjects( chart_opt, option.chart );

               var nb_real_points = 0;
               if( obj[1] )
                  for( var i = 0; i<obj[0].length; i++)
                     if( obj[1][i] != null )
                        nb_real_points ++;

               if( nb_real_points <= 2 ){
                  chart_opt.point.r   = 3;
                  delete(chart_opt.data.type);
                  delete(chart_opt.data.types);
               }
               var chart = c3.generate( chart_opt );
               return chart;
            });

            chart.getIcon = function(){
               return $('<i>', {'class': 'fa fa-line-chart'});
            };
            return chart;
         },


         /**
          * Create Scatter Chart
          * @param {ChartParam} param
          * @returns {MMTDrop.Chart} chart
          */
         createScatter : function ( param ){
            return MMTDrop.chartFactory.createTimeline( param, 'scatter');
         },


         /**
          * Create XY Chart
          * @param {ChartParam} param
          * @returns {MMTDrop.Chart} chart
          */
         createXY : function ( param ){
            return MMTDrop.chartFactory.createTimeline( param, 'line' );
         },

         /**
          * Create Tree Chart
          * @param {ChartParam} param
          * @returns {MMTDrop.Chart} chart
          */
         createTree : function ( param ){
            //default parameter
            var _param = {};

            _param = MMTDrop.tools.mergeObjects( _param, param );

            var chart = new MMTDrop.Chart( _param,
                  function (elemID, option, data){

               //render to elemID
               var treeWrapper = $('<div>', {
                  'class'     : 'report-element-tree',
                  'style'     : 'border: 1px solid #888; overflow-x: scroll',
                  
               });

               treeWrapper.appendTo($('#' + elemID));

               var table = $('<table>', {
                  'id' : elemID + '_treetable',
                  'cellpadding' : 0,
                  'cellspacing' : 0,
                  'border'      : 0,
                  'style'       : 'border: 0 !important'

               });

               table.appendTo(treeWrapper);


               //header of table
               var thead = $('<thead>');
               var tr = $('<tr>');
               var th;

               var isMultiProbes = false;

               var th0 = null;
               for (var i = 0; i < option.columns.length; i++) {
                  th = $('<th>', {
                     'text' : option.columns[i].label,
                     'style': "width: "+ (i==0? 200: 120) +"px"
                  });
                  if( i== 0 )
                     th0 = th;

                  option.columns[i].isMultiProbes = (Array.isArray(option.columns[i].probes) == true
                        && (option.columns[i].probes.length > 0)) ;

                  if( option.columns[i].isMultiProbes ){
                     th.attr('colspan',  option.columns[i].probes.length);
                     th.css("text-align", "center");
                     isMultiProbes = true;
                  }

                  th.appendTo(tr);
               }

               if( isMultiProbes > 0 && th0 != null)
                  th0.attr("rowspan", 2);

               tr.appendTo(thead);
               thead.appendTo(table);

               //sub header
               if( isMultiProbes > 0){
                  tr = $('<tr>');

                  for (var i = 0; i < option.columns.length; i++) {
                     if( option.columns[i].isMultiProbes ){
                        for( var j=0; j<option.columns[i].probes.length; j++ ){
                           th = $('<th>', {
                              'text'  : "Probe " + option.columns[i].probes[j],
                              'style' : "width: 120px"
                           });
                           th.appendTo(tr);
                        }
                     }
                  }

                  tr.appendTo(thead);
                  thead.appendTo(table);
               }


               //body of table
               var tbody = $('<tbody>');

               //copy data to an array of array
               for (var i in data){
                  var msg = data[i]
                  //separate APP_PATH
                  var path = msg[0];
                  var d    = path.lastIndexOf(".");

                  var name = path;
                  var parent = null;
                  if (d >= 0){
                     name   = path.substring(d + 1);
                     parent = path.substring(0, d);
                  }
                  name = MMTDrop.constants.getProtocolNameFromID(name);
                  msg[0] = {path: path, parent: parent, name: name};
               }

               //sort by protocol name
               data.sort( function( a, b ){
                  return a[0].name.localeCompare( b[0].name );
               });

               for( var i in data ){
                  var obj = data[i][0];
                  obj.children = [];
                  for( var j in data )
                     if( obj.path == data[j][0].parent )
                        obj.children.push( data[j] );

                  obj.children.sort( function( a, b ){
                     return a[0].name.localeCompare( b[0].name );
                  });
               }

               //flat
               var arrData = [];
               var flat_data = function( parent_path ){
                  for( var i in data ){
                     var msg = data[i];
                     var obj = msg[0];
                     //root
                     if( obj.parent == parent_path && obj.isVisited !== true ){
                        arrData.push( msg );
                        obj.isVisited = true;
                        for( var j in obj.children ){
                           flat_data( obj.children[j][0].parent );
                        }
                     }
                  }
               }

               flat_data( null );

               var no_columns = 0;
               //add each element to a row
               for (i in arrData) {
                  var msg = arrData[i];

                  var path   = msg[0].path;
                  var name   = msg[0].name;
                  var parent = msg[0].parent;
                  var title  = MMTDrop.constants.getPathFriendlyName( path );

                  //root
                  var row_tr = $('<tr>', {
                     'data-tt-id' : path,
                     'title'      : title
                  });

                  if (parent != null)
                     row_tr = $('<tr>', {
                        'data-tt-id'        : path,
                        'data-tt-parent-id' : parent,
                        'title'             : title
                     });

                  //first column
                  var row_name = $('<td>', {
                     text : name,
                     title: name,
                     style: "width: 200px"
                  });
                  row_name.appendTo(row_tr);

                  var count = 0;
                  for (var j = 1; j < msg.length; j++) {
                     if( option.columns[j].isMultiProbes == false){
                        var cell = $('<td>', {
                           text : msg[j],
                           align: "right",
                           style: "width: 120px"
                        });
                        cell.appendTo(row_tr);
                        count ++;
                     }else{
                        for( var k=0; k<option.columns[j].probes.length; k++){
                           var prob = option.columns[j].probes[k];
                           var val  = msg[j][ prob ];
                           if( val == undefined )
                              val = 0;

                           var cell = $('<td>', {
                              text : val,
                              align: "right",
                              style: "width: 120px"
                           });
                           cell.appendTo(row_tr);
                           count ++;
                        }
                     }

                  }
                  row_tr.appendTo(tbody);

                  if( no_columns < count )
                     no_columns = count;
               }

               tbody.appendTo(table);

               //convert table to tree
               var chart_opt = {
                     indent            : 10,
                     expandable        : true,
                     initialState      : "expanded",  //expand all nodes
                     clickableNodeNames: true
               };

               //console.log( chart_opt );
               if( option.chart )
                  chart_opt = MMTDrop.tools.mergeObjects( chart_opt, option.chart );


               table.treetable( chart_opt );

               table.no_columns = no_columns;
               table.css('width', (200 + no_columns * 120) );

               table.updateSize = function( w ){
                  if( w == undefined )
                     return;
                  if( w > table.width() )
                     w = table.width();
                  
                  treeWrapper.width( w );
               };
               
               //when user click on a row
               $("#" + elemID + "_treetable tbody tr td:not(:first-child)").click({
                  chart : this
               }, function(e) {

                  //note:  this = selected row
                  // Highlight selected row, if it was hightlight => un hightlight it
                  $(this).parent().toggleClass("selected");


                  //if user regist to handle click event ==> give him the control
                  if (option.click) {
                     //get all selected rows
                     var arr = [];
                     var selectedRows = $('#' + elemID + "_treetable tbody tr").filter(".selected");

                     selectedRows.each( function(){;
                     var id = this.dataset["ttId"];//data-tt-id
                     arr.push( id );
                     });

                     if( arr.length > 5 ){
                        arr.length = 5;
                        $(this).parent().removeClass("selected");
                        return;
                     }

                     MMTDrop.tools.localStorage.set("tree-selected-ids-" + elemID, arr );
                     option.click( arr, this );
                  }
               });

               var preSelected = MMTDrop.tools.localStorage.get("tree-selected-ids-" + elemID)
//             click in the first 'tr' of the tree element
               if( preSelected == undefined || preSelected.length === 0)
                  $("#" + elemID + "_treetable tbody tr:first td:last").trigger("click");
               else{
                  for( var i=0; i<preSelected.length; i++)
                     $("#" + elemID + "_treetable tbody tr[data-tt-Id='"+ preSelected[i] +"']").toggleClass("selected");

                  //if user regist to handle click event ==> give him the control
                  if (option.click)
                     option.click( preSelected );

               }

               return table;
            });

            chart.getIcon = function(){
               return $('<i>', {'class': 'fa fa-table'});
            };
            return chart;
         },


         /**
          * Create Table Chart
          * @param {ChartParam} param
          * @returns {MMTDrop.Chart} chart
          */
         createTable : function (param){
            //default parameter
            var _param = {};
            _param = MMTDrop.tools.mergeObjects( _param, param );

            var chart = new MMTDrop.Chart(_param,
                  //render function
                  function (elemID, option, data){
               //render to elemID

               var table = $('<table>', {
                  'id' : elemID + '_table',
                  'cellpadding' : 0,
                  'cellspacing' : 0,
                  'border'      : 0,
                  'class'       : "table table-striped table-bordered table-condensed",
                  'width'       : "100%"
               });

               table.appendTo($('#' + elemID));


               //header of table
               var thead = $('<thead>');
               var tr = $('<tr>');
               var th;

               var isMultiProbes = false;

               var th0 = null;
               for (var i = 0; i < option.columns.length; i++) {
                  th = $('<th>', {
                     'text' : option.columns[i].label
                  });
                  if( i== 0 )
                     th0 = th;
                  option.columns[i].isMultiProbes = Array.isArray(option.columns[i].probes) &&
                  option.columns[i].probes.length > 0;
                  if( option.columns[i].isMultiProbes ){
                     isMultiProbes = true;
                     th.attr('colspan',  option.columns[i].probes.length);
                  }

                  th.appendTo(tr);
               }

               if( isMultiProbes > 0 && th0 != null)
                  th0.attr("rowspan", 2);

               tr.appendTo(thead);
               thead.appendTo(table);

               //sub header
               if( isMultiProbes > 0){
                  tr = $('<tr>');

                  for (var i = 0; i < option.columns.length; i++) {
                     if( option.columns[i].isMultiProbes ){
                        for( var j=0; j<option.columns[i].probes.length; j++ ){
                           th = $('<th>', {
                              'text' : "Probe " + option.columns[i].probes[j]
                           });
                           th.appendTo(tr);
                        }
                     }
                  }

                  tr.appendTo(thead);
                  thead.appendTo(table);
               }


               //body of table
               var tbody = $('<tbody>');

               //copy data to an array of array
               var arrData = data;

               //sort by path, then by name
               /*
        arrData.sort(function (a, b){
          if (a[0]. == b[0].parent )
            return a[0].name > b[0].name ? 1: -1;

            return a[0].path > b[0].path ? 1 : -1;
        });
                */
               //add each element to a row

               if( option.chart && option.chart.deferRender === true){
                  option.chart.data = arrData;
                  option.chart.columns = [];

                  for( var i in option.columns )
                     if( option.columns[i].align === "right" )
                        option.chart.columns.push( {className: "text-right"} );
                     else if( option.columns[i].class )
                        option.chart.columns.push( {className: option.columns[i].class } );
                     else
                        option.chart.columns.push( [] );

               }else
                  for (var i in arrData) {
                     var msg = arrData[i];


                     //root
                     var row_tr = $('<tr>', {
                     });


                     //first column
                     var row_name = $('<td>', {
                        style  : "cursor:pointer",
                        html   : option.columns[0].format ? option.columns[0].format( msg[0], msg ) : msg[0]  
                     });

                     row_name.appendTo(row_tr);

                     for (var j = 1; j < msg.length; j++) {

                        var align = "left";
                        if( option.columns[j].align )
                           align = option.columns[j].align;
                        else
                           if( MMTDrop.tools.isNumber( val ))
                              align = "right";

                        if( option.columns[j].isMultiProbes == false){
                           var val = msg[j];
                           if( option.columns[j].format )
                              val = option.columns[j].format( val, msg );

                           var opt = {
                                 html : val,
                           };


                           $('<td>', {
                              html : val,
                              align: align
                           }).appendTo(row_tr);

                        }else{
                           for( var k=0; k<option.columns[j].probes.length; k++){
                              var prob = option.columns[j].probes[k];
                              var val  = msg[j][ prob ];
                              if( option.columns[j].format )
                                 val = option.columns[j].format( val, msg );
                              if( val == undefined )
                                 val = 0;

                              $('<td>', {
                                 html : val,
                                 align: align
                              }).appendTo(row_tr);
                           }
                        }
                     }
                     row_tr.appendTo(tbody);
                  }

               tbody.appendTo(table);
               var chart_opt = {

               };
               if( option.chart )
                  chart_opt = MMTDrop.tools.mergeObjects( chart_opt, option.chart );


               table.dataTable(chart_opt);

               //when user click on a row
               if (option.click) {
                  $("#" + elemID + "_table tbody tr").click({
                     chart : this
                  }, function(e) {
                     //note:  this = selected row
                     // Highlight selected row, if it was hightlight => un hightlight it
                     $(this).toggleClass("active");

                     //if user regist to handle click event ==> give him the control
                     if (option.click) {
                        option.click( this );
                     }
                  });
               }
               var bg = option.pecentageBackground;
               if( bg ){

               }
               return table;
            });

            chart.update = function( msg ){

            };
            chart.getIcon = function(){
               return $('<i>', {'class': 'fa fa-table'});
            };
            return chart;
         },
   };

   /**
    * Data value that is either a string or a number
    * typedef {(number|string)} Value
    */

   /**
    * An object with id and label
    * @typedef {Object} Index
    * @property {Value} id
    * @property {string} label
    */

   /**
    * The parameter when creating a new filter
    * @typedef {Object} FilterParam
    * @property {id} id
    * @property {string} label
    * @property {Index[]} options List of options
    * @property {function} [onchange=null]
    * <br/> If {param.onchange} function is defined, it will handle the changing.
    * <br/> If the function return <code>true</code>, the default actions
    * <br/>   (store the change to localStorage, apply the change to its attached database)
    * <br/>   are then executed.
    */

   /**
    * The parameter when creating a chart.
    * @typedef {Object} ChartParam
    * @property {string} title - title of the chart
    * @property {string} ylabel
    * @property click -
    * @property {ChartPrepreData} getData.getDataFn - a
    * @property {Object} getData.getDataArgs - an argument to be passed to getData.getDataFn
    * @property {Index[]} columns - columns tobe shown.

    */

   /**
    * Processing data before displaying them into charts
    * @callback ChartPrepreData
    * @param {MMTDrop.Database} db
    * @param {Object} val - user data
    * @returns {{data: Array, columns: Index[], ylabel:string}}
    */

   /**
    * Render a chart
    * @callback ChartRenderFn
    * @param {string} elemID - id of HTML element on which the chart is rendered
    * @param {ChartParam} option - option
    * @param {Array} data - data to show
    */

   /**
    * Data getting from MMT-Operator
    * <br> Each element of Data is an array.
    *  The elements in the array are depended on its kind and defined by either by:
    * <br> - {@link MMTDrop.constants.StatsColumn}
    * <br> - {@link MMTDrop.constants.FlowStatsColumn}
    * <br> - {@link MMTDrop.constants.HttpStatsColumn}
    * <br> - {@link MMTDrop.constants.TlsStatsColumn}
    * <br> - {@link MMTDrop.constants.RtpStatsColumn}
    * @typedef {Array.<Array>} Data
    */

   /**
    * Parameters using to get data from MMT-Operator
    * @example
    * {period: "minute", format: 99, source: ["eth0"], probe: [1,2], raw: true}
    *
    * @typedef {Object} DatabaseParam
    * @property {MMTDrop.constants.period} [period=MINUTE] -
    * @property {MMTDrop.constants.CsvFormat} [format=99] - kind of data
    * @property {Array.<string>} [source=[]] - source
    * @property {Array.<number>} [probe=[]] - probe Id
    */

   /**
    * Processing database
    * @callback DatabaseProcessFn
    * @param {Data} data - data tobe processed
    * @return {Data}
    */


   /**
    * Data to render to a chart
    *<br/> - The first column = X value, cateogrie (), first column of TableChart
    *<br/> - The next columns = Y values,
    * @typedef {Array} ChartData
    */
///////////////////////////////////////////////////////////////////////////////////////////
// End MMTDrop.Chart
///////////////////////////////////////////////////////////////////////////////////////////

}(MMTDrop));

//Set default initial options for MMTDrop
MMTDrop.setOptions({});

if (typeof module !== 'undefined')
   module.exports = MMTDrop.constants;
