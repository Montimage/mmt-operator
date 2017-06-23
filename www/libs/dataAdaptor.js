var ipLib   = require("ip");
var config  = require("../config.json");
var maxmind = require('maxmind');
var path    = require("path");
var ipToCountry = maxmind.open( path.join(__dirname, "..", "data", 'GeoLite2-Country.mmdb'), {
    cache: {
        max: 50000, // max items in cache
        maxAge: 1000 * 60 * 60 // life time in milliseconds
    }
});

ipToCountry._get = function( ip ){
  var loc = ipToCountry.get( ip );
  if (loc){
    return (loc['country'])? loc['country']['names']['en'] : loc['continent']['names']['en'];
  }else if( MMTDrop.isLocalIP( ip )
    //multicast
    || ip == "239.255.255.250" || ip.indexOf("224.0.0") == 0){
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
        
        CPU_USAGE				: 95, //in %
        MEM_USAGE				: 96, //in %
        P_DROP					: 97, //in %
        P_DROP_NIC				: 98, //in %
        P_DROP_KERNEL			: 99, //in %
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
			IFA 								  : 18,
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
    	CPU_USER: 4,
    	CPU_SYS : 5,
    	CPU_IDLE: 6,
    	MEM_AVAIL: 7,
    	MEM_TOTAL: 8
    },
    /**
     * A table of Category-Id: Application-Id[]
     */
    CategoriesAppIdsMap: {
    	//web
      1: [2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 14, 18, 19, 20, 21, 22, 23, 25, 26, 27, 31, 32, 33, 34, 35, 36, 38, 39, 40, 44, 45, 46, 49, 50, 51, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 64, 67, 68, 69, 70, 71, 72, 73, 74, 76, 80, 83, 87, 88, 89, 91, 94, 95, 98, 100, 101, 102, 106, 110, 111, 112, 114, 115, 116, 121, 122, 123, 124, 125, 126, 127, 130, 131, 132, 133, 134, 135, 139, 143, 145, 146, 147, 148, 150, 151, 153, 154, 155, 157, 158, 159, 165, 168, 171, 174, 175, 176, 184, 187, 189, 193, 200, 201, 203, 204, 206, 207, 208, 209, 210, 211, 212, 217, 222, 223, 226, 230, 234, 235, 238, 239, 240, 244, 245, 246, 248, 249, 250, 252, 253, 256, 258, 261, 262, 264, 267, 268, 269, 274, 275, 282, 283, 286, 287, 289, 292, 293, 294, 295, 300, 301, 302, 303, 305, 306, 307, 309, 313, 315, 316, 318, 319, 320, 321, 326, 327, 328, 329, 331, 333, 334, 335, 336, 338, 342, 343, 346, 348, 350, 351, 352, 353, 359, 360, 362, 364, 367, 368, 369, 370, 375, 378, 379, 380, 383, 386, 387, 389, 390, 391, 392, 394, 395, 396, 398, 399, 400, 401, 402, 403, 404, 406, 408, 412, 415, 416, 417, 418, 419, 420, 423, 424, 425, 426, 428, 430, 431, 550, 551, 552, 553, 554, 555, 556, 557, 558, 559, 560, 561, 562, 563, 564, 565, 566, 567, 568, 580, 583, 597, 598, 623],
      //P2P
      2: [17, 28, 52, 84, 92, 105, 109, 129, 172, 190, 215, 257, 263, 332, 344, 361, 365, 405],
      //Gaming
      3: [8, 24, 29, 42, 43, 47, 63, 75, 86, 96, 108, 113, 119, 120, 144, 149, 167, 192, 194, 199, 216, 224, 225, 227, 266, 270, 271, 285, 296, 297, 308, 345, 374, 407, 409, 410, 411, 413, 421, 432, 617, 618, 619, 620, 621],
      //Streaming
      4: [77, 107, 138, 161, 185, 195, 197, 228, 229, 231, 242, 254, 255, 277, 280, 284, 291, 298, 299, 311, 312, 330, 337, 371, 372, 381, 382, 385, 427, 429, 570, 571, 572, 573, 574, 575, 576, 577, 578, 579, 581, 582, 584, 585, 586, 587, 588, 589, 592,
      627, 631, 632],
      //conversational
      5: [16, 37, 104, 118, 136, 140, 160, 173, 183, 186, 188, 220, 221, 232, 259, 314, 317, 366, 384, 397, 594, 595, 596, 600, 622],
      //Mail
      6: [128, 152, 169, 170, 205, 213, 272, 273, 323, 324, 422],
      //FileTransfer
      7: [117, 247, 322, 358],
      //CloudStorage
      8: [90, 162, 590, 591],
      //Network
      9: [79, 219, 569],
    //Network
      10: [0,7, 15, 30, 41, 48, 81, 82, 85, 93, 97, 99, 163, 164, 166, 178, 180, 181, 182, 191, 198, 214, 218, 241, 243, 251, 260, 288, 304, 310, 325, 339, 341, 347, 349, 354, 363, 376, 377, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479, 480, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 495, 497, 498, 499, 500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 531, 532, 533, 534, 535, 536, 537, 538, 539, 540, 541, 542, 543, 544, 545, 546, 547, 548, 549, //],
               //Tunlelling
    /*11: [*/
               137, 141, 142, 179, 196, 278, 279, 281, 461, 481, 496,//],
               //Remote
          //13: [
               265, 290, 340, 356, 357, 388, 414,
              //],
          //Misc
    //14: [
              65, 66, 78, 156, 393,
            630],
      //Database
      12: [233, 237, 276, 355,
        628,629],
      //CND
      15: [593, 599, 601, 602, 603, 604, 605, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615, 616,
         625,626],
      //SocialNetwork
      16: [103, 373, 177, 202, 236]
    },
    /**
     * Get Category ID of an application
     * @param {number} appId - application Id
     * @returns {number} - category Id
     */
    getCategoryIdFromAppId : function( appId ){
      //cache last found
      if( this._cacheCategoryIdFromAppId === undefined )
        this._cacheCategoryIdFromAppId = {};
      if( this._cacheCategoryIdFromAppId[ appId] !== undefined )
        return this._cacheCategoryIdFromAppId[ appId ];

      appId = parseInt( appId );

      for (var i in MMTDrop.CategoriesAppIdsMap){
        var arr = MMTDrop.CategoriesAppIdsMap[i];
        if (arr.indexOf( appId ) > -1)
          return this._cacheCategoryIdFromAppId[ appId ] = parseInt( i );
      }
      console.log( "Not found category for this app: " + appId  );
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

        msg[ COL.IP_SRC_INIT_CONNECTION ] = true;
        if ( this.isLocalIP( msg[COL.IP_SRC] ) )
          return msg;

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
        if( this._localCacheIPs === undefined )
          this._localCacheIPs = {};

        //check in the cache
        else if( this._localCacheIPs[ ip ] !== undefined )
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

    //check whenther object obj having an attribute's value that equals to val
    objectHasAttributeWithValue: function( obj, val ){
      for( var i in obj)
         if( obj[i] == val ) return i;
      return;
    },

    //this contains a list of protocols (not applications, for example: GOOGLE, HOTMAIL, ...)
    PureProtocol :  [
        30,81,82,85,99,117,153,154,155,163,164,166,169,170,178,179,180,181,182,183,196,198,228,
        231,241,247,272,273,298,299,314,322,323,324,325,339,340,341,354,357,358,363,376,388,461,
        625,626,628
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
    },

    cloneData : function( obj ){
      if( Array.isArray( obj ))
        return obj.slice( 0 );
      else if ( typeof(obj) === 'object' )
        return  JSON.parse(JSON.stringify(obj));
      return obj;
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
    for( var i=0; i<entry.length; i++ ){
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
    //faster
    const MAX = 100;
    for( var i=0; i<MAX; i++ )
      if( entry[ i ] != undefined )
        arr[ i ] = entry[ i ];

    /*
    for( var i in entry )
      arr[ parseInt( i ) ] = entry[ i ];
    */
    return arr;
};

function format_session_report( msg ){
  var PATH_INDEX = MMTDrop.StatsColumnId.APP_PATH;
  var UP_PATH = msg[ PATH_INDEX ], DOWN_PATH = msg[ PATH_INDEX + 1 ];
  

  /**
  * in the probe version 98f750c, on May 03 2016
  * report id = 100 has 2 protocol path: one for uplink, one for down link
  * this function will return a report (as before) which takes the app_path as the longest one:
  */
  //remove one path: UP_PATH, retain DOWN_PATH
  msg.splice( PATH_INDEX, 1 );
  
//in any case, take the last 5 cols for cpu_mem usage report 
	var msg_len = Object.keys(msg).length;
	msg[ MMTDrop.StatsColumnId.CPU_USAGE ] 		= msg[msg_len-5];
	msg[ MMTDrop.StatsColumnId.MEM_USAGE ] 		= msg[msg_len-4];
	msg[ MMTDrop.StatsColumnId.P_DROP ] 		= msg[msg_len-3];
	msg[ MMTDrop.StatsColumnId.P_DROP_NIC ] 	= msg[msg_len-2];
	msg[ MMTDrop.StatsColumnId.P_DROP_KERNEL ]	= msg[msg_len-1];

  //retain the path having more information
  //not really relevance
  if( MMTDrop.getAppLevelFromPath( UP_PATH ) > MMTDrop.getAppLevelFromPath( DOWN_PATH ))
      msg[ PATH_INDEX ] = UP_PATH;

  var format_type = msg[ MMTDrop.StatsColumnId.FORMAT_TYPE ];
  var _start = 0, _end = 0 ;
  switch (format_type) {
    case MMTDrop.CsvFormat.WEB_APP_FORMAT:
      _start = MMTDrop.HttpStatsColumnId.APP_FAMILY;
      _end   = MMTDrop.HttpStatsColumnId.REQUEST_INDICATOR;
      break;
    case MMTDrop.CsvFormat.SSL_APP_FORMAT:
      _start = MMTDrop.TlsStatsColumnId.APP_FAMILY;
      _end   = MMTDrop.TlsStatsColumnId.CDN_FLAG;
      break;
    case MMTDrop.CsvFormat.RTP_APP_FORMAT:
      _start = MMTDrop.RtpStatsColumnId.APP_FAMILY;
      _end   = MMTDrop.RtpStatsColumnId.ORDER_ERROR;
      break;
    case MMTDrop.CsvFormat.FTP_APP_FORMAT:
      _start = MMTDrop.FtpStatsColumnId.APP_FAMILY;
      _end   = MMTDrop.FtpStatsColumnId.RESPONSE_TIME;
      break;
    default:
    	return msg;
  }
  //APP_FAMILY: starting index of  each types HTTP/SSL/TLS/FTP
  var _new = _start - (MMTDrop.StatsColumnId.FORMAT_TYPE + 1),
      i,
      new_msg = {};//clone: avoid being overrided

  for( var i=(MMTDrop.StatsColumnId.FORMAT_TYPE + 1); i<_start; i++){
    new_msg[ i ] = msg[ i ];
    msg[ i ]     = null;
  }

  for( var i=_start; i<=_end; i++ ){
    //starting: i=50 (HTTP), i=70 (TLS), i=80 (RTP), i=90 (FTP)
    msg[ i ] = new_msg[ i - _new ];
  }
  return msg;
}

var formatTime = function( ts ){
   var time = Math.ceil( ts * 1000 ) ; //ceil: returns the smallest integer greater than or equal to a given number
   return time;
}
/**
 * Convert a message in string format to an array
 * @param {[[Type]]} message [[Description]]
 */
MMTDrop.formatMessage = function( message ){
    var msg = JSON.parse( message );

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
            msg[ MMTDrop.StatsColumnId.SRC_LOCATION ] = ipToCountry._get( msg[ MMTDrop.StatsColumnId.IP_SRC ] );
            msg[ MMTDrop.StatsColumnId.DST_LOCATION ] = ipToCountry._get( msg[ MMTDrop.StatsColumnId.IP_DEST ] );
            //continue in NO_SESSION_STATS_FORMAT
        case MMTDrop.CsvFormat.NO_SESSION_STATS_FORMAT:
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
        //MUSA project, availability message
        case 50:
        	//console.log( msg );
        	break;
        case MMTDrop.CsvFormat.MICROFLOWS_STATS_FORMAT :
        case MMTDrop.CsvFormat.RADIUS_REPORT_FORMAT :
        default :

    }
    return msg;
}

module.exports = MMTDrop;
module.exports.CsvFormat = MMTDrop.CsvFormat;
