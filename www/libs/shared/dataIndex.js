/**
 * This module contains the signification of index of data in database
 */
module.exports = {
      /**
       * Constants: MMTDrop defined csv format types
       */
      CsvFormat : {
          DEFAULT_APP_FORMAT      : 0  /**< Sub report of SESSION_STATS_FORMAT: Default application flow report format id */,
          WEB_APP_FORMAT          : 1  /**< Sub report of SESSION_STATS_FORMAT: WEB flow report format id */,
          SSL_APP_FORMAT          : 2  /**< Sub report of SESSION_STATS_FORMAT: SSL flow report format id */,
          RTP_APP_FORMAT          : 3  /**< Sub report of SESSION_STATS_FORMAT: RTP flow report format id */,
          FTP_APP_FORMAT          : 4, /**< Sub report of SESSION_STATS_FORMAT: FTP flow report*/
          GTP_APP_FORMAT          : 5, /**< Sub report of SESSION_STATS_FORMAT: For LTE network*/
          
          
          
          STARTUP_REPORT          : 1, /**< This report is sent only once when starting*/
          MICROFLOWS_STATS_FORMAT : 8/**< Micro flows statistics format id */,
          RADIUS_REPORT_FORMAT    : 9/**< RADIUS protocol control format id */,
          
          NO_SESSION_STATS_FORMAT : 99,
          SESSION_STATS_FORMAT    : 100/**< Statistics format id */,
          
          SECURITY_FORMAT         : 10,
          
          BA_PROFILE_FORMAT       : 12,
          BA_BANDWIDTH_FORMAT     : 11,
          
          LICENSE                 : 30,
          
          NDN_FORMAT              : 625,
          DUMMY_FORMAT            : 200,
          SYS_STAT_FORMAT         : 201,
          LTE_TOPOLOGY_REPORT     : 400,/**< LTE toplogy*/
          LTE_QOS_REPORT          : 401,
          EVENT_BASE_FORMAT       : 1000,
          OTT_QOS                 : 70
      },
      /* IMPORTANCE: This is maximum number where any column index must not be greater than
       * For example, currently, the maximum number is 98 holding by FtpStatsColumnId.RESPONSE_TIME
       * When adding a new index, if this one is greater than the MAX_COL_INDEX, we must set value of
       * MAX_COL_INDEX to this one.
       */
      MAX_COL_INDEX: 98,
      /**
       * Constants: MMTDrop defined csv format types
       */
      StatsColumnId           : {
          FORMAT_ID           : 0, /**< Index of the format id column */
          PROBE_ID            : 1, /**< Index of the probe id column */
          SOURCE_ID           : 2, /**< Index of the data source id column */
          TIMESTAMP           : 3, /**< Index of the format id column */
          REPORT_NUMBER       : 4,
          APP_ID              : 5, /**< Index of the application id column */
          
          /* An application might have different statistics entries.
             * Example: Facebook might have two entries one with path eth.ip.tcp.http.fb
             * while the second with path eth.ip.tcp.ssl.fb.
             * This is completely normal.
             * It allows to build a hierarchical view on the protocol statistics.
             */
          APP_PATH            : 6, /**< Index of the application path column */
          ACTIVE_FLOWS        : 7, /**< Index of the active flows column */
          DATA_VOLUME         : 8, /**< Index of the data volume column */
          PAYLOAD_VOLUME      : 9, /**< Index of the payload data volume column */
          PACKET_COUNT        : 10, /**< Index of the packet count column */
          UL_DATA_VOLUME      : 11, /**< Index of the data volume column */
          UL_PAYLOAD_VOLUME   : 12, /**< Index of the payload data volume column */
          UL_PACKET_COUNT     : 13, /**< Index of the packet count column */
          DL_DATA_VOLUME      : 14, /**< Index of the data volume column */
          DL_PAYLOAD_VOLUME   : 15, /**< Index of the payload data volume column */
          DL_PACKET_COUNT     : 16, /**< Index of the packet count column */
          START_TIME          : 17, /**< Index of the start timestamp of the flow */
          IP_SRC              : 18, /**< Index of the IP address source column */
          IP_DST              : 19, /**< Index of the IP address destination column */
          MAC_SRC             : 20, /**< Index of the MAC address source column */
          MAC_DST             : 21, /**< Index of the MAC address destination column */
          SESSION_ID          : 22, /**< Identifier of the session or if the protocol does not have session its session id = 0*/
          PORT_DST            : 23, /**< Server port number (0 if transport protocol is session less like ICMP)*/
          PORT_SRC            : 24, /**< Client port number (0 if transport protocol is session less like ICMP) */
          THREAD_NUMBER       : 25,
          
          HANDSHAKE_TIME      : 26,
          APP_RESPONSE_TIME   : 27,
          DATA_TRANSFER_TIME  : 28,
          
          RTT_MIN_SERVER      : 29,
          RTT_MIN_CLIENT      : 30,
          RTT_MAX_SERVER      : 31,
          RTT_MAX_CLIENT      : 32,
          RTT_AVG_SERVER      : 33,
          RTT_AVG_CLIENT      : 34,
          
          UL_RETRANSMISSION   : 35, /**< */
          DL_RETRANSMISSION   : 36,

          FORMAT_TYPE         : 37, //0: default, 1: http, 2: tls, 3: rtp, 4: FTP

          
          SRC_LOCATION            : 40,
          DST_LOCATION            : 41,
          IP_SRC_INIT_CONNECTION  : 42, //true: if IP_SRC (local IP) is init connection, else false ( IP_DST initilizes connection)
          PROFILE_ID              : 43, // profile id
          ORG_APP_ID              : 44, //original APP_ID given by probe
          ORG_TIMESTAMP           : 45, //original TIMESTAMP given by probe

          CPU_USAGE       : 95, //in %
          MEM_USAGE       : 96, //in %
          P_DROP          : 97, //in %
          P_DROP_NIC      : 98, //in %
          P_DROP_KERNEL   : 99, //in %
      },

      SecurityColumnId           : {
          FORMAT_ID               : 0, /**< Index of the format id column */
          PROBE_ID                : 1, /**< Index of the probe id column */
          SOURCE_ID               : 2, /**< Index of the data source id column */
          TIMESTAMP               : 3, /**< Index of the format id column */
          PROPERTY                : 4, /**< Index of the application id column */
          VERDICT                 : 5,
          TYPE                    : 6,
          DESCRIPTION             : 7,
          HISTORY                 : 8,
          VERDICT_COUNT           : 9
      },
      BehaviourBandwidthColumnId           : {
          FORMAT_ID               : 0, /**< Index of the format id column */
          PROBE_ID                : 1, /**< Index of the probe id column */
          SOURCE_ID               : 2, /**< Index of the data source id column */
          TIMESTAMP               : 3, /**< Index of the format id column */
          PROPERTY                : 4, /**< Index of the application id column */
          IP                      : 5,
          APP                     : 6,
          BW_BEFORE               : 7,
          BW_AFTER                : 8,
          VERDICT                 : 9,
          DESCRIPTION             : 10
      },
      BehaviourProfileColumnId           : {
          FORMAT_ID               : 0, /**< Index of the format id column */
          PROBE_ID                : 1, /**< Index of the probe id column */
          SOURCE_ID               : 2, /**< Index of the data source id column */
          TIMESTAMP               : 3, /**< Index of the format id column */
          PROPERTY                : 4, /**< Index of the application id column */
          IP                      : 5,
          PROFILE_BEFORE          : 6,
          PROFILE_AFTER           : 7,
          BW_BEFORE               : 8,
          BW_AFTER                : 9,
          VERDICT                 : 10,
          DESCRIPTION             : 11
      },
      
      LTEQoSColumnId             : {
         FORMAT_ID               : 0, /**< Index of the format id column */
         PROBE_ID                : 1, /**< Index of the probe id column */
         SOURCE_ID               : 2, /**< Index of the data source id column */
         TIMESTAMP               : 3, /**< Index of the format id column */
         UE_ID                   : 4, /**< Index of the application id column */
         TEID                    : 5,
         QCI                     : 6
     },


      HttpStatsColumnId : {
          APP_FAMILY         : 50,
          CONTENT_CLASS      : 51,
          RESPONSE_TIME      : 52, /**< Index of the response time column */
          TRANSACTIONS_COUNT : 53, /**< Index of the HTTP transactions count (req/res number) per TCP session */
          INTERACTION_TIME   : 54, /**< Index of the interaction time (between client and server) column */
          HOSTNAME           : 55, /**< Index of the hostname column */
          MIME_TYPE          : 56, /**< Index of the MIME type column */
          REFERER            : 57, /**< Index of the Referer column */
          CDN_FLAG           : 58, /**< Index of the is CDN delivered column */
          URI                : 59,
          METHOD             : 60,
          RESPONSE           : 61,
          CONTENT_LENGTH     : 62,
          REQUEST_INDICATOR  : 63, //It indicates that a particular request is finished with a response( 1: yes, 0: no)
      },

      TlsStatsColumnId : {
        APP_FAMILY    : 70,
        CONTENT_CLASS : 71,
        SERVER_NAME   : 72, /**< Index of the format id column */
        CDN_FLAG      : 73, /**< Index of the format id column */
      },

      RtpStatsColumnId : {
        APP_FAMILY             : 80,
        CONTENT_CLASS          : 81,
        PACKET_LOSS_RATE       : 82, /**< Index of the format id column */
        PACKET_LOSS_BURSTINESS : 83, /**< Index of the format id column */
        MAX_JITTER             : 84,
        ORDER_ERROR            : 85
      },

      FtpStatsColumnId : {
          APP_FAMILY        : 90,
          CONNNECTION_TYPE  : 91,
          USERNAME          : 92,
          PASSWORD          : 93,
          FILE_SIZE         : 94,
          FILE_NAME         : 95,
          DIRECTION         : 96, // direction of the flow
          CONTROL_SESSION_ID: 97, // control session session_id of the corresponding data section
          RESPONSE_TIME     : 98, // Response time of the file transfer only
      },
      
      GtpStatsColumnId: {
         APP_FAMILY    : 110,
         CONTENT_CLASS : 111,
         IP_SRC        : 112, //IP of eNodeB
         IP_DST        : 113, //IP of GW
         TEIDs         : 114, //Array of TEIDs
         IMSI          : 115, //IMSI of UE generating this GTP flow
         ENB_NAME      : 116,
         MME_NAME      : 117,
         EXPECTED_DELAY_UL: 119,  //expected delay getting from qci 
         EXPECTED_PELR_UL : 120,  //expected packet-error-lost-rate
         EXPECTED_DELAY_DL: 121,  //expected delay getting from qci 
         EXPECTED_PELR_DL : 122,  //expected packet-error-lost-rate
      },
      StartupColumnId           : {
         FORMAT_ID       : 0, /**< Index of the format id column */
         PROBE_ID        : 1, /**< Index of the probe id column */
         SOURCE_ID       : 2, /**< Index of the data source id column */
         TIMESTAMP       : 3, /**< Index of the timestamp column when probe is starting up */
         VERSION_PROBE   : 4, /**< Current version of MMT-Probe*/
         VERSION_DPI     : 5, /**< Current version of MMT-DPI*/
         VERSION_SECURITY: 6  /**< Current version of MMT-Security if it is enable, otherwise this field is null*/
     },
     
       LicenseColumnId           : {
          FORMAT_ID       : 0, /**< Index of the format id column */
          PROBE_ID        : 1, /**< Index of the probe id column */
          SOURCE_ID       : 2, /**< Index of the data source id column */
          TIMESTAMP       : 3, /**< Index of the format id column */
          LICENSE_INFO_ID : 4, /**< Index of the application id column */
          NUMBER_OF_MAC   : 5,
          MAC_ADDRESSES   : 6,
          EXPIRY_DATE     : 7,
          VERSION_PROBE   : 8,
          VERSION_SDK     : 9,
      },
      
      NdnColumnId                  : {
          /** Index of the format id column */
          FORMAT_ID             : 0 ,
          PROBE_ID              : 1 ,
          SOURCE_ID             : 2 ,
          TIMESTAMP             : 3 ,
          PACKET_ID             : 4 ,
          MAC_SRC               : 5 ,
          MAC_DST               : 6 ,
          PARENT_PROTO          : 7 ,
          IP_SRC                : 8 ,
          IP_DST                : 9 ,
          QUERY                 : 10,
          NAME                  : 11,
          PACKET_TYPE           : 12,
          CAP_LEN               : 13,
          NDN_DATA              : 14,
          INTEREST_NONCE        : 15,
          INTEREST_LIFETIME     : 16,
          DATA_FRESHNESS_PERIOD : 17,
          IFA                   : 18,
      },
      OTTQoSColumnId: {
          FORMAT_ID                   : 0,
          PROBE_ID                    : 1,
          SOURCE_ID                   : 2,
          TIMESTAMP                   : 3,
          VIDEO_URI                   : 4,
          VIDEO_QUALITY               : 5,
          NETWORK_BITRATE             : 6,
          VIDEO_BITRATE               : 7,
          TOTAL_VIDEO_DURATION        : 8,
          TOTAL_VIDEO_DOWNLOAD        : 9,
          DL_RETRANSMISSION           : 10,
          OUT_OF_ORDER                : 11,
          PROBABILITY_BUFFERING       : 12
      },
      StatColumnId:{
        FORMAT_ID: 0,
        PROBE_ID : 1,
        SOURCE_ID: 2,
        TIMESTAMP: 3,
        CPU_USER : 4,
        CPU_SYS  : 5,
        CPU_IDLE : 6,
        MEM_AVAIL: 7,
        MEM_TOTAL: 8,
        COUNT    : 9
      },
      EventBaseStatColumnId: {
         FORMAT_ID: 0,
         PROBE_ID : 1,
         SOURCE_ID: 2,
         TIMESTAMP: 3,
         EVENT_NAME: 4,
      },
      LteTopoStatColumnId: {
         FORMAT_ID    : 0,
         PROBE_ID     : 1,
         SOURCE_ID    : 2,
         TIMESTAMP    : 3,
         ELEMENT_ID   : 4,
         EVENT        : 5,
         PARENT_ID    : 6, /**< incase of remove link*/
         IP           : 6,
         ELEMENT_TYPE : 7,
         NAME         : 8,
         UE_IMSI      : 8, /**< incase of UE*/
         UE_M_TMSI    : 9,
      },
      IoTColumnId: {
         FORMAT_ID: 0,
         PROBE_ID : 1,
         SOURCE_ID: 2,
         TIMESTAMP: 3,
         EVENT_NAME: 4,
         SEQ_NUM  : 5,
         SRC      : 6,
         DST      : 7,
         DATA_VOLUME: 8,
       },
      /**
       * A table of Category-Id: Application-Id[]
       */
      CategoriesAppIdsMap : {
          // web
          1 : [
                  2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 14, 18, 19, 20, 21, 22, 23,
                  25, 26, 27, 31, 32, 33, 34, 35, 36, 38, 39, 40, 44, 45, 46, 49,
                  50, 51, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 64, 67, 68, 69,
                  70, 71, 72, 73, 74, 76, 80, 83, 87, 88, 89, 91, 94, 95, 98,
                  100, 101, 102, 106, 110, 111, 112, 114, 115, 116, 121, 122,
                  123, 124, 125, 126, 127, 130, 131, 132, 133, 134, 135, 139,
                  143, 145, 146, 147, 148, 150, 151, 153, 154, 155, 157, 158,
                  159, 165, 168, 171, 174, 175, 176, 184, 187, 189, 193, 200,
                  201, 203, 204, 206, 207, 208, 209, 210, 211, 212, 217, 222,
                  223, 226, 230, 234, 235, 238, 239, 240, 244, 245, 246, 248,
                  249, 250, 252, 253, 256, 258, 261, 262, 264, 267, 268, 269,
                  274, 275, 282, 283, 286, 287, 289, 292, 293, 294, 295, 300,
                  301, 302, 303, 305, 306, 307, 309, 313, 315, 316, 318, 319,
                  320, 321, 326, 327, 328, 329, 331, 333, 334, 335, 336, 338,
                  342, 343, 346, 348, 350, 351, 352, 353, 359, 360, 362, 363,
                  364, 367, 368, 369, 370, 375, 378, 379, 380, 383, 386, 387,
                  389, 390, 391, 392, 394, 395, 396, 398, 399, 400, 401, 402,
                  403, 404, 406, 408, 412, 415, 416, 417, 418, 419, 420, 421,
                  423, 424, 425, 426, 428, 430, 431, 550, 551, 552, 553, 554,
                  555, 556, 557, 558, 559, 560, 561, 562, 563, 564, 565, 566,
                  567, 568, 580, 583, 597, 598, 606, 623
          ],
          // P2P
          2 : [
                  17, 28, 52, 84, 92, 105, 109, 129, 172, 190, 215, 257, 263,
                  332, 344, 361, 365, 405
          ],
          // Gaming
          3 : [
                  8, 24, 29, 42, 43, 47, 63, 75, 86, 96, 108, 113, 119, 120, 136,
                  144, 149, 167, 192, 194, 199, 216, 224, 225, 227, 266, 270,
                  271, 285, 296, 297, 308, 345, 374, 407, 409, 410, 411, 413,
                  432, 617, 618, 619, 620, 621
          ],
          // Streaming
          4 : [
                  77, 107, 138, 161, 185, 195, 197, 228, 229, 231, 242, 254, 255,
                  277, 280, 284, 291, 298, 299, 311, 312, 330, 337, 371, 372,
                  381, 382, 385, 427, 429, 570, 571, 572, 573, 574, 575, 576,
                  577, 578, 579, 581, 582, 584, 585, 586, 587, 588, 589, 592,
                  627, 631, 632, 661,
                  
          ],
          // conversational
          5 : [
                  16, 37, 104, 118, 140, 160, 173, 183, 186, 188, 220, 221, 232,
                  259, 314, 317, 366, 384, 397, 594, 595, 596, 600, 622
          ],
          // Mail
          6 : [
                  128, 152, 169, 170, 205, 213, 272, 273, 323, 324, 422
          ],
          // FileTransfer
          7 : [
                  117, 247, 322, 358
          ],
          // CloudStorage
          8 : [
                  90, 162, 590, 591
          ],
          // Network
          9 : [
                  79, 219, 569
          ],
          // Network
          10 : [
                  0, 7, 15, 30, 41, 48, 81, 82, 85, 93, 97, 99, 163, 164, 166,
                  178, 180, 181, 182, 191, 198, 214, 218, 241, 243, 251, 260,
                  288, 304, 310, 325, 339, 341, 347, 349, 354, 376, 377, 433,
                  434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445,
                  446, 447, 448, 449, 450, 451, 452, 453, 454, 455, 456, 457,
                  458, 459, 460, 462, 463, 464, 465, 466, 467, 468, 469, 470,
                  471, 472, 473, 474, 475, 476, 477, 478, 479, 480, 482, 483,
                  484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 495,
                  497, 498, 499, 500, 501, 502, 503, 504, 505, 506, 507, 508,
                  509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520,
                  521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 531, 532,
                  533, 534, 535, 536, 537, 538, 539, 540, 541, 542, 543, 544,
                  545, 546, 547, 548, 549, //],
                  //Tunlelling
                  137, 141, 142, 179, 196, 278, 279, 281, 461, 481, 496,//],
                  //Remote
                  265, 290, 340, 356, 357, 388, 414,
                  //Misc
                  65, 66, 78, 156, 393, 630,
                  //sctp
                  645,646,647,648,649,650,651,652,653,654,655,658,659,660,
                  800,801,
                  //s1ap
                  900
          ],

          //Database
          12 : [
                  233, 237, 276, 355, 628, 629
          ],
          //CDN
          15 : [
                  593, 599, 601, 602, 603, 604, 605, 607, 608, 609, 610, 611,
                  612, 613, 614, 615, 616, 625, 626
          ],
          //SocialNetwork
          16 : [
                  103, 373, 177, 202, 236
          ]
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

    //list of protocols (not application)
    //this list is used to filter out applications.
    //collections "data_protocol_*" store only protocols
      PureProtocols : [
          //0, //unknown
          30,81,82,85,99,
          117,141,153,154,155,163,164,166,169,170,178,179,180,181,182,183,196,198,
          228,231,241,247,272,273,298,299,
          304,314,322,323,324,325,339,340,341,354,357,358,363,376,388,
          461,
          625,626,627,628,
          //sctp chunks
          631,632,645,646,647,648,649,650,651,652,653,654,655,658,659,660,661,
          //s1ap
          900
      ]
      
}