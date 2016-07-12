var ipLib   = require("ip");
var config  = require("../config.json");
var maxmind = require('maxmind');
var path    = require("path");
var ipToCountry = maxmind.open( path.join(__dirname, "..", "data", 'GeoLite2-Country.mmdb'), {
    cache: {
        max: 1000, // max items in cache
        maxAge: 1000 * 60 * 60 // life time in milliseconds
    }
});

ipToCountry._get = function( ip ){
  var loc = ipToCountry.get( ip );
  if (loc){
    return (loc['country'])? loc['country']['names']['en'] : loc['continent']['names']['en'];
  }else if(MMTDrop.isLocalIP( ip )){
    return "_local"
  }else{
    return "_unknown";
  }
}
/** Class: MMTDrop
 *  An object container for all MMTDrop library functions.
 *
 *  This class is just a container for all the objects and constants
 *  used in the library.  It is not meant to be instantiated, but to
 *  provide a namespace for library objects, constants, and functions.
 */

var MMTDrop = {

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
        OTT_QOS                 : 70
    },

    /**
     * Constants: MMTDrop defined csv format types
     */
    StatsColumnId           : {
        FORMAT_ID           : 0, /**< Index of the format id column */
        PROBE_ID            : 1, /**< Index of the probe id column */
        SOURCE_ID           : 2, /**< Index of the data source id column */
        TIMESTAMP           : 3, /**< Index of the format id column */
        APP_ID              : 4, /**< Index of the application id column */
        APP_PATH            : 5, /**< Index of the application path column */
        ACTIVE_FLOWS        : 6, /**< Index of the active flows column */
        DATA_VOLUME         : 7, /**< Index of the data volume column */
        PAYLOAD_VOLUME      : 8, /**< Index of the payload data volume column */
        PACKET_COUNT        : 9, /**< Index of the packet count column */
        UL_DATA_VOLUME      : 10, /**< Index of the data volume column */
        UL_PAYLOAD_VOLUME   : 11, /**< Index of the payload data volume column */
        UL_PACKET_COUNT     : 12, /**< Index of the packet count column */
        DL_DATA_VOLUME      : 13, /**< Index of the data volume column */
        DL_PAYLOAD_VOLUME   : 14, /**< Index of the payload data volume column */
        DL_PACKET_COUNT     : 15, /**< Index of the packet count column */
        START_TIME          : 16, /**< Index of the start timestamp of the flow */
        IP_SRC              : 17, /**< Index of the IP address source column */
        IP_DEST             : 18, /**< Index of the IP address destination column */
        MAC_SRC             : 19, /**< Index of the MAC address source column */
        MAC_DEST            : 20, /**< Index of the MAC address destination column */
        SESSION_ID          : 21, //Identifier of the session or if the protocol does not have session its session id = 0
        PORT_DEST           : 22, //Server port number (0 if transport protocol is session less like ICMP)
        PORT_SRC            : 23, //Client port number (0 if transport protocol is session less like ICMP)
        THREAD_NUMBER       : 24,
        RTT                 : 25,
        RTT_MIN_SERVER      : 26,
        RTT_MIN_CLIENT      : 27,
        RTT_MAX_SERVER      : 28,
        RTT_MAX_CLIENT      : 29,
        RTT_AVG_SERVER      : 30,
        RTT_AVG_CLIENT      : 31,
        RETRANSMISSION_COUNT: 32,
        REPORT_NUMBER       : 33,

        FORMAT_TYPE         : 34, //0: default, 1: http, 2: tls, 3: rtp, 4: FTP
        SRC_LOCATION        : 35,
        DST_LOCATION        : 36,
        IP_SRC_INIT_CONNECTION  : 37, //true: if IP_SRC (local IP) is init connection, else false ( IP_DEST initilizes connection)
        PROFILE_ID          : 38, //original app_id given by mmt-probe
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
        TRANSACTIONS_COUNT : 53, /**< Index of the HTTP transactions count (req/res number) column */
        INTERACTION_TIME   : 54, /**< Index of the interaction time (between client and server) column */
        HOSTNAME           : 55, /**< Index of the hostname column */
        MIME_TYPE          : 56, /**< Index of the MIME type column */
        REFERER            : 57, /**< Index of the Referer column */
        CDN_FLAG           : 58, /**< Index of the is CDN delivered column */
        URI                : 59,
        METHOD             : 60,
        RESPONSE           : 61,
        CONTENT_LENGTH     : 62,
        FRAGMENTATION      : 63,
        REQUEST_ID         : 64
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
			SESSION_ID            : 4 ,
      MAC_SRC               : 5 ,
      MAC_DEST              : 6 ,
      NAME                  : 7 ,
      IS_OVER_TCP           : 8 ,
      IP_SRC                : 9 ,
      IP_DEST               : 10 ,
      PORT_SRC              : 11 ,
      PORT_DEST             : 12 ,
      NB_INTEREST_PACKET    : 13 ,
      INTEREST_LIFETIME     : 14 ,
      DATA_VOLUME_INTEREST  : 15 ,
			NDN_VOLUME_INTEREST   : 16 ,
      NB_DATA_PACKET        : 17 ,
      DATA_FRESHNESS_PERIOD : 18 ,
      DATA_VOLUME_DATA      : 19 ,
			NDN_VOLUME_DATA       : 20 ,
      NDN_MAX_RESPONSED_TIME   : 21,
			NDN_MIN_RESPONSED_TIME   : 22,
			NDN_AVR_RESPONSED_TIME   : 23,
			IFA 										 : 24,
		},
    OTTQoSColumnId: {
      FORMAT_ID                   : 0  ,
			PROBE_ID                    : 1  ,
			SOURCE_ID                   : 2  ,
			TIMESTAMP                   : 3  ,
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
    /**
     * A table of Category-Id: Application-Id[]
     */
    CategoriesAppIdsMap: {
      1: [2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 14, 18, 19, 20, 21, 22, 23, 25, 26, 27, 31, 32, 33, 34, 35, 36, 38, 39, 40, 44, 45, 46, 49, 50, 51, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 64, 67, 68, 69, 70, 71, 72, 73, 74, 76, 80, 83, 87, 88, 89, 91, 94, 95, 98, 100, 101, 102, 106, 110, 111, 112, 114, 115, 116, 121, 122, 123, 124, 125, 126, 127, 130, 131, 132, 133, 134, 135, 139, 143, 145, 146, 147, 148, 150, 151, 153, 154, 155, 157, 158, 159, 165, 168, 171, 174, 175, 176, 184, 187, 189, 193, 200, 201, 203, 204, 206, 207, 208, 209, 210, 211, 212, 217, 222, 223, 226, 230, 234, 235, 238, 239, 240, 244, 245, 246, 248, 249, 250, 252, 253, 256, 258, 261, 262, 264, 267, 268, 269, 274, 275, 282, 283, 286, 287, 289, 292, 293, 294, 295, 300, 301, 302, 303, 305, 306, 307, 309, 313, 315, 316, 318, 319, 320, 321, 326, 327, 328, 329, 331, 333, 334, 335, 336, 338, 342, 343, 346, 348, 350, 351, 352, 353, 359, 360, 362, 364, 367, 368, 369, 370, 375, 378, 379, 380, 383, 386, 387, 389, 390, 391, 392, 394, 395, 396, 398, 399, 400, 401, 402, 403, 404, 406, 408, 412, 415, 416, 417, 418, 419, 420, 423, 424, 425, 426, 428, 430, 431, 550, 551, 552, 553, 554, 555, 556, 557, 558, 559, 560, 561, 562, 563, 564, 565, 566, 567, 568, 580, 583, 597, 598, 623],
      2: [17, 28, 52, 84, 92, 105, 109, 129, 172, 190, 215, 257, 263, 332, 344, 361, 365, 405],
      3: [8, 24, 29, 42, 43, 47, 63, 75, 86, 96, 108, 113, 119, 120, 144, 149, 167, 192, 194, 199, 216, 224, 225, 227, 266, 270, 271, 285, 296, 297, 308, 345, 374, 407, 409, 410, 411, 413, 421, 432, 617, 618, 619, 620, 621],
      4: [77, 107, 138, 161, 185, 195, 197, 228, 229, 231, 242, 254, 255, 277, 280, 284, 291, 298, 299, 311, 312, 330, 337, 371, 372, 381, 382, 385, 427, 429, 570, 571, 572, 573, 574, 575, 576, 577, 578, 579, 581, 582, 584, 585, 586, 587, 588, 589, 592],
      5: [16, 37, 104, 118, 136, 140, 160, 173, 183, 186, 188, 220, 221, 232, 259, 314, 317, 366, 384, 397, 594, 595, 596, 600, 622],
      6: [128, 152, 169, 170, 205, 213, 272, 273, 323, 324, 422],
      7: [117, 247, 322, 358],
      8: [90, 162, 590, 591],
      9: [79, 219, 569],
      10: [7, 15, 30, 41, 48, 81, 82, 85, 93, 97, 99, 163, 164, 166, 178, 180, 181, 182, 191, 198, 214, 218, 241, 243, 251, 260, 288, 304, 310, 325, 339, 341, 347, 349, 354, 363, 376, 377, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479, 480, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 495, 497, 498, 499, 500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 531, 532, 533, 534, 535, 536, 537, 538, 539, 540, 541, 542, 543, 544, 545, 546, 547, 548, 549, //],
               //Tunlelling
    /*11: [*/
               137, 141, 142, 179, 196, 278, 279, 281, 461, 481, 496,//],
               //Remote
          //13: [
               265, 290, 340, 356, 357, 388, 414,
              //],
          //Misc
    //14: [
              65, 66, 78, 156, 393],

      12: [233, 237, 276, 355],
      15: [593, 599, 601, 602, 603, 604, 605, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615, 616, 625],
            16: [103, 373, 177, 202, 236]
    },
    /**
     * Get Category ID of an application
     * @param {number} appId - application Id
     * @returns {number} - category Id
     */
    getCategoryIdFromAppId : function( appId ){
      //cache last found
      if( this._cacheCategoryIdFromAppId == undefined )
        this._cacheCategoryIdFromAppId = {};
      if( this._cacheCategoryIdFromAppId[ appId] != undefined )
        return this._cacheCategoryIdFromAppId[ appId ];

      appId = parseInt( appId );

      for (var i in MMTDrop.CategoriesAppIdsMap){
        var arr = MMTDrop.CategoriesAppIdsMap[i];
        if (arr.indexOf( appId ) > -1)
          return this._cacheCategoryIdFromAppId[ appId ] = parseInt( i );
      }
      return -1;
    },
    /**
     * Return the parent of the given protocol path. <br>
     * ("1.2" is the parent of "1.2.3"; "." is the parent of "1")
     * @param path application protocol path
     */
    getParentPath : function(path) {
        var n = path.lastIndexOf(".");
        if (n == -1) {
            return ".";
        } else {
            var p = path.substring(0, n);
            return p;
        }
    },

    /**
     * Return the child of the given protocol path. <br>
     * ("2.3" is the child of "1.2.3"; "." is the child of "1")
     * @param path application protocol path
     */
    getChildPath : function(path) {
        var n = path.indexOf(".");
        if (n == -1) {
            return ".";
        } else {
            var child = path.substring(n + 1, path.toString().length);
            return child;
        }
    },

    /**
     * Returns the root application id given the application path.
     * @param {Object} path application protocol path
     */
    getRootAppId : function(path) {
        var n = path.toString().indexOf(".");
        if (n == -1) {
            return path;
        } else {
            return path.toString().substring(0, n);
        }
    },

    getAppLevelFromPath : function( path ){
        var count = 0;
        for( var j=0; j<path.length; j++){
            if( path[ j ] === '.') count ++;
        }
        return count;
    },

    /**
     * Return the path friendly name. <br>
     * @param path application protocol path (given by application IDs)
     */
    getPathFriendlyName : function(path) {
        var root = MMTDrop.getRootAppId(path);
        var friendlyName = MMTDrop.ProtocolsIDName[root];
        var child = MMTDrop.getChildPath(path);
        while(root != path && child != "." && root != "" && root != ".") {
            root = MMTDrop.getRootAppId(child);
            child = MMTDrop.getChildPath(child);
            friendlyName = friendlyName + '.' + MMTDrop.ProtocolsIDName[root];
        }
        return friendlyName;
    },

    /**
     * Returns the application id given the application path.
     * @param {Object} path application protocol path
     */
    getAppIdFromPath : function(path) {
        var n = path.lastIndexOf(".");
        return parseInt( path.substring(n + 1, path.length) );
    },

    /**
     * Returns the application name given the application path.
     * @param {Object} path application protocol path
     */
    getAppName : function(path) {
        var n = path.toString().lastIndexOf(".");
        return MMTDrop.ProtocolsIDName[path.toString().substring(n + 1, path.toString().length)];
    },

    /**
     * Returns the parent application name given the application path. <br>
     * If the application parent does not exist (path equal to root application), -1 is returned.
     * @param {Object} path
     */
    getParentApp : function(path) {
        var parent = this.getParentPath(path);
        if (parent == ".")
            return -1;
        return this.getAppId(parent);
    },

    /**
     * Returns the protocol path from the given statistics report entry
     * @param {Object} entry statistics report entry
     */
    getEntryPath : function(entry) {
        return entry[MMTDrop.StatsColumnId.APP_PATH];
    },

    /**
     * Maps the Protocol ID to a Protocol Name
     * @param {number} id
     * @returns {string} Protocol Name
     */
    getProtocolNameFromID : function(id) {
        var protocolName;
        protocolName = ( id in MMTDrop.ProtocolsIDName) ? MMTDrop.ProtocolsIDName[id] : 'NaP';
        return protocolName;
    },

    /**
     * Maps the Protocol Name to a Protocol ID
     * @param {string} protocolName
     * @returns {number} id
     */
    getProtocolIDFromName : function(protocolName) {
        var protocolID;
        protocolID = ( protocolName in MMTDrop.ProtocolsNameID) ? MMTDrop.ProtocolsNameID[protocolName] : 'NaP';
        return protocolID;
    },

    /**
     * Returns the first element that was inserted in the given array
     */
    get1stElem : function(data) {
        for (var prop in data)
            if (data.propertyIsEnumerable(prop))
                return prop;
    },

    setDirectionStatFlowByIP: function( msg ){
        if( config.local_network == null )
            return msg;

        var COL       = this.StatsColumnId;
        if( msg[ COL.FORMAT_ID ] != this.CsvFormat.STATS_FORMAT )
            return msg;

        msg[ COL.IP_SRC_INIT_CONNECTION ] = true;

        if ( this.isLocalIP( msg[COL.IP_DEST] ) ){
          msg[ COL.IP_SRC_INIT_CONNECTION ] = false;
          return this.inverseStatDirection( msg )
        }
        return msg;
    },

    /**
     * check whether an IP is in the list of local ips networks
     * @param  {[type]} ip [description]
     * @return {[boolean]}
     */
    isLocalIP : function( ip ){
        if( ip == undefined || ip === "undefined" || ip === "null")
            return false;
        if( this._localCacheIPs == undefined )
          this._localCacheIPs = {};

        //check in the cache
        if( this._localCacheIPs[ ip ] !== undefined )
          return this._localCacheIPs[ ip ];

        if( this._localIPs === undefined ){
            var rootsIP = [];
            for( var i in config.local_network ){
                var lo   = config.local_network[i];
                var root = ipLib.mask(lo.ip, lo.mask);

                rootsIP.push(  {root: root, mask: lo.mask } );
            }
            this._localIPs = rootsIP;
        }

        for( var i in this._localIPs ){
            var lo = this._localIPs[ i ];
            if( ipLib.mask( ip, lo.mask ) == lo.root ){
              this._localCacheIPs[ ip ] = true;
              return true;
            }
        }
        this._localCacheIPs[ ip ] = false;
        return false;
    },

    inverseStatDirection: function( msg ){
        var swap = function( id_1, id_2){
            var tmp   = msg[id_1];
            msg[id_1] = msg[id_2];
            msg[id_2] = tmp;
        };
        var COL       = this.StatsColumnId;
        swap( COL.IP_SRC  ,  COL.IP_DEST );
        swap( COL.MAC_SRC ,  COL.MAC_DEST );
        swap( COL.PORT_SRC,  COL.PORT_DEST );
        swap( COL.UL_DATA_VOLUME ,   COL.DL_DATA_VOLUME );
        swap( COL.UL_PACKET_COUNT,   COL.DL_PACKET_COUNT );
        swap( COL.UL_PAYLOAD_VOLUME, COL.DL_PAYLOAD_VOLUME);
        swap( COL.SRC_LOCATION,      COL.DST_LOCATION );

        return msg;
    },

    //this contains a list of protocols (not applications, for example: GOOGLE, HOTMAIL, ...)
    PureProtocol :  [
        30,81,82,85,99,117,153,154,155,163,164,166,169,170,178,179,180,181,182,183,196,198,228,
        231,241,247,272,273,298,299,314,322,323,324,325,339,340,341,354,357,358,363,376,388,461,625,
        626,627,628,629,630,631,632,633,634,635,636,637,638,639,640,641,642,643,644,645,646,647,648,649,650,651,652,653,654,655,656,657,658,659,660,661,662,663,664,665,666,667,668,669,670,671,672,673,674,675,676,677,678,679,680,681,682,683,684,685,686,687,688,689,690,691,692,693,694,695,696,697,698,699,700,701,702,703,704,705,706,707,708,709,710,711,712,713,714,715,716,717,718,719,720,721,722,723,724,725,726,727,728,729,730,731,732,733,734,735,736,737,738,739,740,741,742,743,744,745,746,747,748,749,750,751,752,753,754,755,756,757,758,759,760,761,762,763,764,765,766,767,768,769,770,771,772,773,774,775,776,777,778,779,780,781,782,783,784,785,786,787,788,789,790,791,792,793,794,795,796,797,798,799,800,801,802,803,804,805,806,807,808,809,810,811,812,813,814,815,816,817,818,819,820,821,822,823,824,825,826,827,828,829,830,831,832,833,834,835,836,837,838,839,840,841,842,843,844,845,846,847,848,849,850,851,852,853,854,855,856,857,858,859,860,861,862,863,864,865,866,867,868,869,870,871,872,873,874,875,876,877,878,879,880,881,882,883,884,885,886,887,888,889,890,891,892,893,894,895,896,897,898,899,900,901,902,903,904,905,906,907,908,909,910,911,912,913,914,915,916,917,918,919,920,921,922,923,924,925,926,927,928,929,930,931,932,933,934,935,936,937,938,939,940,941,942,943,944,945,946,947,948,949,950,951,952,953,954,955,956,957,958,959,960,961,962,963,964,965,966,967,968,969,970,971,972,973,974,975,976,977,978,979,980,981,982,983,984,985,986,987,988,989,990,991,992,993,994,995,996,997,998,999,1000,1001,1002,1003,1004,1005,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1016,1017,1018,1019,1020,1021,1022,1023,1024,1025,1026,1027,1028,1029,1030,1031,1032,1033,1034,1035,1036,1037,1038,1039,1040,1041,1042,1043,1044,1045,1046,1047,1048,1049,1050,1051,1052,1053,1054,1055,1056,1057,1058,1059,1060,1061,1062,1063,1064,1065,1066,1067,1068,1069,1070,1071,1072,1073,1074,1075,1076,1077,1078,1079,1080,1081,1082,1083,1084,1085,1086,1087,1088,1089,1090,1091,1092,1093,1094,1095,1096,1097,1098,1099,1100,1101,1102,1103,1104,1105,1106,1107,1108,1109,1110,1111,1112,1113,1114,1115,1116,1117,1118,1119,1120,1121,1122,1123,1124,1125,1126,1127,1128,1129,1130,1131,1132,1133,1134,1135,1136,1137,1138,1139,1140,1141,1142,1143,1144,1145,1146,1147,1148,1149,1150,1151,1152,1153,1154,1155,1156,1157,1158,1159,1160,1161,1162,1163,1164,1165,1166,1167,1168,1169,1170,1171,1172,1173,1174,1175,1176,1177,1178,1179,1180,1181,1182,1183,1184,1185,1186,1187,1188,1189,1190,1191,1192,1193,1194,1195,1196,1197,1198,1199,1200,1201,1202,1203,1204,1205,1206,1207,1208,1209,1210,1211,1212,1213,1214,1215,1216,1217,1218,1219,1220,1221,1222,1223,1224,1225,1226,1227,1228,1229,1230,1231,1232,1233,1234,1235,1236,1237,1238,1239,1240,1241,1242,1243,1244,1245,1246,1247,1248,1249,1250,1251,1252,1253,1254,1255,1256,1257,1258,1259,1260,1261,1262,1263,1264,1265,1266,1267,1268,1269,1270,1271,1272,1273,1274,1275,1276,1277,1278,1279,1280,1281,1282,1283,1284,1285,1286,1287,1288,1289,1290,1291,1292,1293,1294,1295,1296,1297,1298,1299,1300,1301,1302,1303,1304,1305,1306,1307,1308,1309,1310,1311,1312,1313,1314,1315,1316,1317,1318,1319,1320,
    ],
    /*
ARP
DHCP
DHCPV6
DNS
ETH
FTP
HTTP
HTTP_CONNECT
HTTP_PROXY
ICMP
ICMPV6
IGMP
IMAP
IMAPS
IP
IP_IN_IP
IPP
IPSEC
IPV6
IRC
L2TP
LDAP
MMS
MPEG
NETBIOS
NFS
NDN
POP
POPS
RTP
RTSP
SIP
SMB
SMTP
SMTPS
SNMP
SSDP
SSH
SSL
TCP
TELNET
TFTP
TLS
UDP
VNC
ETHERIP
*/
    //list of protocols that should have children
    ParentProtocol: [
        99,153,154,155,178,179,180,181,182,
        341,354,376,461,
    ],
    ProtocolsIDName: {99: "ETH", 153: "HTTP", 154: "HTTP_CONNECT", 155: "HTTP_PROXY", 178: "IP", 179: "IP_IN_IP", 180: "IPP", 181: "IPSEC", 182: "IPV6", 341: "SSL", 354: "TCP", 376: "UDP", 461: "ETHERIP"
    }
};

//array => object
MMTDrop.formatReportItem = function(entry) {
    switch( entry[0] ) {
        case MMTDrop.CsvFormat.DEFAULT_APP_FORMAT :
            break;
        case MMTDrop.CsvFormat.WEB_APP_FORMAT :
            break;
        case MMTDrop.CsvFormat.SSL_APP_FORMAT :
            break;
        case MMTDrop.CsvFormat.RTP_APP_FORMAT :
            break;
        case MMTDrop.CsvFormat.STATS_FORMAT :
            break;
        case MMTDrop.CsvFormat.SECURITY_FORMAT:
            entry[ MMTDrop.SecurityColumnId.HISTORY ] = JSON.stringify( entry[ MMTDrop.SecurityColumnId.HISTORY ] );
            break;
        case MMTDrop.CsvFormat.BA_BANDWIDTH_FORMAT:
        case MMTDrop.CsvFormat.BA_PROFILE_FORMAT:
        case MMTDrop.CsvFormat.LICENSE:
        case MMTDrop.CsvFormat.MICROFLOWS_STATS_FORMAT : //TODO
        case MMTDrop.CsvFormat.RADIUS_REPORT_FORMAT : //TODO
    }

    var obj = {};
    for( var i in entry ){
        obj[ i ] = entry[ i ];
    }
    return obj;
};

//object => array
MMTDrop.reverseFormatReportItem = function(entry) {
    switch( entry[0] ) {
        case MMTDrop.CsvFormat.DEFAULT_APP_FORMAT :
            break;
        case MMTDrop.CsvFormat.WEB_APP_FORMAT :
            break;
        case MMTDrop.CsvFormat.SSL_APP_FORMAT :
            break;
        case MMTDrop.CsvFormat.RTP_APP_FORMAT :
            break;
        case MMTDrop.CsvFormat.STATS_FORMAT :
            break;
        case MMTDrop.CsvFormat.SECURITY_FORMAT:
            entry[ MMTDrop.SecurityColumnId.HISTORY ] = JSON.parse( entry[ MMTDrop.SecurityColumnId.HISTORY ] );
            break;
        case MMTDrop.CsvFormat.BA_BANDWIDTH_FORMAT:
        case MMTDrop.CsvFormat.BA_PROFILE_FORMAT:
        case MMTDrop.CsvFormat.LICENSE:
        case MMTDrop.CsvFormat.MICROFLOWS_STATS_FORMAT : //TODO
        case MMTDrop.CsvFormat.RADIUS_REPORT_FORMAT : //TODO
    }

    var arr = [];
    for( var i in entry ){
        arr[ parseInt( i ) ] = entry[ i ];
    }
    return arr;
};

function format_session_report( msg ){
  var UP_PATH = msg[ 5 ], DOWN_PATH = msg[ 6 ];
  var PATH_INDEX = 5;

  /**
  * in the probe version 98f750c, on May 03 2016
  * report id = 100 has 2 protocol path: one for uplink, one for down link
  * this function will return a report (as before) which takes the app_path as the longest one:
  */
  //remove one path: UP_PATH, retain DOWN_PATH
  msg.splice( 5, 1 );

  //retain the path having more information
  //not really relevance
  if( MMTDrop.getAppLevelFromPath( UP_PATH ) > MMTDrop.getAppLevelFromPath( DOWN_PATH ))
      msg[ PATH_INDEX ] = UP_PATH;

  var format_type = msg[ MMTDrop.StatsColumnId.FORMAT_TYPE ];
  var cols = [];
  switch (format_type) {
    case MMTDrop.CsvFormat.WEB_APP_FORMAT:
      cols = MMTDrop.HttpStatsColumnId;
      break;
    case MMTDrop.CsvFormat.SSL_APP_FORMAT:
      cols = MMTDrop.TlsStatsColumnId;
      break;
    case MMTDrop.CsvFormat.RTP_APP_FORMAT:
      cols = MMTDrop.RtpStatsColumnId;
      break;
    case MMTDrop.CsvFormat.FTP_APP_FORMAT:
      cols = MMTDrop.FtpStatsColumnId;
      break;
    default:
      return msg;
  }

  var _new = cols.APP_FAMILY - (MMTDrop.StatsColumnId.FORMAT_TYPE + 1);
  var i;

  for( var k in cols ){
    i = cols[ k ];
    msg[ i ] = msg[ i - _new ];
    msg[ i - _new ] = -1;
  }

  return msg;
}

/**
 * Convert a message in string format to an array
 * @param {[[Type]]} message [[Description]]
 */
MMTDrop.formatMessage = function( message ){
    var msg = JSON.parse( message );

    var formatTime = function( ts ){
        var time = Math.ceil( ts * 1000 ) ; //ceil: returns the smallest integer greater than or equal to a given number
        return time;
    }
    //timestamp
    msg[ 3 ] = formatTime( msg[3] );
    //format
    switch( msg[0] ) {
        case MMTDrop.CsvFormat.NDN_FORMAT :
            break;
            //main report
        case MMTDrop.CsvFormat.STATS_FORMAT :
            msg = format_session_report( msg );

            msg[ MMTDrop.StatsColumnId.START_TIME ]   = formatTime( msg[ MMTDrop.StatsColumnId.START_TIME ] );
            msg[ MMTDrop.StatsColumnId.SRC_LOCATION ] = "_local";
            msg[ MMTDrop.StatsColumnId.DST_LOCATION ] = ipToCountry._get( msg[ MMTDrop.StatsColumnId.IP_DEST ] );
            msg[ MMTDrop.StatsColumnId.PROFILE_ID ]   = MMTDrop.getCategoryIdFromAppId( msg[ MMTDrop.StatsColumnId.APP_ID ] );
            break;
        case MMTDrop.CsvFormat.SECURITY_FORMAT:
        case MMTDrop.CsvFormat.BA_BANDWIDTH_FORMAT:
        case MMTDrop.CsvFormat.BA_PROFILE_FORMAT:
            //ip
            if( msg[ 6 ] == "undefined ")
                return null;
            break;
        case MMTDrop.CsvFormat.LICENSE:
            msg[ MMTDrop.LicenseColumnId.EXPIRY_DATE ] = formatTime( msg[ MMTDrop.LicenseColumnId.EXPIRY_DATE ] );
            break;
        case MMTDrop.CsvFormat.MICROFLOWS_STATS_FORMAT :
        case MMTDrop.CsvFormat.RADIUS_REPORT_FORMAT :
        default :

    }
    return msg;
}

module.exports = MMTDrop;
module.exports.CsvFormat = MMTDrop.CsvFormat;
