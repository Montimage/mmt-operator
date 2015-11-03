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
		VERSION : "1.0.0"
};



(function(MMTDrop){
'use strict';

MMTDrop.object = {};

/**
 * Set global options
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
		render: "highchart",
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
			/** Micro flows statistics format id */
			MICROFLOWS_STATS_FORMAT : 8,
			/** RADIUS protocol control format id */
			RADIUS_REPORT_FORMAT : 9,
			/** Statistics format id */
			STATS_FORMAT : 100,
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
			/** Index of the application id column */
			APP_ID            : {id: 4,  label: "App"},
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
			APP_PATH          : {id: 5,  label: "App Path"},
			/** Index of the active flows column */
			ACTIVE_FLOWS      : {id: 6,  label: "Active Flows"},
			/** Index of the data volume column */
			DATA_VOLUME       : {id: 7,  label: "Data Volume"},
			/** Index of the payload data volume column */
			PAYLOAD_VOLUME    : {id: 8,  label: "Payload Volume"},
			/** Index of the packet count column */
			PACKET_COUNT      : {id: 9, label: "Packet Count"},
			/** Index of the data volume column */
			UL_DATA_VOLUME    : {id: 10, label: "UL Data Volume"},
			/** Index of the payload data volume column */
			UL_PAYLOAD_VOLUME : {id: 11, label: "UL Packet Count"},
			/** Index of the packet count column */
			UL_PACKET_COUNT   : {id: 12, label: "UL Packet Count"},
			/** Index of the data volume column */
			DL_DATA_VOLUME    : {id: 13, label: "DL Data Volume"},
			/** Index of the payload data volume column */
			DL_PAYLOAD_VOLUME : {id: 14, label: "DL Payload Volume"},
			/** Index of the packet count column */
			DL_PACKET_COUNT   : {id: 15, label: "DL Packet Count"},
            /** Index of the start timestamp of the flow */
            START_TIME        : {id: 16, label: "Start Time"}, 
            /** Index of the MAC address source column */
            MAC_SRC           : {id: 17, label: "Destination Address"}, 
            /** Index of the MAC address source column */
            MAC_DEST          : {id: 18, label: "Source Address "} 
		},
    
		/**
		 *  Data format description for flow statistic reports
		 */
		FlowStatsColumn : {
			/** Index of the format id column */
			FORMAT_ID : {id: 0, label:"Format"} ,
			/** Index of the probe id column */
			PROBE_ID  : {id: 1, label:"Probe"},
			/** Index of the data source id column */
			SOURCE_ID : {id: 2, label:"Source"},
			/** Index of the format id column */
			TIMESTAMP : {id: 3, label:"Timestamp"},
			/** Index of the flow id column */
			FLOW_ID   : {id: 4, label:"Flow ID"},
			/** Index of the flow start time */
			START_TIME  : {id: 5, label:"Start Time"},
			/** Index of the IP version number column */
			IP_VERSION  : {id: 6, label:"IP Version"},
			/** Index of the server address column */
			SERVER_ADDR : {id: 7, label:"Server Address"},
			/** Index of the client address column */
			CLIENT_ADDR : {id: 8, label:"Client Address"},
			/** Index of the server port column */
			SERVER_PORT : {id: 9, label:"Server Port"},
			/** Index of the client port column */
			CLIENT_PORT : {id: 10, label:"Client Port"},
			/** Index of the transport protocol identifier column */
			TRANSPORT_PROTO : {id: 11, label:"Transport Protocol"},
			/** Index of the uplink packet count column */
			UL_PACKET_COUNT : {id: 12, label:"UP Packet Count"},
			/** Index of the downlink packet count column */
			DL_PACKET_COUNT : {id: 13, label:"DL Packet Count"},
			/** Index of the uplink data volume column */
			UL_DATA_VOLUME  : {id: 14, label:"UL Data Volume"},
			/** Index of the downlink data volume column */
			DL_DATA_VOLUME  : {id: 15, label:"DL Data Volume"},
			/** Index of the TCP round trip time column.
			 * 
			 *  For UDP traffic this will be set to zero.
			 */
			TCP_RTT         : {id: 16, label:"TCP RTT"},
			/** Index of the retransmissions count column
			 *
			 * For UDP traffic this will be set to zero
			 */
			RETRANSMISSION_COUNT : {id: 17, label:"Retransmission Count"},
			/** Index of the application family column */
			APP_FAMILY    : {id: 18, label:"App Family"},
			/** Index of the content class column */
			CONTENT_CLASS : {id: 19, label:"Content Class"},
			/** Index of the protocol path column */
			PROTO_PATH    : {id: 20, label:"Protocol Path"},
			/** Index of the application name column */
			APP_NAME      : {id: 21, label:"App Name"},
			/** Index of the start of the application specific statistics (this is not a real column, rather an index) */
			APP_FORMAT_ID : {id: 22, label:"App Format ID"},
		},

		/**
		 * Data format description for statistic reports of HTTP protocol
		 */
		HttpStatsColumn : {
			/** Response time of the last Request/Reply of the flow */
			RESPONSE_TIME      : {id: 0, label:"Response Time"},
			/** Index of the HTTP transactions count (req/res number) column */
			TRANSACTIONS_COUNT : {id: 1, label:"Transaction Count"},
			/** 
			 * Index of the interaction time (between client and server) column.
			 * This is the time between the first request and the lest response. 
			 * If this is zero then the flow has one request reply.
			 */
			INTERACTION_TIME   : {id: 2, label:"Interaction Time"},
			/** Index of the hostname column */
			HOSTNAME     : {id: 3, label:"Hostname"},
			/** Index of the MIME type column */
			MIME_TYPE    : {id: 4, label:"MIME Type"},
			/** Index of the Referer column. Referrer as reported in the HTTP header */
			REFERER      : {id: 5, label:"Referer"},
			/** Index of the device and operating system ids column.
			 * It is concatenated between device identifier (PC, mobile, tablet, etc.) and Operating system identifier (Win, Linux, Android, etc.). 
			 * These are derived from the user agent.
			 */
			DEVICE_OS_ID : {id: 6, label:"Device OS ID"},
			/** Index of the is CDN delivered column 
			 * 0: CDN not detected (This does not mean it is not used :)). 
			 * 1: 1 means CDN flags identified in the message. The referrer should identify the application. 
			 * Will not be present in HTTPS flows. 
			 * 2: CDN delivery, the application name should identify the application. However, we might see Akamai as application. In this case, skip it.
			 */
			CDN_FLAG     : {id: 7, label:"CDN Flag"},
		},

		/**
		 * Data format description for statistic reports of TLS protocol
		 */
		TlsStatsColumn : {
			/** Servername as reported in the SSL/TLS negotiation. 
			 * It is not always possible to extract this field. will be empty in that case. 
			 */
			SERVER_NAME : {id: 0, label:"Server Name"},
			/**
			 * 0: CDN not detected (This does not mean it is not used :)). 
			 * 1: 1 means CDN flags identified in the message. The referrer should identify the application. 
			 * Will not be present in HTTPS flows. 
			 * 2: CDN delivery, the application name should identify the application. 
			 * However, we might see Akamai as application. In this case, skip it.
			 */
			CDN_FLAG    : {id: 1, label:"CDN Flag"},
		},

		/**
		 * Data format description for statistic reports of RTP protocol
		 */
		RtpStatsColumn : {
			/** Global packet loss rate of the flow */
			PACKET_LOSS_RATE       : {id: 0, label:"Packet Loss Rate"},
			/** Average packet loss burstiness of the flow */
			PACKET_LOSS_BURSTINESS : {id: 1, label:"Packet Loss Burstiness"},
			/** Maximum jitter value for the flow */
			MAX_JITTER             : {id: 2, label:"Max Jitter"},
		},

		/**
		 * Data format description for Radius reports
		 */
		RadiusStatsColumn: {
			
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
			ACTIVE_FLOWS   : {id: 104, label:"Active flow"},
			
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
			0: 'All', 2: '163', 3: '360', 4: '302_FOUND', 5: '360BUY', 6: '56', 7: '8021Q', 8: '888', 9: 'ABOUT', 10: 'ADCASH', 11: 'ADDTHIS', 12: 'ADF', 13: 'ADOBE', 14: 'AFP', 15: 'AH', 16: 'AIM', 17: 'AIMINI', 18: 'ALIBABA', 19: 'ALIPAY', 20: 'ALLEGRO', 21: 'AMAZON', 22: 'AMEBLO', 23: 'ANCESTRY', 24: 'ANGRYBIRDS', 25: 'ANSWERS', 26: 'AOL', 27: 'APPLE', 28: 'APPLEJUICE', 29: 'ARMAGETRON', 30: 'ARP', 31: 'ASK', 32: 'AVG', 33: 'AVI', 34: 'AWEBER', 35: 'AWS', 36: 'BABYLON', 37: 'BADOO', 38: 'BAIDU', 39: 'BANKOFAMERICA', 40: 'BARNESANDNOBLE', 41: 'BATMAN', 42: 'BATTLEFIELD', 43: 'BATTLENET', 44: 'BBB', 45: 'BBC_ONLINE', 46: 'BESTBUY', 47: 'BETFAIR', 48: 'BGP', 49: 'BIBLEGATEWAY', 50: 'BILD', 51: 'BING', 52: 'BITTORRENT', 53: 'BLEACHERREPORT', 54: 'BLOGFA', 55: 'BLOGGER', 56: 'BLOGSPOT', 57: 'BODYBUILDING', 58: 'BOOKING', 59: 'CBSSPORTS', 60: 'CENT', 61: 'CHANGE', 62: 'CHASE', 63: 'CHESS', 64: 'CHINAZ', 65: 'CITRIX', 66: 'CITRIXONLINE', 67: 'CLICKSOR', 68: 'CNN', 69: 'CNZZ', 70: 'COMCAST', 71: 'CONDUIT', 72: 'COPYSCAPE', 73: 'CORREIOS', 74: 'CRAIGSLIST', 75: 'CROSSFIRE', 76: 'DAILYMAIL', 77: 'DAILYMOTION', 78: 'DCERPC', 79: 'DIRECT_DOWNLOAD_LINK', 80: 'DEVIANTART', 81: 'DHCP', 82: 'DHCPV6', 83: 'DIGG', 84: 'DIRECTCONNECT', 85: 'DNS', 86: 'DOFUS', 87: 'DONANIMHABER', 88: 'DOUBAN', 89: 'DOUBLECLICK', 90: 'DROPBOX', 91: 'EBAY', 92: 'EDONKEY', 93: 'EGP', 94: 'EHOW', 95: 'EKSISOZLUK', 96: 'ELECTRONICSARTS', 97: 'ESP', 98: 'ESPN', 99: 'ETHERNET', 100: 'ETSY', 101: 'EUROPA', 102: 'EUROSPORT', 103: 'FACEBOOK', 104: 'FACETIME', 105: 'FASTTRACK', 106: 'FC2', 107: 'FEIDIAN', 108: 'FIESTA', 109: 'FILETOPIA', 110: 'FIVERR', 111: 'FLASH', 112: 'FLICKR', 113: 'FLORENSIA', 114: 'FOURSQUARE', 115: 'FOX', 116: 'FREE', 117: 'FTP', 118: 'GADUGADU', 119: 'GAMEFAQS', 120: 'GAMESPOT', 121: 'GAP', 122: 'GARANTI', 123: 'GAZETEVATAN', 124: 'GIGAPETA', 125: 'GITHUB', 126: 'GITTIGIDIYOR', 127: 'GLOBO', 128: 'GMAIL', 129: 'GNUTELLA', 130: 'GOOGLE_MAPS', 131: 'GO', 132: 'GODADDY', 133: 'GOO', 134: 'GOOGLE', 135: 'GOOGLE_USER_CONTENT', 136: 'GOSMS', 137: 'GRE', 138: 'GROOVESHARK', 139: 'GROUPON', 140: 'GTALK', 141: 'GTP', 142: 'GTP2', 143: 'GUARDIAN', 144: 'GUILDWARS', 145: 'HABERTURK', 146: 'HAO123', 147: 'HEPSIBURADA', 148: 'HI5', 149: 'HALFLIFE2', 150: 'HOMEDEPOT', 151: 'HOOTSUITE', 152: 'HOTMAIL', 153: 'HTTP', 154: 'HTTP_CONNECT', 155: 'HTTP_PROXY', 156: 'HTTP_APPLICATION_ACTIVESYNC', 157: 'HUFFINGTON_POST', 158: 'HURRIYET', 159: 'I23V5', 160: 'IAX', 161: 'ICECAST', 162: 'APPLE_ICLOUD', 163: 'ICMP', 164: 'ICMPV6', 165: 'IFENG', 166: 'IGMP', 167: 'IGN', 168: 'IKEA', 169: 'IMAP', 170: 'IMAPS', 171: 'INTERNET_MOVIE_DATABASE', 172: 'IMESH', 173: 'IMESSAGE', 174: 'IMGUR', 175: 'INCREDIBAR', 176: 'INDIATIMES', 177: 'INSTAGRAM', 178: 'IP', 179: 'IP_IN_IP', 180: 'IPP', 181: 'IPSEC', 182: 'IPV6', 183: 'IRC', 184: 'IRS', 185: 'APPLE_ITUNES', 186: 'UNENCRYPED_JABBER', 187: 'JAPANPOST', 188: 'KAKAO', 189: 'KAT', 190: 'KAZAA', 191: 'KERBEROS', 192: 'KING', 193: 'KOHLS', 194: 'KONGREGATE', 195: 'KONTIKI', 196: 'L2TP', 197: 'LASTFM', 198: 'LDAP', 199: 'LEAGUEOFLEGENDS', 200: 'LEGACY', 201: 'LETV', 202: 'LINKEDIN', 203: 'LIVE', 204: 'LIVEDOOR', 205: 'LIVEMAIL', 206: 'LIVEINTERNET', 207: 'LIVEJASMIN', 208: 'LIVEJOURNAL', 209: 'LIVESCORE', 210: 'LIVINGSOCIAL', 211: 'LOWES', 212: 'MACYS', 213: 'MAIL_RU', 214: 'MANET', 215: 'MANOLITO', 216: 'MAPLESTORY', 217: 'MATCH', 218: 'MDNS', 219: 'MEDIAFIRE', 220: 'MEEBO', 221: 'MGCP', 222: 'MICROSOFT', 223: 'MILLIYET', 224: 'MINECRAFT', 225: 'MINICLIP', 226: 'MLBASEBALL', 227: 'MMO_CHAMPION', 228: 'MMS', 229: 'MOVE', 230: 'MOZILLA', 231: 'MPEG', 232: 'MSN', 233: 'MSSQL', 234: 'MULTIPLY', 235: 'MYNET', 236: 'MYSPACE', 237: 'MYSQL', 238: 'MYWEBSEARCH', 239: 'NBA', 240: 'NEOBUX', 241: 'NETBIOS', 242: 'NETFLIX', 243: 'NETFLOW', 244: 'NEWEGG', 245: 'NEWSMAX', 246: 'NFL', 247: 'NFS', 248: 'NICOVIDEO', 249: 'NIH', 250: 'NORDSTROM', 251: 'NTP', 252: 'NYTIMES', 253: 'ODNOKLASSNIKI', 254: 'OFF', 255: 'OGG', 256: 'ONET', 257: 'OPENFT', 258: 'ORANGEDONKEY', 259: 'OSCAR', 260: 'OSPF', 261: 'OUTBRAIN', 262: 'OVERSTOCK', 263: 'PANDO', 264: 'PAYPAL', 265: 'PCANYWHERE', 266: 'PCH', 267: 'PCONLINE', 268: 'PHOTOBUCKET', 269: 'PINTEREST', 270: 'PLAYSTATION', 271: 'POGO', 272: 'POP', 273: 'POPS', 274: 'POPO', 275: 'PORNHUB', 276: 'POSTGRES', 277: 'PPLIVE', 278: 'PPP', 279: 'PPPOE', 280: 'PPSTREAM', 281: 'PPTP', 282: 'PREMIERLEAGUE', 283: 'QQ', 284: 'QQLIVE', 285: 'QUAKE', 286: 'QUICKTIME', 287: 'R10', 288: 'RADIUS', 289: 'RAKUTEN', 290: 'RDP', 291: 'REALMEDIA', 292: 'REDDIT', 293: 'REDTUBE', 294: 'REFERENCE', 295: 'RENREN', 296: 'ROBLOX', 297: 'ROVIO', 298: 'RTP', 299: 'RTSP', 300: 'SABAHTR', 301: 'SAHIBINDEN', 302: 'SALESFORCE', 303: 'SALON', 304: 'SCTP', 305: 'SEARCHNU', 306: 'SEARCH_RESULTS', 307: 'SEARS', 308: 'SECONDLIFE', 309: 'SECURESERVER', 310: 'SFLOW', 311: 'SHAZAM', 312: 'SHOUTCAST', 313: 'SINA', 314: 'SIP', 315: 'SITEADVISOR', 316: 'SKY', 317: 'SKYPE', 318: 'SKYROCK', 319: 'SKYSPORTS', 320: 'SLATE', 321: 'SLIDESHARE', 322: 'SMB', 323: 'SMTP', 324: 'SMTPS', 325: 'SNMP', 326: 'SOCRATES', 327: 'SOFTONIC', 328: 'SOGOU', 329: 'SOHU', 330: 'SOPCAST', 331: 'SOSO', 332: 'SOULSEEK', 333: 'SOUNDCLOUD', 334: 'SOURGEFORGE', 335: 'SPIEGEL', 336: 'SPORX', 337: 'SPOTIFY', 338: 'SQUIDOO', 339: 'SSDP', 340: 'SSH', 341: 'SSL', 342: 'STACK_OVERFLOW', 343: 'STATCOUNTER', 344: 'STEALTHNET', 345: 'STEAM', 346: 'STUMBLEUPON', 347: 'STUN', 348: 'SULEKHA', 349: 'SYSLOG', 350: 'TAGGED', 351: 'TAOBAO', 352: 'TARGET', 353: 'TCO', 354: 'TCP', 355: 'TDS', 356: 'TEAMVIEWER', 357: 'TELNET', 358: 'TFTP', 359: 'THEMEFOREST', 360: 'THE_PIRATE_BAY', 361: 'THUNDER', 362: 'TIANYA', 363: 'TLS', 364: 'TMALL', 365: 'TORRENTZ', 366: 'TRUPHONE', 367: 'TUBE8', 368: 'TUDOU', 369: 'TUENTI', 370: 'TUMBLR', 371: 'TVANTS', 372: 'TVUPLAYER', 373: 'TWITTER', 374: 'UBI', 375: 'UCOZ', 376: 'UDP', 377: 'UDPLITE', 378: 'UOL', 379: 'USDEPARTMENTOFSTATE', 380: 'USENET', 381: 'USTREAM', 382: 'HTTP_APPLICATION_VEOHTV', 383: 'VIADEO', 384: 'VIBER', 385: 'VIMEO', 386: 'VK', 387: 'VKONTAKTE', 388: 'VNC', 389: 'WALMART', 390: 'WARRIORFORUM', 391: 'WAYN', 392: 'WEATHER', 393: 'WEBEX', 394: 'WEEKLYSTANDARD', 395: 'WEIBO', 396: 'WELLSFARGO', 397: 'WHATSAPP', 398: 'WIGETMEDIA', 399: 'WIKIA', 400: 'WIKIMEDIA', 401: 'WIKIPEDIA', 402: 'WILLIAMHILL', 403: 'WINDOWSLIVE', 404: 'WINDOWSMEDIA', 405: 'WINMX', 406: 'WINUPDATE', 407: 'WORLD_OF_KUNG_FU', 408: 'WORDPRESS_ORG', 409: 'WARCRAFT3', 410: 'WORLDOFWARCRAFT', 411: 'WOWHEAD', 412: 'WWE', 413: 'XBOX', 414: 'XDMCP', 415: 'XHAMSTER', 416: 'XING', 417: 'XINHUANET', 418: 'XNXX', 419: 'XVIDEOS', 420: 'YAHOO', 421: 'YAHOOGAMES', 422: 'YAHOOMAIL', 423: 'YANDEX', 424: 'YELP', 425: 'YOUKU', 426: 'YOUPORN', 427: 'YOUTUBE', 428: 'ZAPPOS', 429: 'ZATTOO', 430: 'ZEDO', 431: 'ZOL', 432: 'ZYNGA', 433: '3PC', 434: 'ANY_0HOP', 435: 'ANY_DFS', 436: 'ANY_HIP', 437: 'ANY_LOCAL', 438: 'ANY_PES', 439: 'ARGUS', 440: 'ARIS', 441: 'AX_25', 442: 'BBN_RCC_MON', 443: 'BNA', 444: 'BR_SAT_MON', 445: 'CBT', 446: 'CFTP', 447: 'CHAOS', 448: 'COMPAQ_PEER', 449: 'CPHB', 450: 'CPNX', 451: 'CRTP', 452: 'CRUDP', 453: 'DCCP', 454: 'DCN_MEAS', 455: 'DDP', 456: 'DDX', 457: 'DGP', 458: 'EIGRP', 459: 'EMCON', 460: 'ENCAP', 461: 'ETHERIP', 462: 'FC', 463: 'FIRE', 464: 'GGP', 465: 'GMTP', 466: 'HIP', 467: 'HMP', 468: 'I_NLSP', 469: 'IATP', 470: 'IDPR', 471: 'IDPR_CMTP', 472: 'IDRP', 473: 'IFMP', 474: 'IGP', 475: 'IL', 476: 'IPCOMP', 477: 'IPCV', 478: 'IPLT', 479: 'IPPC', 480: 'IPTM', 481: 'IPX_IN_IP', 482: 'IRTP', 483: 'IS_IS', 484: 'ISO_IP', 485: 'ISO_TP4', 486: 'KRYPTOLAN', 487: 'LARP', 488: 'LEAF_1', 489: 'LEAF_2', 490: 'MERIT_INP', 491: 'MFE_NSP', 492: 'MHRP', 493: 'MICP', 494: 'MOBILE', 495: 'MOBILITY_HEADER', 496: 'MPLS_IN_IP', 497: 'MTP', 498: 'MUX', 499: 'NARP', 500: 'NETBLT', 501: 'NSFNET_IGP', 502: 'NVP_II', 503: 'PGM', 504: 'PIM', 505: 'PIPE', 506: 'PNNI', 507: 'PRM', 508: 'PTP', 509: 'PUP', 510: 'PVP', 511: 'QNX', 512: 'RSVP', 513: 'RSVP_E2E_IGNORE', 514: 'RVD', 515: 'SAT_EXPAK', 516: 'SAT_MON', 517: 'SCC_SP', 518: 'SCPS', 519: 'SDRP', 520: 'SECURE_VMTP', 521: 'SHIM6', 522: 'SKIP', 523: 'SM', 524: 'SMP', 525: 'SNP', 526: 'SPRITE_RPC', 527: 'SPS', 528: 'SRP', 529: 'SSCOPMCE', 530: 'ST', 531: 'STP', 532: 'SUN_ND', 533: 'SWIPE', 534: 'TCF', 535: 'TLSP', 536: 'TP_PP', 537: 'TRUNK_1', 538: 'TRUNK_2', 539: 'UTI', 540: 'VINES', 541: 'VISA', 542: 'VMTP', 543: 'VRRP', 544: 'WB_EXPAK', 545: 'WB_MON', 546: 'WSN', 547: 'XNET', 548: 'XNS_IDP', 549: 'XTP', 550: 'BUZZNET', 551: 'COMEDY', 552: 'RAMBLER', 553: 'SMUGMUG', 554: 'ARCHIEVE', 555: 'CITYNEWS', 556: 'SCIENCESTAGE', 557: 'ONEWORLD', 558: 'DISQUS', 559: 'BLOGCU', 560: 'EKOLEY', 561: '500PX', 562: 'FOTKI', 563: 'FOTOLOG', 564: 'JALBUM', 565: 'LOCKERZ', 566: 'PANORAMIO', 567: 'SNAPFISH', 568: 'WEBSHOTS', 569: 'MEGA', 570: 'VIDOOSH', 571: 'AFREECA', 572: 'WILDSCREEN', 573: 'BLOGTV', 574: 'HULU', 575: 'MEVIO', 576: 'LIVESTREAM', 577: 'LIVELEAK', 578: 'DEEZER', 579: 'BLIPTV', 580: 'BREAK', 581: 'CITYTV', 582: 'COMEDYCENTRAL', 583: 'ENGAGEMEDIA', 584: 'SCREENJUNKIES', 585: 'RUTUBE', 586: 'SEVENLOAD', 587: 'MUBI', 588: 'IZLESENE', 589: 'VIDEO_HOSTING', 590: 'BOX', 591: 'SKYDRIVE', 592: '7DIGITAL', 593: 'CLOUDFRONT', 594: 'TANGO', 595: 'WECHAT', 596: 'LINE', 597: 'BLOOMBERG', 598: 'MSCDN', 599: 'AKAMAI', 600: 'YAHOOMSG', 601: 'BITGRAVITY', 602: 'CACHEFLY', 603: 'CDN77', 604: 'CDNETWORKS', 605: 'CHINACACHE', 606: 'COTENDO', 607: 'EDGECAST', 608: 'FASTLY', 609: 'HIGHWINDS', 610: 'INTERNAP', 611: 'LEVEL3', 612: 'LIMELIGHT', 613: 'MAXCDN', 614: 'NETDNA', 615: 'VOXEL', 616: 'RACKSPACE', 617: 'GAMEFORGE', 618: 'METIN2', 619: 'OGAME', 620: 'BATTLEKNIGHT', 621: '4STORY', 622: 'FBMSG', 623: 'GCM',
		},

		/**
		 * A table of Category-Id : Name
		 */
		CategoriesIdsMap: {
			0:'All', 1:'Web', 2:'P2P', 3:'Gaming', 4:'Streaming', 5:'Conversational', 6:'Mail', 7:'FileTransfer', 8:'CloudStorage', 9:'DirectDownloadLink', 10:'Network', 11:'Tunnelling', 12:'DataBase', 13:'Remote', 14:'Misc', 15:'CDN'
		},

		/**
		 * A table of Category-Id: Application-Id[]
		 */
		CategoriesAppIdsMap: {
			1: [2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 14, 18, 19, 20, 21, 22, 23, 25, 26, 27, 31, 32, 33, 34, 35, 36, 38, 39, 40, 44, 45, 46, 49, 50, 51, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 64, 67, 68, 69, 70, 71, 72, 73, 74, 76, 80, 83, 87, 88, 89, 91, 94, 95, 98, 100, 101, 102, 103, 106, 110, 111, 112, 114, 115, 116, 121, 122, 123, 124, 125, 126, 127, 130, 131, 132, 133, 134, 135, 139, 143, 145, 146, 147, 148, 150, 151, 153, 154, 155, 157, 158, 159, 165, 168, 171, 174, 175, 176, 177, 184, 187, 189, 193, 200, 201, 202, 203, 204, 206, 207, 208, 209, 210, 211, 212, 217, 222, 223, 226, 230, 234, 235, 236, 238, 239, 240, 244, 245, 246, 248, 249, 250, 252, 253, 256, 258, 261, 262, 264, 267, 268, 269, 274, 275, 282, 283, 286, 287, 289, 292, 293, 294, 295, 300, 301, 302, 303, 305, 306, 307, 309, 313, 315, 316, 318, 319, 320, 321, 326, 327, 328, 329, 331, 333, 334, 335, 336, 338, 342, 343, 346, 348, 350, 351, 352, 353, 359, 360, 362, 364, 367, 368, 369, 370, 373, 375, 378, 379, 380, 383, 386, 387, 389, 390, 391, 392, 394, 395, 396, 398, 399, 400, 401, 402, 403, 404, 406, 408, 412, 415, 416, 417, 418, 419, 420, 423, 424, 425, 426, 428, 430, 431, 550, 551, 552, 553, 554, 555, 556, 557, 558, 559, 560, 561, 562, 563, 564, 565, 566, 567, 568, 580, 583, 597, 598, 623],
			2: [17, 28, 52, 84, 92, 105, 109, 129, 172, 190, 215, 257, 263, 332, 344, 361, 365, 405],
			3: [8, 24, 29, 42, 43, 47, 63, 75, 86, 96, 108, 113, 119, 120, 144, 149, 167, 192, 194, 199, 216, 224, 225, 227, 266, 270, 271, 285, 296, 297, 308, 345, 374, 407, 409, 410, 411, 413, 421, 432, 617, 618, 619, 620, 621],
			4: [77, 107, 138, 161, 185, 195, 197, 228, 229, 231, 242, 254, 255, 277, 280, 284, 291, 298, 299, 311, 312, 330, 337, 371, 372, 381, 382, 385, 427, 429, 570, 571, 572, 573, 574, 575, 576, 577, 578, 579, 581, 582, 584, 585, 586, 587, 588, 589, 592],
			5: [16, 37, 104, 118, 136, 140, 160, 173, 183, 186, 188, 220, 221, 232, 259, 314, 317, 366, 384, 397, 594, 595, 596, 600, 622],
			6: [128, 152, 169, 170, 205, 213, 272, 273, 323, 324, 422],
			7: [117, 247, 322, 358],
			8: [90, 162, 590, 591],
			9: [79, 219, 569],
			10: [7, 15, 30, 41, 48, 81, 82, 85, 93, 97, 99, 163, 164, 166, 178, 180, 181, 182, 191, 198, 214, 218, 241, 243, 251, 260, 288, 304, 310, 325, 339, 341, 347, 349, 354, 363, 376, 377, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479, 480, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 495, 497, 498, 499, 500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 531, 532, 533, 534, 535, 536, 537, 538, 539, 540, 541, 542, 543, 544, 545, 546, 547, 548, 549],
			11: [137, 141, 142, 179, 196, 278, 279, 281, 461, 481, 496],
			12: [233, 237, 276, 355],
			13: [265, 290, 340, 356, 357, 388, 414],
			14: [65, 66, 78, 156, 393],
			15: [593, 599, 601, 602, 603, 604, 605, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615, 616],
		},


		/**
		 * Maps the Protocol ID to a Protocol Name
		 * @param {number} id
		 * @returns {string} Protocol name
		 */
		getProtocolNameFromID : function(id) {
			var protocolName;
			protocolName = ( id in MMTDrop.constants.ProtocolsIDName) ? MMTDrop.constants.ProtocolsIDName[id] : 'NaP';
			return protocolName;
		},
		
		/**
		  * Return the path friendly name.
		  * @param {string} path application protocol path (given by application IDs)
		  */
		 getPathFriendlyName : function(path) {
			 var id = path.split(".");
			 var name = [];
			 for( var i=0; i<id.length; i++)
				 name.push( MMTDrop.constants.getProtocolNameFromID( id[i] ) );
			 
			 return name.join(".");
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
		 * Get Category ID of an application
		 * @param {number} appId - application Id
		 * @returns {number} - category Id
		 */
		getCategoryIdFromAppId : function( appId ){
			for (var i in MMTDrop.constants.CategoriesAppIdsMap){
				var arr = MMTDrop.constants.CategoriesAppIdsMap[i];
				if (arr.indexOf( appId ) > -1)
					return i;
			}
			return -1;
		},
		/**
		 * Maps the Protocol ID to a Protocol Name
		 * @param {number} id
		 * @returns {string} Protocol Name
		 */
		getCategoryNameFromID : function(id) {
			var protocolName;
			protocolName = ( id in MMTDrop.constants.CategoriesIdsMap) ? MMTDrop.constants.CategoriesIdsMap[id] : 'NaP';
			return protocolName;
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
			MINUTE : "minute",
			HOUR   : "hour",
			DAY    : "day",
			WEEK   : "week",
			MONTH  : "month",
		},
};


///////////////////////////////////////////////////////////////////////////////////////////
//Add some methods to general object 

//Do not add this prototype to Object.prototype. They may be called incidentally.
//These methodes can be fired automatically in some object (e.g., by: for var k in obj)
//e.g. $.ajax will try to fire all all methods (before submitting and after getting data to/from server)
///////////////////////////////////////////////////////////////////////////////////////////

/**
 * A set of support tools
 * @namespace
 */
MMTDrop.tools = function() {
	var _this = {};	//this = Window when this inside function(){ ... }();
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
		//obj1 = MMTDrop.tools.cloneData( obj1 );
		for (var p in obj2) {
			try {
				// Property in destination object set; update its value.
				if ( obj2[p].constructor == Object ) {
					obj1[p] = MMTDrop.tools.mergeObjects(obj1[p], obj2[p]);

				} else {
					obj1[p] = obj2[p];
				}

			} catch(e) {
				// Property in destination object not set; create it and set its value.
				obj1[p] = obj2[p];

			}
		}

		return obj1;
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
		var seen = [];
//		return JSON.parse( JSON.stringify (obj));
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
		var _prefix = function(){
			//each page has a separated parameter
			var pre = window.location.pathname;
			pre += window.location.search;
			
			return "mmtdrop." + pre + ".";
		};
		
		var _storage = window.localStorage;

//		check if browser supports localStorage
		try {
			_storage.setItem("test", "1");
			_storage.removeItem("test");
		} catch (error) {
//			parameters will be stocked into global variable @{fakeStorage}
//			==> this variable will remove when the page being reloaded
//			TODO set code for permanent storage
			window.fakeStorage = {};
			_storage = window.fakeStorage;
		}

		var _get = function (key){;

			return JSON.parse(_storage.getItem(_prefix() + key));
		};

		var _set = function(key, value){
			_storage.setItem(_prefix() + key, JSON.stringify(value));
		};

		var _remove = function (key){
			_storage.removeItem(_prefix() + key);
		};

		return {
			get   : _get,
			set   : _set,
			remove: _remove
		};
	}();


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
			throw new Error("Need data tobe an array");
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
			throw new Error("Need data tobe an array");

		var obj = {};

		for (var i=0; i<data.length; i++){
			var msg = data[i];

			for (var key in msg){
				//check if key existing in colSums
				if (MMTDrop.tools.inArray(key, colSums) == -1)
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
		
		colsToGroup = colsToGroup.slice(0);	//clone colsToGroup
		var col = colsToGroup.shift();	    //remove the first elem
		
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

	return _this;
}();


///////////////////////////////////////////////////////////////////////////////////////////
//class MMTDrop.Database
//get data from database via MMT-Operator
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
	//	throw new Error("Cannot instantiate abstract class MMTDrop.Database\n" +
	//			"Try with MMTDrop.Database.Traffic/Flow/Raw or create a new one!");
	//}
	if( isAutoLoad ==undefined )
		isAutoLoad = false;
	
	var _serverURL = MMTDrop.config.serverURL || "http://localhost:8088";
	if (_serverURL.substring(_serverURL.length - 1, 1) === "/")
		_serverURL += "traffic/data";
	else
		_serverURL += "/traffic/data";

	var _param = param || {};
	var _data = [];		    //it is data getting from MMT-Operator and it can    be modified during using of this object
	var _originalData = []; //it is data getting from MMT-Operator and it cannot be modified
	var _this = this;		//pointer using in private methods

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
			if(isAutoLoad && _data.length == 0)
				this.reload();
			
			return _data ;
		}
		//do something here
		_data = val;
		return this;
	};

	/**
	 * Reload data from MMT-Operator.
	 * @param {DatabaseParam} [new_param=null] - a new parameter of database. 
	 * The new parameter will merge with the current one of the database.
	 * @see {@link MMTDrop.tools#mergeObjects} 
	 */
	this.reload = function(new_param){
		if (new_param)
			_param = MMTDrop.tools.mergeObjects(_param, new_param);

		console.log(" - reload database: " + JSON.stringify(_param));

		_originalData = _get (_param);
		if (typeof(dataProcessingFn) == "function"){
			_originalData = dataProcessingFn(_originalData);
		}
		this.reset();
	};

	/**
	 * This resets any changes of data.
	 */
	this.reset = function(){
		if (_originalData){
			_data = MMTDrop.tools.cloneData(_originalData);
		}
	};

	
	var _callbacks = [];
	var _socket    = null;
	
	/**
	 * Register a callback when receiving a new message in realtime from MMT-Operator.
	 * 
	 * @param {function} callback The callback will be passed two paramenters: the received message and the <code>userData</code> 
	 * @param {object} userData
	 */
	this.onMessage = function( callback, userData ){
		if(MMTDrop.tools.isFunction( callback ))
			_callbacks.push( {callback: callback, data: userData} );
		
		if( _socket == null){
			_socket = new io.connect(MMTDrop.config.serverURL);
			
			_socket.on("stats_raw", function( msg ){
				//update database with new message
				//_originalData.shift();
				_originalData.push( msg );
				
				//fire callbacks
				for( var i=0; i<_callbacks.length; i++){
					var fn = _callbacks[i];
					fn.callback( msg, fn.data );
				}
					
			});
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
		stat.filter = function( criteria ){
			var arr = [];
			var data = _this.data();
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
	function _get(param, callback) {
		// asyn
		if (callback) {
			$.ajax({
				url  : _serverURL,
				type : "GET",
				dataType : "json",
				data  : param,
				cache : false,

				error : callback.error, // (xhr, status, error),
				success : function(data) {
					callback.sucess(data);
				}
			});
			return;
		}


		var data = {};
		$.ajax({
			url  : _serverURL,
			type : "GET",
			dataType : "json",
			data  : param,
			cache : false,
			async : false,
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
			param.format = MMTDrop.constants.CsvFormat.STATS_FORMAT;

			var db = new MMTDrop.Database(param, function (data){
				
				return data;
			}, 
			isAutoLoad);

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
				var appId = 0;
				var catId = -1;
				for (var i=0; i<data.length; i++){
					appId = data[i][MMTDrop.constants.StatsColumn.APP_ID.id];
					catId = MMTDrop.constants.getCategoryIdFromAppId( appId );

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
			param.format = 0;

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
//end MMTDrop.Database
///////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////
//MMTDrop.Filter
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
	//database attached to this filter
	var _database = null;

	var _option = {};
	var _this = this;
    this.getId = function(){
        return param.id;
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
		var fdiv =       $('<div>',  {class: 'input-group '});
		var span =       $('<span>', {class: 'input-group-addon', text: param.label});
		var filter =     $('<select>',{class: "form-control",     id  : param.id});

		span.appendTo( fdiv );
		filter.appendTo( fdiv );
		fdiv.appendTo(fcontainer);
		fcontainer.appendTo($('#' + elemID));

		//add a list of options to the filter
		_this.option( param.options );
		_this.redraw();

		//handle when the filter changing
		filter.change(function(e){

			_currentSelectedOption = _option[this.selectedIndex]; 	//the selected option of the filter
			
			console.log(param.label + " - selection index change: " + JSON.stringify( _currentSelectedOption ));
			
			//save the current selected index
			MMTDrop.tools.localStorage.set(param.id, _currentSelectedOption);
			
			//applying the filter to the current selection
			_filter();
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
		    for (var i in _option){
			    if (opt.id == _option[i].id){
                    MMTDrop.tools.localStorage.set(param.id, _option[i]);
    				break;
    			}
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
				value: _option[i].id
			});
			opt.appendTo(filter);
		}
		
		var defaultOption = MMTDrop.tools.localStorage.get(param.id);
		var isExist = false;
		
		//check if the defaultOption is in the current option list
		for (var i in _option){
			if (defaultOption != null && defaultOption.id == _option[i].id){
				isExist = true;
				break;
			}
		}
		//if not, set default is the first option in the list
		if( isExist == false )
			for (var i in _option){
				defaultOption = _option[i];
				break;
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

				console.log("filtering " + param.label + " [" + JSON.stringify(_currentSelectedOption) + "] on database (" + 
						_database.data().length + " records)");

				filterFn(_currentSelectedOption, _database);

				console.log("  - retained " + _database.data().length + " records");

				//annonce to its callback registors
				for (var i in _onFilterCallbacks){
					var callback = _onFilterCallbacks[i];
					callback[0](_currentSelectedOption, _database, callback[1]);
				}
			}
		}
		else 
			throw new Error ("You need to implement how it filters data");
	};
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
			}, 
			function (val, db){
				//how it filters database when the current selected option is @{val}

			}
			);
			return filter;
		},

		
		/**
		 * Create a period filter for any database.
		 * This filter will <code>reload</code> its database with a new <code>period</code> parameter, see {@link MMTDrop.Database#reload}.
		 * The list of options is defined by {@link MMTDrop.constants.period}
		 * @returns {MMTDrop.Filter} filter
		 */
		createPeriodFilter : function(){
			var filterID    = "period_filter" + MMTDrop.tools.getUniqueNumber();
            var periods     = MMTDrop.constants.period;
            var periodLabel = {};
    		periodLabel[periods.MINUTE] = "Last 5 minutes";
			periodLabel[periods.HOUR]   = "Last hour";
			periodLabel[periods.DAY]    = "Last 24 hours";
			periodLabel[periods.WEEK]   = "Last 7 days";
			periodLabel[periods.MONTH]  = "Last 30 days";
			//create a list of options from predefined MMTDrop.period
			var options = [];
			for (var k in MMTDrop.constants.period){
				var key = MMTDrop.constants.period[k];
				options.push({id:  key, label: periodLabel[key]});
			}
			
			//var otherOpt = { id: "00", label: "Other"};
			
			//options.push( otherOpt );
			var filter =  new MMTDrop.Filter({
				id      : filterID,
				label   : "Period",
				options : options,
			}, 

			function (val, db){
				//how it filters database when the current selected option is @{val}	
				//It reloads data from MMT-Operator
				var param = {period:val.id};
				db.reload(param);

				console.log("Got " + db.data().length + " from DB");
			});
			
            filter.otherOpt = {};
            
			filter._renderTo = filter.renderTo;
			filter.renderTo = function( elemID ){
				filter._renderTo( elemID );
				
				
				var $cal = $('<div id="'+ filterID +'-datepicker" class="datepicker-icon input-group-addon"> <span class="glyphicon glyphicon-calendar"/></div>');
				$cal.appendTo( $("#" + filterID + "_container .input-group") );
				
				$cal.on("click", function(){
                    if( filter.datepicker == undefined )
					    filter.datepicker = new DatePicker( "#" + filterID + "-datepicker", function( d1, d2 ){
						    if( d1 == undefined )
                                return;
                            if( filter.otherOpt.id == undefined )
                                filter.option().push( filter.otherOpt );
                            
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
						var parentApp       = MMTDrop.constants.getAppIdFromPath( parentKey );
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
                var user_col_id = MMTDrop.constants.StatsColumn.MAC_SRC.id;
                
                var format = MMTDrop.constants.CsvFormat.STATS_FORMAT;
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
				label   : "Class",
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
			var options = [{id: csv.STATS_FORMAT,            label: "Protocol"},
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
				console.log("Got " + db.data().length + " from DB");
			});

			return filter;
        }
};
///////////////////////////////////////////////////////////////////////////////////////////
//end MMTDrop.Filter
///////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////
//MMTDrop.Report
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
	_this.title = title;
    _this.filters = filters;
    _this.groupCharts = groupCharts;
    _this.dataFlow = dataFlow;
    
    _this.callback = [];
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
		$elemID.html("");
		
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

		for (var i in filters)
			filters[i].attachTo(database);

		//filter for the first element that is either a filter or a chart
		var filter = MMTDrop.tools.getFirstElement(dataFlow);
		if(!filter)
			return;
		if( filter.autoTrigger === true ){
	    	filter = filter.object;
		    if (filter instanceof MMTDrop.Filter)
			    filter.filter();
    		else if(filter)
	    		filter.renderTo( filter.htmlID, database.data() );
        
        }
        
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
			var fMetric	= MMTDrop.filterFactory.createMetricFilter();
			
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
						keys.push( s );	//list of apps will be appended data
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
				if( msg[MMTDrop.constants.StatsColumn.FORMAT_ID.id] != MMTDrop.constants.CsvFormat.STATS_FORMAT)
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
				if( msg[COL.FORMAT_ID.id ] == MMTDrop.constants.CsvFormat.STATS_FORMAT )
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
			var fMetric	 = MMTDrop.filterFactory.createMetricFilter();
			
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
			var fMetric	 = MMTDrop.filterFactory.createMetricFilter();
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
			var fMetric	 = MMTDrop.filterFactory.createMetricFilter();
			
			
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
								msg[COL.APP_PATH.id] = path;	//donot need add its grand parent name
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
							msg.label = path;	//donot need add its grand father name
							
							//not root
							if (path.indexOf("/") > 1){
								obj.columns[i].type = "area";	//area-spline
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
			var fMetric	 = MMTDrop.filterFactory.createFlowMetricFilter();
			
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
			var fMetric	 = MMTDrop.filterFactory.createFlowMetricFilter();
			
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
				if( format == con.CsvFormat.STATS_FORMAT ){
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
//end MMTDrop.Report
///////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////
//MMTDrop.Chart
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
			columns : [],	//columns to show and its header labels
	};

	var _elemID = null;
	var _this   = this;
	var _database  = null;
	var _data      = []; 	//that is a copy of _database.data() at the moment of executing this.attachTo
	var _isCopyData= false; //whether _database.data() is copied to _data
	var _isVisible = true;

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
		$('#' + _elemID).html('');
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
		if( _isCopyData )
			_data = MMTDrop.tools.cloneData( _data );
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

			//opt can be changed in this function
			var data = _prepareData( _option, _data, _database );
			
			if( _option.columns.length == 0){
				//throw new Error("   no columns to render" );
                console.log( " no column to render ");
                return;
			}
			
			if( data.length == 0){
				console.log( "   no data");
			}
			
			this.chart = renderFn(_elemID, _option, data);
            
            if( MMTDrop.tools.isFunction( _option.afterRender )  ){
                _option.afterRender( _this );
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
				var oldData = db.data();	//a copy of current data of _database
				db.data( _data );		//set database to the moment this.attachTo
			
				obj = opt.getData.getDataFn( db, arg );
			
				db.data( oldData );		//reset to its data
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
						columns: arrData
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
					}
				};
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
				
				for (var i=0; i<arrData.length; i++){
					var msg = arrData[i];

					var name = msg[0];
					//the first column is categorie, the next ones are series
					//seriesSize is used in plotOptions
					for (var j=1; j<msg.length; j++){
						series[j-1].data.push( {name: name, y: msg[j],  seriesSize: nSeries} );
					}
				}

			        console.log( arrData );
			        var chart_opt = {
			        		bindto : "#" + elemID,
			        		data : {
			        			columns: arrData,
			        			type: "pie"
			        		},
			        		
			        };
			        var chart = c3.generate( chart_opt );
			        return chart;
			});

			chart.getIcon = function(){
				return $('<i>', {'class': 'fa fa-pie-chart'});
			};
			return chart;
		},


		/**
		 * Create Timeline Chart
		 * @param {ChartParam} param
		 * @returns {MMTDrop.Chart} chart
		 */
		createTimeline : function (param, type){
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
							for( var k=0; k<probes.length; k++)	{
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
				
				//sort by the first column
				arrData.sort( function (a, b){
					return a[0] - b[0];
				});
				
				var obj = [];
				var n   = columns.length;
				//the first column is timestamp
				for (var i=0; i<arrData.length; i++){
					var x = new Date( parseInt(arrData[i][0]) );
					
					for( var j=1; j<n; j++){
						
						var val = arrData[i][j];
						if( val === undefined )
							//continue;
                            val = 0;
						
						if( obj[j] === undefined ){
							obj[j]     = ["x-" + columns[j].label];
							obj[j+n-1] = [ columns[j].label];
						}
						
						obj[j].push( x );
						obj[j+n-1].push( val );
							
					}
				}
				//as j starts from 1 ==> obj starts from 1
				// I will remove the first index of obj
				obj.shift();
				
				var ylabel = option.ylabel;
				
				//pair y==>x
				var xs = {};
				for (var j=1; j<columns.length; j++){
					xs[columns[j].label] = "x-" + columns[j].label;
				}
				
				var groups = [];
				for (var j=1; j<columns.length; j++){
					//not root
					//if( columns[j].label.indexOf("/") > 0 )
                    if( columns[j].type == "area" )
						groups.push( columns[j].label );
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
				
		        var chart_opt = {
		        		bindto : "#" + elemID,
		        		data : {
		        			xs: xs,
		        			columns: obj,
		        			type   : (type === "scatter")? type:  "",
		        			types  : types,
		        			groups : [ groups ],
                            //order  : 'desc' // stack order by sum of values descendantly. this is default.
                            //order: 'asc'  // stack order by sum of values ascendantly.
                            order: null   // stack order by data definition.
		        		},
		        		axis: {
		        			x: {
		        				type: "timeseries",
		        				tick: {
		        					format: function( v ){
		      	                	  return v.getHours() + ":" + v.getMinutes() + ":" + v.getSeconds() +  (v.getMilliseconds() == 0 ? "": " " + v.getMilliseconds());
		        					},
		        	                count : 10,
		        	            }
		        			},
		        			y: {
		        				label: ylabel,
                                count: 10,
		        				min: 0,
		        				padding: {
                                  top: 10,
                                  bottom: 10
                                },
		        				tick: {
		        					format: function( v ){
		        						if( v >= 1000000000 )
		        							return (v/1000000000).toPrecision(2) + "G";
		        						if( v >= 1000000 )
		        							return (v/1000000).toPrecision(2) + "M";
		        						if( v >= 1000 )
		        							return Math.round(v/1000) + "k";
		        						return Math.round(v);
		        					}
		        				}
		        			}
		        		},
		        		tooltip:{
		        			format: {
		        				title: function( v ){ 
		        					return v.getFullYear() + "-" + (v.getMonth() + 1) + "-" + v.getDate() + " " + 
	      	                	  	v.getHours() + ":" + v.getMinutes() + ":" + v.getSeconds() +  (v.getMilliseconds() == 0 ? "": " " + v.getMilliseconds()); 
		        					}
		        			}
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
		        			r: (type === "scatter")? 3 : 1,
		        			focus: {
		        			    expand: {
		        			    	r: 5
		        			    }
		        			}
		        		},
		        		line: {
		      	    	  connectNull: true
		      	    	},
		      	    	zoom: {
		      	          enabled: true,
		      	          rescale: true
		      	      }
		        };
		        //console.log( chart_opt );
                if( param.chart )
                    chart_opt = MMTDrop.tools.mergeObjects( chart_opt, param.chart );
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
					'class' : 'report-element-tree'                                         
				});         

				treeWrapper.appendTo($('#' + elemID));

				var table = $('<table>', {
					'id' : elemID + '_treetable',
					'cellpadding' : 0,
					'cellspacing' : 0,
					'border'      : 0
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
						'text' : option.columns[i].label
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
				for (var i in arrData){

					//separate APP_PATH
					var path = arrData[i][0];
					var d = path.lastIndexOf(".");

					var name = path;
					var parent = null;
					if (d >= 0){
						name   = path.substring(d + 1);
						parent = path.substring(0, d);
					}
					name = MMTDrop.constants.getProtocolNameFromID(name);

					arrData[i][0] = {path: path, parent: parent, name: name};
				}

				//sort by path, then by name
				arrData.sort(function (a, b){
					if (a[0].parent === b[0].parent )
						return a[0].name > b[0].name ? 1: -1;

					return a[0].path > b[0].path ? 1 : -1;
				});

				//add each element to a row
				for (i in arrData) {
					var msg = arrData[i];

					var path   = msg[0].path;
					var name   = msg[0].name;
					var parent = msg[0].parent;

					//root
					var row_tr = $('<tr>', {
						'data-tt-id'        : path,
					});

					if (parent != null)
						row_tr = $('<tr>', {
							'data-tt-id'        : path,
							'data-tt-parent-id' : parent
						});

					//first column
					var row_name = $('<td>', {text: name});
					row_name.appendTo(row_tr);

					for (var j = 1; j < msg.length; j++) {
						if( option.columns[j].isMultiProbes == false){
							var cell = $('<td>', {
								text : msg[j],
								align: "right"
							});
							cell.appendTo(row_tr);
						}else{
							for( var k=0; k<option.columns[j].probes.length; k++){
								var prob = option.columns[j].probes[k];
								var val  = msg[j][ prob ];
								if( val == undefined )
									val = 0;
								
								var cell = $('<td>', {
									text : val,
									align: "right"
								});
								cell.appendTo(row_tr);
							}
						}
							
					}
					row_tr.appendTo(tbody);
				}

				tbody.appendTo(table);

				//convert table to tree
				table.treetable({
                    indent            : 10,
					expandable        : true, 
					initialState      : "expanded",	//expand all nodes
					//clickableNodeNames: true
				});

				//when user click on a row
				$("#" + elemID + "_treetable tbody tr").click({
					chart : this
				}, function(e) {
					//note:  this = selected row
					// Highlight selected row, if it was hightlight => un hightlight it
					$(this).toggleClass("selected");


					//if user regist to handle click event ==> give him the control
					if (option.click) {
						//get all selected rows
						var arr = [];
						var selectedRows = $('#' + elemID + "_treetable tbody tr").filter(".selected");
						selectedRows.each( function(){;
							var id = this.dataset["ttId"];
							arr.push( id );
						});
						option.click( arr, this );
					}
				});

				//click in the first 'tr' of the tree element
				$("#" + elemID + "_treetable tbody tr:first").trigger("click");
				
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
					'class'       : "table table-striped table-bordered"
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
				for (var i in arrData) {
					var msg = arrData[i];


					//root
					var row_tr = $('<tr>', {
					});


					//first column
					var row_name = $('<td>', {
                            style  : "cursor:pointer",
                        	'text' : msg[0] } );

					row_name.appendTo(row_tr);

					for (var j = 1; j < msg.length; j++) {
						if( option.columns[j].isMultiProbes == false){
							var cell = $('<td>', {
								text : msg[j],
								align: "right"
							});
							cell.appendTo(row_tr);
						}else{
							for( var k=0; k<option.columns[j].probes.length; k++){
								var prob = option.columns[j].probes[k];
								var val  = msg[j][ prob ];
								if( val == undefined )
									val = 0;
								
								var cell = $('<td>', {
									text : val,
									align: "right"
								});
								cell.appendTo(row_tr);
							}
						}
					}
					row_tr.appendTo(tbody);
				}

				tbody.appendTo(table);
                if( param.chart )
                   table.dataTable( param.chart );
                else
				   table.dataTable();
				
				//when user click on a row
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
//End MMTDrop.Chart
///////////////////////////////////////////////////////////////////////////////////////////

}(MMTDrop));

//Set default initial options for MMTDrop
MMTDrop.setOptions({});