/**
 * This module contains the signification of index of data in database
 */
module.exports = {
      /**
       * Constants: MMTDrop defined csv format types
       */
      CsvFormat : {
          DEFAULT_APP_FORMAT      : 0/**< Default application flow report format id */,
          WEB_APP_FORMAT          : 1/**< WEB flow report format id */,
          SSL_APP_FORMAT          : 2/**< SSL flow report format id */,
          RTP_APP_FORMAT          : 3/**< RTP flow report format id */,
          FTP_APP_FORMAT          : 4,
          MICROFLOWS_STATS_FORMAT : 8/**< Micro flows statistics format id */,
          RADIUS_REPORT_FORMAT    : 9/**< RADIUS protocol control format id */,
          NO_SESSION_STATS_FORMAT : 99,
          STATS_FORMAT            : 100/**< Statistics format id */,
          SECURITY_FORMAT         : 10,
          BA_PROFILE_FORMAT       : 12,
          BA_BANDWIDTH_FORMAT     : 11,
          LICENSE                 : 30,
          NDN_FORMAT              : 625,
          DUMMY_FORMAT            : 200,
          SYS_STAT_FORMAT         : 201,
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
          IP_DEST             : 19, /**< Index of the IP address destination column */
          MAC_SRC             : 20, /**< Index of the MAC address source column */
          MAC_DEST            : 21, /**< Index of the MAC address destination column */
          SESSION_ID          : 22, //Identifier of the session or if the protocol does not have session its session id = 0
          PORT_DEST           : 23, //Server port number (0 if transport protocol is session less like ICMP)
          PORT_SRC            : 24, //Client port number (0 if transport protocol is session less like ICMP)
          THREAD_NUMBER       : 25,
          RTT                 : 26,
          RTT_MIN_SERVER      : 27,
          RTT_MIN_CLIENT      : 28,
          RTT_MAX_SERVER      : 29,
          RTT_MAX_CLIENT      : 30,
          RTT_AVG_SERVER      : 31,
          RTT_AVG_CLIENT      : 32,
          DATA_TRANSFER_TIME  : 33, //Time difference between first data packet time and the last packet time received in the sample interval
          RETRANSMISSION_COUNT: 34,


          FORMAT_TYPE         : 35, //0: default, 1: http, 2: tls, 3: rtp, 4: FTP

          SRC_LOCATION            : 40,
          DST_LOCATION            : 41,
          IP_SRC_INIT_CONNECTION  : 42, //true: if IP_SRC (local IP) is init connection, else false ( IP_DEST initilizes connection)
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
          MAC_DEST              : 6 ,
          PARENT_PROTO          : 7 ,
          IP_SRC                : 8 ,
          IP_DEST               : 9 ,
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
          RETRANSMISSION_COUNT        : 10,
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
                  627, 631, 632
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
                  65, 66, 78, 156, 393, 630
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
}