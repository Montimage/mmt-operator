var ipLib  = require("ip");
var config = require("../config.json");
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
        MICROFLOWS_STATS_FORMAT : 8/**< Micro flows statistics format id */,
        RADIUS_REPORT_FORMAT    : 9/**< RADIUS protocol control format id */,
        STATS_FORMAT            : 100/**< Statistics format id */,
        SECURITY_FORMAT         : 10,
        BA_PROFILE_FORMAT       : 12,
        BA_BANDWIDTH_FORMAT     : 11,
        LICENSE                 : 30,
        NDN_FORMAT              : 625,
        DUMMY_FORMAT            : 200,
    },
    
    isFlowStats : function ( format ) {
        switch (format) {
            case MMTDrop.CsvFormat.DEFAULT_APP_FORMAT :
            case MMTDrop.CsvFormat.WEB_APP_FORMAT :
            case MMTDrop.CsvFormat.SSL_APP_FORMAT :
            case MMTDrop.CsvFormat.RTP_APP_FORMAT :
                return true;
            default :
                return false;
        }
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
    /**
     * Constants: MMTDrop defined Flow based csv format (format 0, and common part of 1, 2, 3)
     */
    FlowStatsColumnId           : {
        FORMAT_ID               : 0, /**< Index of the format id column */
        PROBE_ID                : 1, /**< Index of the probe id column */
        SOURCE_ID               : 2, /**< Index of the data source id column */
        TIMESTAMP               : 3, /**< Index of the format id column */
        FLOW_ID                 : 4, /**< Index of the flow id column */
        START_TIME              : 5, /**< Index of the flow start time */
        IP_VERSION              : 6, /**< Index of the IP version number column */
        SERVER_ADDR             : 7, /**< Index of the server address column */
        CLIENT_ADDR             : 8, /**< Index of the client address column */
        SERVER_PORT             : 9, /**< Index of the server port column */
        CLIENT_PORT             : 10, /**< Index of the client port column */

        //IS_LOCAL                : 11, /** 0 (if not a local address), 1 (local address,server),2 (local address,client),3 (local address,both server and client)*/

        TRANSPORT_PROTO         : 11, /**< Index of the transport protocol identifier column */
        UL_PACKET_COUNT         : 12, /**< Index of the uplink packet count column */
        DL_PACKET_COUNT         : 13, /**< Index of the downlink packet count column */
        UL_DATA_VOLUME          : 14, /**< Index of the uplink data volume column */
        DL_DATA_VOLUME          : 15, /**< Index of the downlink data volume column */
        TCP_RTT                 : 16, /**< Index of the TCP round trip time column */
        RETRANSMISSION_COUNT    : 17, /**< Index of the retransmissions count column */
        APP_FAMILY              : 18, /**< Index of the application family column */
        CONTENT_CLASS           : 19, /**< Index of the content class column */
        PROTO_PATH              : 20, /**< Index of the protocol path column */
        APP_NAME                : 21, /**< Index of the application name column */
        APP_FORMAT_ID           : 22, /**< Index of the start of the application specific statistics (this is not a real column, rather an index) */
    },
    
    HttpStatsColumnId : {
        RESPONSE_TIME       : 0, /**< Index of the response time column */
        TRANSACTIONS_COUNT  : 1, /**< Index of the HTTP transactions count (req/res number) column */
        INTERACTION_TIME    : 2, /**< Index of the interaction time (between client and server) column */
        HOSTNAME            : 3, /**< Index of the hostname column */
        MIME_TYPE           : 4, /**< Index of the MIME type column */
        REFERER             : 5, /**< Index of the Referer column */
        DEVICE_OS_ID        : 6, /**< Index of the device and operating system ids column */
        CDN_FLAG            : 7, /**< Index of the is CDN delivered column */
    },
    
    TlsStatsColumnId : {
        SERVER_NAME : 0, /**< Index of the format id column */
        CDN_FLAG    : 1, /**< Index of the format id column */
    },
    
    RtpStatsColumnId : {
        PACKET_LOSS_RATE        : 0, /**< Index of the format id column */
        PACKET_LOSS_BURSTINESS  : 1, /**< Index of the format id column */
        MAX_JITTER              : 2,
    },
   
     LicenseColumnId           : {
        FORMAT_ID                       : 0, /**< Index of the format id column */
        PROBE_ID                        : 1, /**< Index of the probe id column */
        SOURCE_ID                       : 2, /**< Index of the data source id column */
        TIMESTAMP                       : 3, /**< Index of the format id column */
        LICENSE_INFO_ID                 : 4, /**< Index of the application id column */
        NUMBER_OF_MAC                   : 5,
        MAC_ADDRESSES                   : 6,
        EXPIRY_DATE                     : 7
    },
    NdnColumnId : {
			/** Index of the format id column */
			FORMAT_ID            : 0  ,
			PROBE_ID             : 1  ,
			SOURCE_ID            : 2  ,
			TIMESTAMP            : 3  ,
			SESSION_ID           : 4  ,
            MAC_SRC              : 5  ,
            MAC_DEST             : 6  ,
            NAME                 : 7  ,
            IS_OVER_TCP          : 8  ,
            IP_SRC               : 9  ,
            IP_DEST              : 10 ,
            PORT_SRC             : 11 ,
            PORT_DEST            : 12 ,
            NB_INTEREST_PACKET   : 13 ,
            INTEREST_LIFETIME    : 14 ,
            DATA_VOLUME_INTEREST : 15 ,
			NDN_VOLUME_INTEREST  : 16 ,
            NB_DATA_PACKET       : 17 ,
            DATA_FRESHNESS_PERIOD : 18 ,
            DATA_VOLUME_DATA     : 19 ,
			NDN_VOLUME_DATA      : 20 ,
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
        
        if( this.isLocalIP( msg[COL.IP_SRC] )  )
            return msg;
        else if ( this.isLocalIP( msg[COL.IP_DEST] ) ){
            return this.inverseStatDirection( msg )
        }
        return null;
    },
    
    isLocalIP : function( ip ){
        if( ip === undefined || ip === "undefined")
            return false;
        
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
            if( ipLib.mask( ip, lo.mask ) == lo.root )
                return true;
        }
        return false;  
    },
    inverseStatDirection: function( msg ){
        var COL       = this.StatsColumnId;
        //Permute DL <--> UL
        var tmp = msg[COL.IP_SRC];
        //change direction
        msg[COL.IP_SRC]  = msg[COL.IP_DEST];
        msg[COL.IP_DEST] = tmp;

        tmp = msg[COL.MAC_SRC];
        //change direction
        msg[COL.MAC_SRC]  = msg[COL.MAC_DEST];
        msg[COL.MAC_DEST] = tmp;
        
        for(var i=0; i<2; i++){
            tmp                           = msg[ COL.UL_DATA_VOLUME + i ];
            msg[ COL.UL_DATA_VOLUME + i ] = msg[ COL.DL_DATA_VOLUME + i ];
            msg[ COL.DL_DATA_VOLUME + i ] = tmp;
        }
        return msg;
    },
    
    //this contains a list of protocols (not applications, for example: GOOGLE, HOTMAIL, ...)
    PureProtocol :  [
        30,81,82,85,99,117,153,154,155,163,164,166,169,170,178,179,180,181,182,183,196,198,228,
        231,241,247,272,273,298,299,314,322,323,324,325,339,340,341,354,357,358,363,376,388,461,
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
/**
 * Convert a message in string format to an array
 * @param {[[Type]]} message [[Description]]
 */
MMTDrop.formatMessage = function( message ){
    var msg = JSON.parse( message );
    var formatTime = function( ts ){
        var time = Math.round( ts )  * 1000 ; //round to second
        
        return time;
    }
    //timestamp
    msg[ 3 ] = formatTime( msg[3] );
    //format
    switch( msg[0] ) {
        case MMTDrop.CsvFormat.NDN_FORMAT :
            break;
        case MMTDrop.CsvFormat.DEFAULT_APP_FORMAT :
        case MMTDrop.CsvFormat.WEB_APP_FORMAT :
        case MMTDrop.CsvFormat.SSL_APP_FORMAT :
        case MMTDrop.CsvFormat.RTP_APP_FORMAT :
            msg[ MMTDrop.FlowStatsColumnId.START_TIME ] = formatTime(msg[ MMTDrop.FlowStatsColumnId.START_TIME ] );
            break;
        case MMTDrop.CsvFormat.STATS_FORMAT :
            msg[ MMTDrop.StatsColumnId.START_TIME ] = formatTime( msg[ MMTDrop.StatsColumnId.START_TIME ] );
            break;
        case MMTDrop.CsvFormat.SECURITY_FORMAT:
        case MMTDrop.CsvFormat.BA_BANDWIDTH_FORMAT:
        case MMTDrop.CsvFormat.BA_PROFILE_FORMAT:
            //ip
            if( msg[ 6 ] == "undefined ")
                return null;
            break;
        case MMTDrop.CsvFormat.LICENSE:
            msg[ MMTDrop.LicenseColumnId.EXPIRY_DATE ] == formatTime( msg[ MMTDrop.LicenseColumnId.EXPIRY_DATE ] );
            break;
        case MMTDrop.CsvFormat.MICROFLOWS_STATS_FORMAT : 
        case MMTDrop.CsvFormat.RADIUS_REPORT_FORMAT : 
        default :
            
    }
    return msg;
}

module.exports = MMTDrop;
module.exports.CsvFormat = MMTDrop.CsvFormat;