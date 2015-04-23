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
		VERSION : "1.0.0",
};



(function(MMTDrop){
'use strict';


/**
 * Set global options
 */
MMTDrop.setOptions = function( opt ){
	MMTDrop.config = MMTDrop.tools.mergeObjects( MMTDrop.config, opt  );
	
	if( MMTDrop.config.highChart != undefined ){
		Highcharts.setOptions( MMTDrop.config.highChart );
	}
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
		 * Global option of highChart
		 */
		highChart: {
			global : {
				useUTC : false
			}
		}
};


/**
 * Constants using in the library.
 * It contains mainly constants for data format.
 * @namespace
 */
MMTDrop.constants = {
		/**
		 * @constant: MMTDrop defined csv format types
		 */
		CsvFormat : {
			DEFAULT_APP_FORMAT : 0/**< Default application flow report format id */,
			WEB_APP_FORMAT : 1/**< WEB flow report format id */,
			SSL_APP_FORMAT : 2/**< SSL flow report format id */,
			RTP_APP_FORMAT : 3/**< RTP flow report format id */,
			MICROFLOWS_STATS_FORMAT : 8/**< Micro flows statistics format id */,
			RADIUS_REPORT_FORMAT : 9/**< RADIUS protocol control format id */,
			STATS_FORMAT : 99/**< Statistics format id */,
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
		 * @constant: MMTDrop defined csv format types
		 */
		StatsColumn : {
			FORMAT_ID         : {id: 0,  label: "Format"}, /**< Index of the format id column */
			PROBE_ID          : {id: 1,  label: "Probe"}, /**< Index of the probe id column */
			SOURCE_ID         : {id: 2,  label: "Source"}, /**< Index of the data source id column */
			TIMESTAMP         : {id: 3,  label: "Timestamp"}, /**< Index of the format id column */
			APP_ID            : {id: 4,  label: "App"}, /**< Index of the application id column */
			APP_PATH          : {id: 5,  label: "App Path"}, /**< Index of the application path column */
			TOTAL_FLOWS       : {id: 6,  label: "Flows"}, /**< Index of the is_leaf column */
			ACTIVE_FLOWS      : {id: 7,  label: "Active Flows"}, /**< Index of the active flows column */
			DATA_VOLUME       : {id: 8,  label: "Data Volume"}, /**< Index of the data volume column */
			PAYLOAD_VOLUME    : {id: 9,  label: "Payload Volume"}, /**< Index of the payload data volume column */
			PACKET_COUNT      : {id: 10, label: "Packet Count"}, /**< Index of the packet count column */
			UL_DATA_VOLUME    : {id: 11, label: "UL Data Volume"}, /**< Index of the data volume column */
			UL_PAYLOAD_VOLUME : {id: 12, label: "UL Packet Count"}, /**< Index of the payload data volume column */
			UL_PACKET_COUNT   : {id: 13, label: "UL Packet Count"}, /**< Index of the packet count column */
			DL_DATA_VOLUME    : {id: 14, label: "DL Data Volume"}, /**< Index of the data volume column */
			DL_PAYLOAD_VOLUME : {id: 15, label: "DL Payload Volume"}, /**< Index of the payload data volume column */
			DL_PACKET_COUNT   : {id: 16, label: "DL Packet Count"}, /**< Index of the packet count column */
		},
    
		/**
		 * @constant: MMTDrop defined Flow based csv format (format 0, and common part of 1, 2, 3)
		 */
		FlowStatsColumn : {
			FORMAT_ID : {id: 0, label:""} , /**< Index of the format id column */
			PROBE_ID  : {id: 1, label:""}, /**< Index of the probe id column */
			SOURCE_ID : {id: 2, label:""}, /**< Index of the data source id column */
			TIMESTAMP : {id: 3, label:""}, /**< Index of the format id column */
			FLOW_ID   : {id: 4, label:""}, /**< Index of the flow id column */
			START_TIME  : {id: 5, label:""}, /**< Index of the flow start time */
			IP_VERSION  : {id: 6, label:""}, /**< Index of the IP version number column */
			SERVER_ADDR : {id: 7, label:""}, /**< Index of the server address column */
			CLIENT_ADDR : {id: 8, label:""}, /**< Index of the client address column */
			SERVER_PORT : {id: 9, label:""}, /**< Index of the server port column */
			CLIENT_PORT : {id: 10, label:""}, /**< Index of the client port column */
			TRANSPORT_PROTO : {id: 11, label:""}, /**< Index of the transport protocol identifier column */
			UL_PACKET_COUNT : {id: 12, label:""}, /**< Index of the uplink packet count column */
			DL_PACKET_COUNT : {id: 13, label:""}, /**< Index of the downlink packet count column */
			UL_DATA_VOLUME  : {id: 14, label:""}, /**< Index of the uplink data volume column */
			DL_DATA_VOLUME  : {id: 15, label:""}, /**< Index of the downlink data volume column */
			TCP_RTT         : {id: 16, label:""}, /**< Index of the TCP round trip time column */
			RETRANSMISSION_COUNT : {id: 17, label:""}, /**< Index of the retransmissions count column */
			APP_FAMILY    : {id: 18, label:""}, /**< Index of the application family column */
			CONTENT_CLASS : {id: 19, label:""}, /**< Index of the content class column */
			PROTO_PATH    : {id: 20, label:""}, /**< Index of the protocol path column */
			APP_NAME      : {id: 21, label:""}, /**< Index of the application name column */
			APP_FORMAT_ID : {id: 22, label:""}, /**< Index of the start of the application specific statistics (this is not a real column, rather an index) */
		},

		HttpStatsColumn : {
			RESPONSE_TIME      : {id: 0, label:""}, /**< Index of the response time column */
			TRANSACTIONS_COUNT : {id: 1, label:""}, /**< Index of the HTTP transactions count (req/res number) column */
			INTERACTION_TIME   : {id: 2, label:""}, /**< Index of the interaction time (between client and server) column */
			HOSTNAME     : {id: 3, label:""}, /**< Index of the hostname column */
			MIME_TYPE    : {id: 4, label:""}, /**< Index of the MIME type column */
			REFERER      : {id: 5, label:""}, /**< Index of the Referer column */
			DEVICE_OS_ID : {id: 6, label:""}, /**< Index of the device and operating system ids column */
			CDN_FLAG     : {id: 7, label:""}, /**< Index of the is CDN delivered column */
		},

		TlsStatsColumn : {
			SERVER_NAME : {id: 0, label:""}, /**< Index of the format id column */
			CDN_FLAG    : {id: 1, label:""}, /**< Index of the format id column */
		},

		RtpStatsColumn : {
			PACKET_LOSS_RATE       : {id: 0, label:""}, /**< Index of the format id column */
			PACKET_LOSS_BURSTINESS : {id: 1, label:""}, /**< Index of the format id column */
			MAX_JITTER             : {id: 2, label:""},
		},

		/**
		 * Constants: MMTDrop defined RTP flow metrics
		 */
		RTPMetricId : {
			PACKET_LOSS       : "Packet Loss", /**< Identifier of packet loss rate metric */
			PACKET_LOSS_BURST : "Loss Burstiness", /**< Identifier of packet loss burstiness metric */
			JITTER            : "Jitter", /**< Identifier of jitter metric */
			QUALITY_INDEX     : "Quality Index", /**< Identifier of quality index metric */
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

		FlowMetricFilter : {
			DATA_VOLUME    : {id: 101, label:"Data volume"},    //this column must be created (id not in FlowStatsColum)
			PACKET_COUNT   : {id: 102, label:"Packet count"},
			PAYLOAD_VOLUME : {id: 103, label:"Payload volume"}, 
			ACTIVE_FLOWS   : {id: 104, label:"Active flow"},
			UL_PACKET_COUNT: {id: 12, label:"UL Packet count"},	//this column is the one from FlowStatsColumn (id in FlowStatsColumn)
			DL_PACKET_COUNT: {id: 13, label:"DL Packet count"},
			UL_DATA_VOLUME : {id: 14, label:"UL Data volume"}, 
			DL_DATA_VOLUME : {id: 15, label:"DL Data volume"},
			FLOW_DURATION  : {id: 105, label:"Flow duration"}
		},
		

		/**
		 * Constants: Protocol Id,Name 
		 */
		ProtocolsIDName: {
			0: 'All', 2: '163', 3: '360', 4: '302_FOUND', 5: '360BUY', 6: '56', 7: '8021Q', 8: '888', 9: 'ABOUT', 10: 'ADCASH', 11: 'ADDTHIS', 12: 'ADF', 13: 'ADOBE', 14: 'AFP', 15: 'AH', 16: 'AIM', 17: 'AIMINI', 18: 'ALIBABA', 19: 'ALIPAY', 20: 'ALLEGRO', 21: 'AMAZON', 22: 'AMEBLO', 23: 'ANCESTRY', 24: 'ANGRYBIRDS', 25: 'ANSWERS', 26: 'AOL', 27: 'APPLE', 28: 'APPLEJUICE', 29: 'ARMAGETRON', 30: 'ARP', 31: 'ASK', 32: 'AVG', 33: 'AVI', 34: 'AWEBER', 35: 'AWS', 36: 'BABYLON', 37: 'BADOO', 38: 'BAIDU', 39: 'BANKOFAMERICA', 40: 'BARNESANDNOBLE', 41: 'BATMAN', 42: 'BATTLEFIELD', 43: 'BATTLENET', 44: 'BBB', 45: 'BBC_ONLINE', 46: 'BESTBUY', 47: 'BETFAIR', 48: 'BGP', 49: 'BIBLEGATEWAY', 50: 'BILD', 51: 'BING', 52: 'BITTORRENT', 53: 'BLEACHERREPORT', 54: 'BLOGFA', 55: 'BLOGGER', 56: 'BLOGSPOT', 57: 'BODYBUILDING', 58: 'BOOKING', 59: 'CBSSPORTS', 60: 'CENT', 61: 'CHANGE', 62: 'CHASE', 63: 'CHESS', 64: 'CHINAZ', 65: 'CITRIX', 66: 'CITRIXONLINE', 67: 'CLICKSOR', 68: 'CNN', 69: 'CNZZ', 70: 'COMCAST', 71: 'CONDUIT', 72: 'COPYSCAPE', 73: 'CORREIOS', 74: 'CRAIGSLIST', 75: 'CROSSFIRE', 76: 'DAILYMAIL', 77: 'DAILYMOTION', 78: 'DCERPC', 79: 'DIRECT_DOWNLOAD_LINK', 80: 'DEVIANTART', 81: 'DHCP', 82: 'DHCPV6', 83: 'DIGG', 84: 'DIRECTCONNECT', 85: 'DNS', 86: 'DOFUS', 87: 'DONANIMHABER', 88: 'DOUBAN', 89: 'DOUBLECLICK', 90: 'DROPBOX', 91: 'EBAY', 92: 'EDONKEY', 93: 'EGP', 94: 'EHOW', 95: 'EKSISOZLUK', 96: 'ELECTRONICSARTS', 97: 'ESP', 98: 'ESPN', 99: 'ETHERNET', 100: 'ETSY', 101: 'EUROPA', 102: 'EUROSPORT', 103: 'FACEBOOK', 104: 'FACETIME', 105: 'FASTTRACK', 106: 'FC2', 107: 'FEIDIAN', 108: 'FIESTA', 109: 'FILETOPIA', 110: 'FIVERR', 111: 'FLASH', 112: 'FLICKR', 113: 'FLORENSIA', 114: 'FOURSQUARE', 115: 'FOX', 116: 'FREE', 117: 'FTP', 118: 'GADUGADU', 119: 'GAMEFAQS', 120: 'GAMESPOT', 121: 'GAP', 122: 'GARANTI', 123: 'GAZETEVATAN', 124: 'GIGAPETA', 125: 'GITHUB', 126: 'GITTIGIDIYOR', 127: 'GLOBO', 128: 'GMAIL', 129: 'GNUTELLA', 130: 'GOOGLE_MAPS', 131: 'GO', 132: 'GODADDY', 133: 'GOO', 134: 'GOOGLE', 135: 'GOOGLE_USER_CONTENT', 136: 'GOSMS', 137: 'GRE', 138: 'GROOVESHARK', 139: 'GROUPON', 140: 'GTALK', 141: 'GTP', 142: 'GTP2', 143: 'GUARDIAN', 144: 'GUILDWARS', 145: 'HABERTURK', 146: 'HAO123', 147: 'HEPSIBURADA', 148: 'HI5', 149: 'HALFLIFE2', 150: 'HOMEDEPOT', 151: 'HOOTSUITE', 152: 'HOTMAIL', 153: 'HTTP', 154: 'HTTP_CONNECT', 155: 'HTTP_PROXY', 156: 'HTTP_APPLICATION_ACTIVESYNC', 157: 'HUFFINGTON_POST', 158: 'HURRIYET', 159: 'I23V5', 160: 'IAX', 161: 'ICECAST', 162: 'APPLE_ICLOUD', 163: 'ICMP', 164: 'ICMPV6', 165: 'IFENG', 166: 'IGMP', 167: 'IGN', 168: 'IKEA', 169: 'IMAP', 170: 'IMAPS', 171: 'INTERNET_MOVIE_DATABASE', 172: 'IMESH', 173: 'IMESSAGE', 174: 'IMGUR', 175: 'INCREDIBAR', 176: 'INDIATIMES', 177: 'INSTAGRAM', 178: 'IP', 179: 'IP_IN_IP', 180: 'IPP', 181: 'IPSEC', 182: 'IPV6', 183: 'IRC', 184: 'IRS', 185: 'APPLE_ITUNES', 186: 'UNENCRYPED_JABBER', 187: 'JAPANPOST', 188: 'KAKAO', 189: 'KAT', 190: 'KAZAA', 191: 'KERBEROS', 192: 'KING', 193: 'KOHLS', 194: 'KONGREGATE', 195: 'KONTIKI', 196: 'L2TP', 197: 'LASTFM', 198: 'LDAP', 199: 'LEAGUEOFLEGENDS', 200: 'LEGACY', 201: 'LETV', 202: 'LINKEDIN', 203: 'LIVE', 204: 'LIVEDOOR', 205: 'LIVEMAIL', 206: 'LIVEINTERNET', 207: 'LIVEJASMIN', 208: 'LIVEJOURNAL', 209: 'LIVESCORE', 210: 'LIVINGSOCIAL', 211: 'LOWES', 212: 'MACYS', 213: 'MAIL_RU', 214: 'MANET', 215: 'MANOLITO', 216: 'MAPLESTORY', 217: 'MATCH', 218: 'MDNS', 219: 'MEDIAFIRE', 220: 'MEEBO', 221: 'MGCP', 222: 'MICROSOFT', 223: 'MILLIYET', 224: 'MINECRAFT', 225: 'MINICLIP', 226: 'MLBASEBALL', 227: 'MMO_CHAMPION', 228: 'MMS', 229: 'MOVE', 230: 'MOZILLA', 231: 'MPEG', 232: 'MSN', 233: 'MSSQL', 234: 'MULTIPLY', 235: 'MYNET', 236: 'MYSPACE', 237: 'MYSQL', 238: 'MYWEBSEARCH', 239: 'NBA', 240: 'NEOBUX', 241: 'NETBIOS', 242: 'NETFLIX', 243: 'NETFLOW', 244: 'NEWEGG', 245: 'NEWSMAX', 246: 'NFL', 247: 'NFS', 248: 'NICOVIDEO', 249: 'NIH', 250: 'NORDSTROM', 251: 'NTP', 252: 'NYTIMES', 253: 'ODNOKLASSNIKI', 254: 'OFF', 255: 'OGG', 256: 'ONET', 257: 'OPENFT', 258: 'ORANGEDONKEY', 259: 'OSCAR', 260: 'OSPF', 261: 'OUTBRAIN', 262: 'OVERSTOCK', 263: 'PANDO', 264: 'PAYPAL', 265: 'PCANYWHERE', 266: 'PCH', 267: 'PCONLINE', 268: 'PHOTOBUCKET', 269: 'PINTEREST', 270: 'PLAYSTATION', 271: 'POGO', 272: 'POP', 273: 'POPS', 274: 'POPO', 275: 'PORNHUB', 276: 'POSTGRES', 277: 'PPLIVE', 278: 'PPP', 279: 'PPPOE', 280: 'PPSTREAM', 281: 'PPTP', 282: 'PREMIERLEAGUE', 283: 'QQ', 284: 'QQLIVE', 285: 'QUAKE', 286: 'QUICKTIME', 287: 'R10', 288: 'RADIUS', 289: 'RAKUTEN', 290: 'RDP', 291: 'REALMEDIA', 292: 'REDDIT', 293: 'REDTUBE', 294: 'REFERENCE', 295: 'RENREN', 296: 'ROBLOX', 297: 'ROVIO', 298: 'RTP', 299: 'RTSP', 300: 'SABAHTR', 301: 'SAHIBINDEN', 302: 'SALESFORCE', 303: 'SALON', 304: 'SCTP', 305: 'SEARCHNU', 306: 'SEARCH_RESULTS', 307: 'SEARS', 308: 'SECONDLIFE', 309: 'SECURESERVER', 310: 'SFLOW', 311: 'SHAZAM', 312: 'SHOUTCAST', 313: 'SINA', 314: 'SIP', 315: 'SITEADVISOR', 316: 'SKY', 317: 'SKYPE', 318: 'SKYROCK', 319: 'SKYSPORTS', 320: 'SLATE', 321: 'SLIDESHARE', 322: 'SMB', 323: 'SMTP', 324: 'SMTPS', 325: 'SNMP', 326: 'SOCRATES', 327: 'SOFTONIC', 328: 'SOGOU', 329: 'SOHU', 330: 'SOPCAST', 331: 'SOSO', 332: 'SOULSEEK', 333: 'SOUNDCLOUD', 334: 'SOURGEFORGE', 335: 'SPIEGEL', 336: 'SPORX', 337: 'SPOTIFY', 338: 'SQUIDOO', 339: 'SSDP', 340: 'SSH', 341: 'SSL', 342: 'STACK_OVERFLOW', 343: 'STATCOUNTER', 344: 'STEALTHNET', 345: 'STEAM', 346: 'STUMBLEUPON', 347: 'STUN', 348: 'SULEKHA', 349: 'SYSLOG', 350: 'TAGGED', 351: 'TAOBAO', 352: 'TARGET', 353: 'TCO', 354: 'TCP', 355: 'TDS', 356: 'TEAMVIEWER', 357: 'TELNET', 358: 'TFTP', 359: 'THEMEFOREST', 360: 'THE_PIRATE_BAY', 361: 'THUNDER', 362: 'TIANYA', 363: 'TLS', 364: 'TMALL', 365: 'TORRENTZ', 366: 'TRUPHONE', 367: 'TUBE8', 368: 'TUDOU', 369: 'TUENTI', 370: 'TUMBLR', 371: 'TVANTS', 372: 'TVUPLAYER', 373: 'TWITTER', 374: 'UBI', 375: 'UCOZ', 376: 'UDP', 377: 'UDPLITE', 378: 'UOL', 379: 'USDEPARTMENTOFSTATE', 380: 'USENET', 381: 'USTREAM', 382: 'HTTP_APPLICATION_VEOHTV', 383: 'VIADEO', 384: 'VIBER', 385: 'VIMEO', 386: 'VK', 387: 'VKONTAKTE', 388: 'VNC', 389: 'WALMART', 390: 'WARRIORFORUM', 391: 'WAYN', 392: 'WEATHER', 393: 'WEBEX', 394: 'WEEKLYSTANDARD', 395: 'WEIBO', 396: 'WELLSFARGO', 397: 'WHATSAPP', 398: 'WIGETMEDIA', 399: 'WIKIA', 400: 'WIKIMEDIA', 401: 'WIKIPEDIA', 402: 'WILLIAMHILL', 403: 'WINDOWSLIVE', 404: 'WINDOWSMEDIA', 405: 'WINMX', 406: 'WINUPDATE', 407: 'WORLD_OF_KUNG_FU', 408: 'WORDPRESS_ORG', 409: 'WARCRAFT3', 410: 'WORLDOFWARCRAFT', 411: 'WOWHEAD', 412: 'WWE', 413: 'XBOX', 414: 'XDMCP', 415: 'XHAMSTER', 416: 'XING', 417: 'XINHUANET', 418: 'XNXX', 419: 'XVIDEOS', 420: 'YAHOO', 421: 'YAHOOGAMES', 422: 'YAHOOMAIL', 423: 'YANDEX', 424: 'YELP', 425: 'YOUKU', 426: 'YOUPORN', 427: 'YOUTUBE', 428: 'ZAPPOS', 429: 'ZATTOO', 430: 'ZEDO', 431: 'ZOL', 432: 'ZYNGA', 433: '3PC', 434: 'ANY_0HOP', 435: 'ANY_DFS', 436: 'ANY_HIP', 437: 'ANY_LOCAL', 438: 'ANY_PES', 439: 'ARGUS', 440: 'ARIS', 441: 'AX_25', 442: 'BBN_RCC_MON', 443: 'BNA', 444: 'BR_SAT_MON', 445: 'CBT', 446: 'CFTP', 447: 'CHAOS', 448: 'COMPAQ_PEER', 449: 'CPHB', 450: 'CPNX', 451: 'CRTP', 452: 'CRUDP', 453: 'DCCP', 454: 'DCN_MEAS', 455: 'DDP', 456: 'DDX', 457: 'DGP', 458: 'EIGRP', 459: 'EMCON', 460: 'ENCAP', 461: 'ETHERIP', 462: 'FC', 463: 'FIRE', 464: 'GGP', 465: 'GMTP', 466: 'HIP', 467: 'HMP', 468: 'I_NLSP', 469: 'IATP', 470: 'IDPR', 471: 'IDPR_CMTP', 472: 'IDRP', 473: 'IFMP', 474: 'IGP', 475: 'IL', 476: 'IPCOMP', 477: 'IPCV', 478: 'IPLT', 479: 'IPPC', 480: 'IPTM', 481: 'IPX_IN_IP', 482: 'IRTP', 483: 'IS_IS', 484: 'ISO_IP', 485: 'ISO_TP4', 486: 'KRYPTOLAN', 487: 'LARP', 488: 'LEAF_1', 489: 'LEAF_2', 490: 'MERIT_INP', 491: 'MFE_NSP', 492: 'MHRP', 493: 'MICP', 494: 'MOBILE', 495: 'MOBILITY_HEADER', 496: 'MPLS_IN_IP', 497: 'MTP', 498: 'MUX', 499: 'NARP', 500: 'NETBLT', 501: 'NSFNET_IGP', 502: 'NVP_II', 503: 'PGM', 504: 'PIM', 505: 'PIPE', 506: 'PNNI', 507: 'PRM', 508: 'PTP', 509: 'PUP', 510: 'PVP', 511: 'QNX', 512: 'RSVP', 513: 'RSVP_E2E_IGNORE', 514: 'RVD', 515: 'SAT_EXPAK', 516: 'SAT_MON', 517: 'SCC_SP', 518: 'SCPS', 519: 'SDRP', 520: 'SECURE_VMTP', 521: 'SHIM6', 522: 'SKIP', 523: 'SM', 524: 'SMP', 525: 'SNP', 526: 'SPRITE_RPC', 527: 'SPS', 528: 'SRP', 529: 'SSCOPMCE', 530: 'ST', 531: 'STP', 532: 'SUN_ND', 533: 'SWIPE', 534: 'TCF', 535: 'TLSP', 536: 'TP_PP', 537: 'TRUNK_1', 538: 'TRUNK_2', 539: 'UTI', 540: 'VINES', 541: 'VISA', 542: 'VMTP', 543: 'VRRP', 544: 'WB_EXPAK', 545: 'WB_MON', 546: 'WSN', 547: 'XNET', 548: 'XNS_IDP', 549: 'XTP', 550: 'BUZZNET', 551: 'COMEDY', 552: 'RAMBLER', 553: 'SMUGMUG', 554: 'ARCHIEVE', 555: 'CITYNEWS', 556: 'SCIENCESTAGE', 557: 'ONEWORLD', 558: 'DISQUS', 559: 'BLOGCU', 560: 'EKOLEY', 561: '500PX', 562: 'FOTKI', 563: 'FOTOLOG', 564: 'JALBUM', 565: 'LOCKERZ', 566: 'PANORAMIO', 567: 'SNAPFISH', 568: 'WEBSHOTS', 569: 'MEGA', 570: 'VIDOOSH', 571: 'AFREECA', 572: 'WILDSCREEN', 573: 'BLOGTV', 574: 'HULU', 575: 'MEVIO', 576: 'LIVESTREAM', 577: 'LIVELEAK', 578: 'DEEZER', 579: 'BLIPTV', 580: 'BREAK', 581: 'CITYTV', 582: 'COMEDYCENTRAL', 583: 'ENGAGEMEDIA', 584: 'SCREENJUNKIES', 585: 'RUTUBE', 586: 'SEVENLOAD', 587: 'MUBI', 588: 'IZLESENE', 589: 'VIDEO_HOSTING', 590: 'BOX', 591: 'SKYDRIVE', 592: '7DIGITAL', 593: 'CLOUDFRONT', 594: 'TANGO', 595: 'WECHAT', 596: 'LINE', 597: 'BLOOMBERG', 598: 'MSCDN', 599: 'AKAMAI', 600: 'YAHOOMSG', 601: 'BITGRAVITY', 602: 'CACHEFLY', 603: 'CDN77', 604: 'CDNETWORKS', 605: 'CHINACACHE', 606: 'COTENDO', 607: 'EDGECAST', 608: 'FASTLY', 609: 'HIGHWINDS', 610: 'INTERNAP', 611: 'LEVEL3', 612: 'LIMELIGHT', 613: 'MAXCDN', 614: 'NETDNA', 615: 'VOXEL', 616: 'RACKSPACE', 617: 'GAMEFORGE', 618: 'METIN2', 619: 'OGAME', 620: 'BATTLEKNIGHT', 621: '4STORY', 622: 'FBMSG', 623: 'GCM',
		},

		CategoriesIdsMap: {
			0:'All', 1:'Web', 2:'P2P', 3:'Gaming', 4:'Streaming', 5:'Conversational', 6:'Mail', 7:'FileTransfer', 8:'CloudStorage', 9:'DirectDownloadLink', 10:'Network', 11:'Tunnelling', 12:'DataBase', 13:'Remote', 14:'Misc', 15:'CDN'
		},

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
		 * @returns {string} Protocol Name
		 */
		getProtocolNameFromID : function(id) {
			var protocolName;
			protocolName = ( id in MMTDrop.constants.ProtocolsIDName) ? MMTDrop.constants.ProtocolsIDName[id] : 'NaP';
			return protocolName;
		},
		
		/**
		  * Return the path friendly name. <br>
		  * @param path application protocol path (given by application IDs)
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
				 var child = path.substring(n + 1);
				 return child;
			 }
		 },
		 
		 /**
		  * Returns the application id given the application path.
		  * @param {string} path - application protocol path
		  * @returns {number} 
		  */
		 getAppIdFromPath : function(path) {
			 var n  = path.toString().lastIndexOf(".");
			 var id = path.toString().substring(n + 1);
			 return parseInt( id );
		 },

		 /**
		  * Returns the root application id given the application path.
		  * @param {Object} path - application protocol path
		  * @returns {number}
		  */
		 getRootAppId : function(path) {
			 var n = path.toString().indexOf(".");
			 if (n == -1) {
				 return path;
			 } else {
				 return path.toString().substring(0, n);
			 }
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
	 */
	_this.object2Array = function ( obj ){
		return Object.keys(obj).map(function(key){
			return obj[ key ];
		});
	};

	_this.inArray = function( val, arr){
		for( var i in arr){
			if( arr[i] == val )
				return i;
		}
		return -1;
	};
	
	/**
	 * Get the first element of an Object or Array
	 * @param {Object} obj
	 * @returns {Object} the first elemen
	 */
	_this.getFirstElement = function( obj ){
		for (var key in obj)
			if (obj.propertyIsEnumerable(key))
				return obj[key];
	};

	/**
	 * Overwrites recursively obj1's values with obj2's and adds obj2's if non existent in obj1
	 * @param obj1
	 * @param obj2
	 * @returns obj3 a new object based on obj1 and obj2
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
	 * @param obj - object tobe cloned
	 * @returns a new object having the same data<br/>
	 * This cannot clone object's functions
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
	 */
	_this.getUniqueNumber = function(){
		return (++ _uniqueNumber);
	};


	_this.capitalizeFirstLetter = function(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	};


	_this.localStorage = function (){
		var _prefix = "mmtdrop.";	//TODO each page has a separated parameter 
		var _storage = window.localStorage;

//		check if browser supports localStorage
		try {
			_storage.setItem("test", "1");
			_storage.removeItem("test");
		} catch (error) {
//			parameters will be stocked into global variable @{fakeStorage}
//			==> this variable will remove when the page reloaded
//			TODO set code for permanent storage
			window.fakeStorage = {};
			_storage = window.fakeStorage;
		}

		var _get = function (key){;

		return JSON.parse(_storage.getItem(_prefix + key));
		};

		var _set = function(key, value){
			_storage.setItem(_prefix + key, JSON.stringify(value));
		};

		var _remove = function (key){
			_storage.removeItem(_prefix + key);
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
	 * @returns true if yes
	 */
	_this.isFunction = function (callback){
		return (typeof(callback) === "function");
	};

	/**
	 * Check whether a vlue is a number
	 * @param n - data to check
	 * @returns true if yes, false if no
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
	 * @returns {Object}
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
	 */
	_this.sumUp = function(data, colSums){
		if (colSums == null)
			throw new Error("Need to define an id");
		if (Array.isArray (data) == false)
			throw new Error("Need data tobe an array");

		var obj = {};

		for (var i=0; i<data.length; i++){
			var msg = data[i];

			for (var key in msg){
				//check if key existing in colSums
				if (MMTDrop.tools.inArray(key, colSums) == -1)
					continue;

				if (msg[key] == null)
					continue;

				var isNumber = MMTDrop.tools.isNumber(msg[key]);
				if (obj[key] == null){
					if (isNumber)
						obj[key] = 0;
					else
						obj[key] = new Set();
				}

				if (isNumber)
					obj[key] += parseInt(msg[key]); //store only the total of values
				else
					obj[key].add( msg[key] );       //store all distinguished values
			}
		}

		return obj;
	};

	/**
	 * @return {{string: Array.<Array>}}
	 */
	_this.sumByGroup = function(data, colsSum, colGroup){
		return _this.sumByGroups( data, colsSum, [colGroup]);
	};
	
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
	 * @returns {{string : Array<{string: Array}>}}
	 */
	_this.sumByGroupAndSubgroup = function( data, colsSum, colGroup, colSubgroup){
		if (colGroup == null)
			throw new Error("Need one column tobe grouped");
		if (colSubgroup == null)
			throw new Error("Need one column tobe sub grouped");

		return _this.sumByGroups( data, colsSum, [colGroup, colSubgroup]);
	}

	return _this;
}();


///////////////////////////////////////////////////////////////////////////////////////////
//class MMTDrop.Database
//get data from database via MMT-Operator
///////////////////////////////////////////////////////////////////////////////////////////


/**
 * @class MMTDrop.Database
 * A class representing data getting from MMT-Operator
 * @param {DatabaseOption} param  
 * @param {DatabaseProcessFn} [dataProcessingFn=null] - processing data  
 * @constructor
 */
MMTDrop.Database = function(param, dataProcessingFn, isAutoLoad) {
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
	 * @returns {Data}
	 *//**
	 * Set data
	 * @param {Data} val
	 * @returns this
	 */
	this.data = function( val ){
		if (val == undefined){
			if(isAutoLoad && _data.length == 0)
				this.reload();
			
			return _data ;
		}else{
			//do something here
			_data = val;
			return this;
		}
	};

	/**
	 * Reload data from MMT-Operator.
	 * @param {DatabaseOption} [new_param=null] - a new parameter of database. 
	 * If the new parameter will merge with the current one of the database.
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
	 * Register a callback when receiving a new message in realtime.
	 * The callback will be passed two paramenters: the received message and the <code>userData</code>
	 * 
	 * @param callback
	 * @param userData
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
	 * @property {number} getProbes
	 */
	this.stat = function(){
		var stat = {};

		/**
		 * Group data by probeID
		 * @alias stat.splitDataByProbe 
		 * @memeberof! MMTDrop.Database#
		 */
		stat.splitDataByProbe = function(){
			return MMTDrop.tools.splitData( _this.data(), 
					MMTDrop.constants.StatsColumn.PROBE_ID.id);
		};


		/**
		 * Get set of probe
		 */
		stat.getProbes = function(){
			var obj = MMTDrop.tools.splitData( _this.data(), 
					MMTDrop.constants.StatsColumn.PROBE_ID.id);
			return Object.keys( obj );
		};
		
		/**
		 * 
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
 * @namespace
 */
MMTDrop.databaseFactory = {
		/**
		 * Database for statistic of traffic (format = 99)
		 * @param {DataBaseOption} param - 
		 * @param {boolean} [isAutoLoad = false] - if it is true, database will load automatically when its data property is call for the first time
		 * @returns {MMTDrop.Database} 
		 */
		createStatDB : function(param, isAutoLoad){
			param = param || {};
			//overwrite format to 99
			param.format = MMTDrop.constants.CsvFormat.STATS_FORMAT;

			var db = new MMTDrop.Database(param, function (data){

				//how data is processed for stat
				var COL = MMTDrop.constants.StatsColumn;
				var colsToSum = [COL.TOTAL_FLOWS.id,    COL.ACTIVE_FLOWS.id,      COL.DATA_VOLUME.id,
				                 COL.PAYLOAD_VOLUME.id, COL.PACKET_COUNT.id, 
				                 COL.UL_DATA_VOLUME.id, COL.UL_PAYLOAD_VOLUME.id, COL.UL_PACKET_COUNT.id,
				                 COL.DL_DATA_VOLUME.id, COL.DL_PAYLOAD_VOLUME.id, COL.DL_PACKET_COUNT.id,];

				var obj = MMTDrop.tools.sumByGroups( data, 
						colsToSum,
						[COL.TIMESTAMP.id, COL.PROBE_ID.id,
						 COL.SOURCE_ID.id, COL.APP_PATH.id]);


				for( var time in obj)
					for( var probe in obj[time])
						for( var src in obj[time][probe]){
							data = obj[time][probe][src];

							//STEP 1. 
							var hasChildren = {};

							var keys = Object.keys( data );	//keys is a set of APP_PATH
							for(var i=0; i<keys.length; i++){
								var key = keys[i];

								hasChildren[key] = false;

								for(var j=0; j<keys.length; j++){
									if (i == j)
										continue;
									if( keys[j].indexOf( key ) === 0 ){
										hasChildren[key] = true;
										break;
									}
								}
								if( hasChildren[key] && false ){
									var msg = data[key];

									//create a new child of msg
									var child = MMTDrop.tools.cloneData( msg );

									var path = key + '.9999999';	//
									//add new child to data
									data[path] = child;
									hasChildren[path] = false;

									//the data of msg will be represented by it child
									// ==> reset data of msg to zero
									for( var k in colsToSum )
										if( colsToSum[k] in msg )
											msg[ colsToSum[k] ] = 0;
								}
							}


							//STEP 2. sumUp
							keys = Object.keys( data );	//keys is a set of APP_PATH
							for(var i=0; i<keys.length; i++){
								var key = keys[i];
								if( hasChildren[key] == true)
									continue;

								var msg = data[key];
								var parentKey = MMTDrop.constants.getParentPath( key );
								//sum up
								while( parentKey != "." ){
									
									var parentMsg = data[parentKey];

									//if parent does not exist, create it and add it to data
									if( parentMsg == undefined){
										//parentMsg = MMTDrop.tools.cloneData( msg );
										//data[ parentKey ] = parentMsg;
									}
									//if parent exists, cummulate its child
									else
										for( var k in colsToSum ){
											var col = colsToSum[k];
											if( col in msg ){
												parentMsg[ col ] += msg[ col ];
											}
										}

									parentKey = MMTDrop.constants.getParentPath( parentKey );
								}
							}
						}


				data = [];
				for( var time  in obj)
					for( var probe in obj[time])
						for( var src   in obj[time][probe])
							for( var path  in obj[time][probe][src]){
								var msg = obj[time][probe][src][path];
								msg[ COL.FORMAT_ID.id ] = MMTDrop.constants.CsvFormat.STATS_FORMAT;
								msg[ COL.PROBE_ID.id  ] = parseInt(probe);
								msg[ COL.SOURCE_ID.id ] = src;
								msg[ COL.TIMESTAMP.id ] = parseInt(time);
								msg[ COL.APP_PATH.id  ] = path;
								msg[ COL.APP_ID.id    ] = MMTDrop.constants.getAppIdFromPath( path );
								//msg[ COL.APP_ID.id  ] = MMTDrop.constants.getProtocolNameFromID( MMTDrop.constants.getAppIdFromPath( path ) );
								data.push( msg );
							}

				return data;
			}, 
			isAutoLoad);

			/**
			 * Change path id to name
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
			 * 
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
						columns.push( {id: col, label: "Probe"});
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
					
					for( var i in args){
						var oo = {};
						var temp = 0;
						for( var prob in obj[app] ){
							temp = obj[app][prob][ args[i].id ];
							oo[prob] = temp;
						}
						//asign to value if there is only one probe
						if( nProbe == 1)
							o[ args[i].id ] = temp;
						else
							o[ args[i].id ] = oo;
					}
					
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
		 * Database for statistic of flow (format = 0)
		 */
		createFlowDB : function (param){
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
			});
			
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
					columns.push( {id: col, label: "Probe"} );
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
 * @class MMTDrop.Filter
 * @param {FilterOption} param - {id: unique, label: string, options : [{id:  string, label: string}, {}], onchange: callback}
 * <br/> If {param.onchange} function is defined, it will handle the changing. 
 * <br/> If the function return {true}, the default actions 
 * <br/>   (store the change to localStorage, apply the change to its attached database) 
 * <br/>   are then executed. 
 * 
 * @param filterFn = callback(value, db): this defines how database @{db} is filtered 
 * <br/>  when the option having @{value} was selected.
 * @param prepareDataFn = callback(db) : this is called before this.attachTo
 * @constructor
 */
MMTDrop.Filter = function (param, filterFn, prepareDataFn){

	var _currentSelectedOption = null;
	var _onFilterCallbacks = [];
	//database attached to this filter
	var _database = null;

	var _option = {};
	var _this = this;

	/**
	 * Render the filter into an HTML element
	 * @param {string} elemID - id of the HTML element
	 */
	this.renderTo = function (elemID){
		//remove older if exist
		$("#" + param.id + "_container").remove();

		var fcontainer = $('<div>',  {class: 'col-xs-6 col-sm-4 col-md-3 col-lg-2  pull-right', id: param.id + "_container"});
		var fdiv =       $('<div>',  {class: 'input-group pull-right'});
		var span =       $('<span>', {class: 'input-group-addon', text: param.label});
		var filter =     $('<select>',{class: "form-control",     id  : param.id});

		span.appendTo(fdiv);
		filter.appendTo(fdiv);
		fdiv.appendTo(fcontainer);
		fcontainer.appendTo($('#' + elemID));

		//add a list of options to the filter
		_this.option( param.options );
		_this.redraw();

		//handle when the filter changing
		filter.change(function(e){

			_currentSelectedOption = _option[this.selectedIndex]; 	//the selected option of the filter
			
			console.log(param.label + " - selection index change: " + JSON.stringify( _currentSelectedOption ));
			//applying the filter to the current selection
			_filter();
		});
	};


	this.selectedOption = function( opt ){
		if( opt == undefined ){
			return _currentSelectedOption;
		}
		
		return this;
	};
	
	/**
	 * Get option property
	 * @returns {SelectOption}
	 *//**
	 * Set option property
	 * @param {SelectOption} val
	 * @returns this
	 */
	this.option = function( val ){
		if ( val == undefined ){
			return _option;
		}
		if (Array.isArray( val ))
			_option = val;
		return this;
	};

	this.redraw = function(){
		var filter = $('#' + param.id);

		//remove the old options
		filter.find('option').remove();

		if ( _option.length == 0){
			console.log(" There are no options in the filter " + param.id);
			return;
		}


		var defaultOption = null;
		//create list of options
		for (var i in _option){
			var opt = $('<option>', {
				text : _option[i].label,
				value: _option[i].id
			});
			opt.appendTo(filter);

			//set default value to the first option
			if (defaultOption == null)
				defaultOption = _option[i];
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

	this.onFilter = function (callback, obj){
		if (MMTDrop.tools.isFunction(callback))
			_onFilterCallbacks.push ([callback, obj]);
	};

	this.filter = function(){
		if (MMTDrop.tools.isFunction(prepareDataFn))
			prepareDataFn(_database);

		_filter();
	};

	function _filter(){
		if (MMTDrop.tools.isFunction(filterFn)){
			if (_database != null && 
					_currentSelectedOption != null){

				console.log("  filtering " + param.label + " [" + JSON.stringify(_currentSelectedOption) + "] on database (" + 
						_database.data().length + " records)");

				filterFn(_currentSelectedOption, _database);

				console.log("     retained " + _database.data().length + " records");

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
 * @namespace
 */
MMTDrop.filterFactory = {
		createFlowMetricFilter : function(){
			var cols    = MMTDrop.constants.FlowMetricFilter;
			var options = [];
			for (var i in cols)
				options.push({id: cols[i].id, label: cols[i].label});
			 
			var filter =  new MMTDrop.Filter({
				id      : "flow_metric_filter_" + MMTDrop.tools.getUniqueNumber(),
				label   : "Flows",
				options : options,
			}, function (val, db){
				//how it filters database when the current selected option is @{val}

			});
			return filter;
		},

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
				id      : "metric_filter_" + MMTDrop.tools.getUniqueNumber(),
				label   : "Metric",
				options : options,
			}, 
			function (val, db){
				//how it filters database when the current selected option is @{val}

			}
			);
			return filter;
		},

		createPeriodFilter : function(){
			//create a list of options from predefined MMTDrop.period
			var options = [];
			for (var k in MMTDrop.constants.period){
				var key = MMTDrop.constants.period[k];
				options.push({id:  key, label: MMTDrop.tools.capitalizeFirstLetter(key)});
			}
			var filter =  new MMTDrop.Filter({
				id      : "period_filter_" + MMTDrop.tools.getUniqueNumber(),
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
			return filter;
		},

		createProbeFilter : function(){
			var probeID = "probe_filter_" + MMTDrop.tools.getUniqueNumber();

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
				console.log("update list of probes when DB loaded");
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

		createAppFilter : function(){
			var filterID = "app_filter_" + MMTDrop.tools.getUniqueNumber();

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
				console.log("update list of App when DB loaded");
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

		createClassFilter : function(){
			var filterID = "class_filter_" + MMTDrop.tools.getUniqueNumber();

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
				console.log("update list of Class when DB loaded");
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
};
///////////////////////////////////////////////////////////////////////////////////////////
//end MMTDrop.Filter
///////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////
//MMTDrop.Report
///////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class MMTDrop.Report
 * @param {string} title - title of report
 * @param {MMDrop.Database} database -
 * @param {MMTDrop.Filter[]} filters - list of filters
 * @param {Array.<{charts: MMTDrop.Chart[], width: number}>} groupCharts - groups of charts
 * @param {DataFlow} dataFlow - flow of data
 * @constructor
 */
MMTDrop.Report = function(title, database, filters, groupCharts, dataFlow){
	
	/**
	 * The charts beeing showing
	 */
	this.activeCharts = [];
	
	var _this = this;
	
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


	/**
	 * Render the report to an HTML element
	 * @param {string} elemID - id of the HTML element
	 */
	this.renderTo = function(elemID){
		_this.activeCharts = [];
		
		var rootDiv = $('#' + elemID);
		
		//draw header
		if(title) {
			var report_header =  $('<div>', {
				'class': 'row'
			});
			report_header.appendTo(rootDiv);
			
			var report_title = $('<h1>', {'class': 'page-header', 
				'style': 'margin-bottom: 10px;', 'text': title});
			report_title.appendTo(report_header);
		}

		//draw filter
		var filterID = elemID + "_filters";
		var control_row = $('<div>', {'class': 'row', 
			'style': 'margin-bottom: 10px;', id: filterID});
		control_row.appendTo(rootDiv);

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

			var chartID = "charts_group_" + i;
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
		var filter = MMTDrop.tools.getFirstElement(dataFlow).object;
		if (filter instanceof MMTDrop.Filter)
			filter.filter();
		else
			filter.renderTo( filter.htmlID, database.data() );
	};
};


/**

/**
 * @namespace
 */
MMTDrop.reportFactory = {
		/**
		 * Dashboard using a timeline chart to show traffic in realtime
		 * @returns {MMTDrop.Report}
		 */
		createRealtimeReport : function(){
			var database = MMTDrop.databaseFactory.createStatDB({
			}, true);
			
			var fProbe  = MMTDrop.filterFactory.createProbeFilter();
			var fMetric	 = MMTDrop.filterFactory.createMetricFilter();
			
			var cLine = MMTDrop.chartFactory.createTimeline({
				getData: {
					getDataFn : function( db ){
						var col = fMetric.selectedOption();
						return db.stat.getDataTimeForChart(col, false, fProbe.selectedOption().id != 0);
					}
				}});
			
			
			var appendMsg = function( msg ){
				console.log( msg );
				var chart = cLine.chart;
				if( chart == undefined )
					return;
				
				var series = chart.series;
				
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
				
				
				var time = msg[ MMTDrop.constants.StatsColumn.TIMESTAMP.id ];
				var val  = msg[ fMetric.selectedOption().id ];
				
				//whether the msg belong to one serie existing in the chart
				var isInSerie = false;
				
				for( var i in series ){
					var serie = series[i];
					
					//add point to serie
					if( serie.name === serieName){
						/*
						var x = serie.xAxis.getExtremes().dataMax;
						//do not add a msg in the past
						if( time < x ){
							console.log( "  in the past: " + x + " > " + time);
							return;
						}
						*/
						
						serie.addPoint([time, val],	//x,y 
								true, 	//redraw
								true	//shift chart data
								);
						isInSerie = true;
						console.log( "add [" + new Date(time) + ", " + val +"] to serie: " + serieName );
					}
					//else
					//	if( isRootMsg && !isInProbeMode ) 
					//		serie.addPoint([time, 0], true, true);
				}
				
				//new serie will be added
				if( isInSerie == false){
					console.log( "add new serie: " + serieName);
					chart.addSeries({
						name: serieName,
						data: [ [time, val] ],
					});
				}
			};
			
			/**
			 * A timer that will insert a dump message in order to move forward the chart when no traffic.
			 */
			var timer = null;
			var resetTimer = function(){
				
				if( timer ){
					clearTimeout( timer );
					timer = null;
				}
				
				timer = setTimeout( function(){
					var time = (new Date()).getTime() - 5000;
					
					for( var i in cLine.chart.series ){
						var serie = cLine.chart.series[i];
						
						//add point to serie
						//var x = serie.xAxis.getExtremes().max;
						var x = serie.data[serie.data.length - 1].x;
						
						//do not add a msg in the past
						if( time - x <= 5000)
							continue;
						
						serie.addPoint( [time, 0], true, false );
					}	
					
					resetTimer();
				}, 
				4000	//timer interval
				);
			};
			
			database.onMessage( function( msg ){
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
			
			resetTimer();
			
			return report;
		},
		
		
		
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
							var col = [fMetric.selectedOption()];
							return db.stat.getDataTableForChart( col, false );
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
};
///////////////////////////////////////////////////////////////////////////////////////////
//end MMTDrop.Report
///////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////
//MMTDrop.Chart
///////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class MMTDrop.Chart
 * A template to create a new chart.
 * @param {ChartRenderFn} renderFn -  is a callback using to render the chart to an HTML element
 * @param {ChartOption} [option={title:"", data: {getDataFn: null, columns: []}}]
 * @constructor
 */
MMTDrop.Chart = function(option, renderFn){

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
	 * @param {ChartOption} val - a new option will merge with the current option 
	 * @see {@link MMTDrop.tools.mergeObject}
	 *//**
	 * Gete option property
	 * @returns {ChartOption}
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
		//redraw with the current _option
		this.redraw();
	};

	/**
	 * Redraw the chart.
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
				throw new Error("   no columns to render" );
			}
			
			if( data.length == 0){
				console.log( "   no data");
			}
			
			this.chart = renderFn(_elemID, _option, data);

		}else
			throw new Error ("No render function is defined");
	};


	/**
	 * Icon reprenting for this chart
	 * @returns a DOM element
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
 * Create several kinds of charts
 * @namespace
 */
MMTDrop.chartFactory = {
		/**
		 * Create Bar Chart
		 * @param {ChartOption} param
		 * @returns {MMTDrop.Chart}
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
				var series = [];

				//init series from 1th column
				for (var j=1; j<columns.length; j++)
					series.push( {name:columns[j].label, data : [] } );

				for (var i=0; i<arrData.length; i++){
					var msg = arrData[i];

					//the first column is categorie, the next ones are series
					categories.push( msg[0] );
					
					for (var j=1; j<msg.length; j++)
						series[j-1].data.push( msg[j] );
				}

				var chartOption = {
						chart : {
							renderTo    : elemID,
							borderColor : '#ccc',
							borderWidth : 1,
							defaultSeriesType : 'column',
							zoomType    : 'xy',
							spacingTop  :30,
							spacingRight:30 
						},
						navigation:{
							buttonOptions: {
								verticalAlign: 'top',
								y: -25,
								x: 20
							}
						},
						title : {
							text : null
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
						legend: {
							enabled: (series.length > 1)
						},
						tooltip : {
							formatter : function() {
								return '<span style="font-size: 10px">' +this.series.name + '</span><br/> \u25CF '+ this.key +' : ' + this.y ;
							},
						},
						xAxis : {
							categories : categories
						},
						yAxis : {
							title : {
								text : ylabel
							}
						},
						plotOptions:{
							bar:{
								events : {
									click : option.click,
								},
							},
						},
						series : series
				};

				var hightchart = new Highcharts.Chart(chartOption);
				return hightchart;
			});

			chart.getIcon = function(){
				return $('<i>', {'class': 'glyphicons-bar'});
			};
			return chart;
		},

		/**
		 * Create Pie Chart
		 * @param {ChartOption} param
		 * @returns {MMTDrop.Chart}
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

				var chartOption = {
						chart : {
							renderTo    : elemID,
							borderColor : '#ccc',
							borderWidth : 1,
							type        : 'pie',
							spacingTop  : 30,
							spacingRight: 30,
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
								x    : -40,
								verticalAlign: 'top',
								y    : 20                              
							}
						},
						tooltip : {
							headerFormat: '<span style="font-size: 10px">{series.name}</span><br/>',
							pointFormat:  '\u25CF {point.name}: {point.y}',
						},
						plotOptions : {
							pie : {
								startAngle : 0,
								allowPointSelect : true,
								cursor           : 'pointer',
								slicedOffset     : 20,
								dataLabels       : {
									enabled   : true,
									formatter : function() {
										//display only if larger than 1% or there is only one serie
										if( this.percentage > 1  || this.point.seriesSize == 1 || this.series.data.length <= 10)
											return '<b>' + this.point.name + '</b>: ' + Highcharts.numberFormat(this.percentage, 2) + ' %';
										else 
											return null;
									}
								},
								events : {
									click : option.click,
								},
								point: {
									events:{
										//click on legend item ==> hide pies of all series
										legendItemClick : function( e ){
											var isVisible = !this.visible;
											var name      = this.name;
											var series    = this.series.chart.series;
											
											for( var i=0; i<series.length; i++){
												var data = series[i].data;
												for( var j=0; j<data.length; j++)
													if( data[j].name === name){
														data[j].setVisible( isVisible );
													}
											}
											return false;
										}
									}
								}
							}
						},
						title : {
							text : null
						},
						series : series
				};
				
				/**
			     * Highcharts plugin for raising up the pies corresponding the one that is hovered in the legend
			     */
			        Highcharts.wrap(Highcharts.Legend.prototype, 'renderItem', function (proceed, item) {
			            
			            proceed.call(this, item);
			            
			            var element = item.legendGroup.element;
			            var series = this.chart.series;
			            
			            //raise up
			            element.onmouseover = function () {
							for( var i=0; i<series.length; i++){
								var data = series[i].data;
								for( var j=0; j<data.length; j++)
									if( data[j].name === item.name){
										data[j].sliced = true;
										data[j].graphic.animate(data[j].slicedTranslation);
									}
							}
			            };
			            
			            element.onmouseout = function () {
							for( var i=0; i<series.length; i++){
								var data = series[i].data;
								for( var j=0; j<data.length; j++)
									if( data[j].name === item.name){
										data[j].sliced = false;
										data[j].graphic.animate({
							                translateX: 0,
							                translateY: 0
							            });
									}
							}
			            } ; 
			        });
			    
			    
				var hightChart = new Highcharts.Chart(chartOption);
		        		
				return hightChart;
			});

			chart.getIcon = function(){
				return $('<i>', {'class': 'glyphicons-pie'});
			};
			return chart;
		},


		/**
		 * Create Timeline Chart
		 * @param {ChartOption} param
		 * @returns {MMTDrop.Chart}
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
							for( var k=0; k<probes.length; k++)	{
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
				//	return a[0] - b[0];
				//});

				var ylabel = option.ylabel;
				var series = [];

				//init series from 1th column
				for (var j=1; j<columns.length; j++)
					series.push( {name:columns[j].label, data : [] } );

				//set data for each serie
				for (var i=0; i<arrData.length; i++){
					var msg = arrData[i];
					
					//the first column is categorie, the next ones are series
					for (var j=1; j<msg.length; j++){
						if( msg[j] == undefined)
							continue;
						series[j-1].data.push([ msg[0], msg[j] ]);
					}
				}
				
				var isTimeLine = (type == undefined || type === "timeline" || type === "scatter");
				
				var chartOption = {
						chart : {
							renderTo    : elemID,
							borderColor : '#ccc',
							borderWidth : 1,
							type        : type || 'spline',
							zoomType    : 'xy',
							spacingTop  :30,
							spacingRight:30,                                  
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
							gridLineWidth: 1,
							type : isTimeLine? 'datetime' : '',
						},
						yAxis : {
							title : {
								text : ylabel,
							},
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
								lineWidth: 2,
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
								lineWidth: 2,
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
								lineWidth: 2,
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
								lineWidth: 2,
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
				return hightChart;
			});

			chart.getIcon = function(){
				return $('<i>', {'class': 'glyphicons-chart'});
			};
			return chart;
		},


		/**
		 * Create Scatter Chart
		 * @param {ChartOption} param
		 * @returns {MMTDrop.Chart}
		 */
		createScatter : function ( param ){
			return MMTDrop.chartFactory.createTimeline( param, 'scatter');
		},


		/**
		 * Create XY Chart
		 * @param {ChartOption} param
		 * @returns {MMTDrop.Chart}
		 */
		createXY : function ( param ){
			return MMTDrop.chartFactory.createTimeline( param, 'line' );
		},

		/**
		 * Create Tree Chart
		 * @param {ChartOption} param
		 * @returns {MMTDrop.Chart}
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
					var row_name = $('<td style="cursor:pointer">');

					var row_name_link = $('<a>', {
						'text' : name
					});
					row_name_link.appendTo(row_name);

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
					expandable        : true, 
					initialState      : "expanded",	//expand all nodes
					clickableNodeNames: true
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
				return $('<i>', {'class': 'glyphicons-table'});
			};
			return chart;
		},


		/**
		 * Create Table Chart
		 * @param {ChartOption} param
		 * @returns {MMTDrop.Chart}
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
				arrData.sort(function (a, b){
					if (a[0].parent == b[0].parent )
						return a[0].name > b[0].name ? 1: -1;

						return a[0].path > b[0].path ? 1 : -1;
				});

				//add each element to a row
				for (var i in arrData) {
					var msg = arrData[i];


					//root
					var row_tr = $('<tr>', {
					});


					//first column
					var row_name = $('<td style="cursor:pointer">');

					var row_name_link = $('<a>', {
						'text' : msg[0]
					});
					row_name_link.appendTo(row_name);

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

			chart.getIcon = function(){
				return $('<i>', {'class': 'glyphicons-table'});
			};
			return chart;
		},
};

/**
 * An object with id and label
 * @typedef {Object} Index
 * @property {(number|string)} id
 * @property {string} label
 */

/**
 * The parameter when creating a chart.
 * @typedef {Object} ChartOption
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
 * @param {ChartOption} option - option 
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
 * @typedef {Object} DatabaseOption
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