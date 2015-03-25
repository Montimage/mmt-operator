/** Class: MMTDrop
 *  An object container for all MMTDrop library functions.
 *
 *  This class is just a container for all the objects and constants
 *  used in the library.  It is not meant to be instantiated, but to
 *  provide a namespace for library objects, constants, and functions.
 */

MMTDrop = {

		/** Constant: VERSION
		 *  The version of the MMTDrop library.
		 */
		VERSION : "1.0.0",

		/**
		 * Constants: MMTDrop defined csv format types
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
		 * Constants: MMTDrop defined csv format types
		 */
		 StatsColumnId : {
			 FORMAT_ID : 0, /**< Index of the format id column */
			 PROBE_ID : 1, /**< Index of the probe id column */
			 SOURCE_ID : 2, /**< Index of the data source id column */
			 TIMESTAMP : 3, /**< Index of the format id column */
			 APP_ID : 4, /**< Index of the application id column */
			 APP_PATH : 5, /**< Index of the application path column */
			 TOTAL_FLOWS : 6, /**< Index of the is_leaf column */
			 ACTIVE_FLOWS : 7, /**< Index of the active flows column */
			 DATA_VOLUME : 8, /**< Index of the data volume column */
			 PAYLOAD_VOLUME : 9, /**< Index of the payload data volume column */
			 PACKET_COUNT : 10, /**< Index of the packet count column */
			 UL_DATA_VOLUME : 11, /**< Index of the data volume column */
			 UL_PAYLOAD_VOLUME : 12, /**< Index of the payload data volume column */
			 UL_PACKET_COUNT : 13, /**< Index of the packet count column */
			 DL_DATA_VOLUME : 14, /**< Index of the data volume column */
			 DL_PAYLOAD_VOLUME : 15, /**< Index of the payload data volume column */
			 DL_PACKET_COUNT : 16, /**< Index of the packet count column */
		 },

		 /**
		  * Constants: MMTDrop defined Flow based csv format (format 0, and common part of 1, 2, 3)
		  */
		 FlowStatsColumnId : {
			 FORMAT_ID : 0, /**< Index of the format id column */
			 PROBE_ID : 1, /**< Index of the probe id column */
			 SOURCE_ID : 2, /**< Index of the data source id column */
			 TIMESTAMP : 3, /**< Index of the format id column */
			 FLOW_ID : 4, /**< Index of the flow id column */
			 START_TIME : 5, /**< Index of the flow start time */
			 IP_VERSION : 6, /**< Index of the IP version number column */
			 SERVER_ADDR : 7, /**< Index of the server address column */
			 CLIENT_ADDR : 8, /**< Index of the client address column */
			 SERVER_PORT : 9, /**< Index of the server port column */
			 CLIENT_PORT : 10, /**< Index of the client port column */
			 TRANSPORT_PROTO : 11, /**< Index of the transport protocol identifier column */
			 UL_PACKET_COUNT : 12, /**< Index of the uplink packet count column */
			 DL_PACKET_COUNT : 13, /**< Index of the downlink packet count column */
			 UL_DATA_VOLUME : 14, /**< Index of the uplink data volume column */
			 DL_DATA_VOLUME : 15, /**< Index of the downlink data volume column */
			 TCP_RTT : 16, /**< Index of the TCP round trip time column */
			 RETRANSMISSION_COUNT : 17, /**< Index of the retransmissions count column */
			 APP_FAMILY : 18, /**< Index of the application family column */
			 CONTENT_CLASS : 19, /**< Index of the content class column */
			 PROTO_PATH: 20, /**< Index of the protocol path column */
			 APP_NAME : 21, /**< Index of the application name column */
			 APP_FORMAT_ID : 22, /**< Index of the start of the application specific statistics (this is not a real column, rather an index) */
		 },

		 HttpStatsColumnId : {
			 RESPONSE_TIME : 0, /**< Index of the response time column */
			 TRANSACTIONS_COUNT : 1, /**< Index of the HTTP transactions count (req/res number) column */
			 INTERACTION_TIME : 2, /**< Index of the interaction time (between client and server) column */
			 HOSTNAME : 3, /**< Index of the hostname column */
			 MIME_TYPE : 4, /**< Index of the MIME type column */
			 REFERER : 5, /**< Index of the Referer column */
			 DEVICE_OS_ID : 6, /**< Index of the device and operating system ids column */
			 CDN_FLAG : 7, /**< Index of the is CDN delivered column */
		 },

		 TlsStatsColumnId : {
			 SERVER_NAME : 0, /**< Index of the format id column */
			 CDN_FLAG : 1, /**< Index of the format id column */
		 },

		 RtpStatsColumnId : {
			 PACKET_LOSS_RATE : 0, /**< Index of the format id column */
			 PACKET_LOSS_BURSTINESS : 1, /**< Index of the format id column */
			 MAX_JITTER : 2,
		 },

		 /**
		  * Constants: MMTDrop defined csv format types
		  */
		 ReportType : {
			 PROTO_TREE : 0, /**< Identifier of protocol tree table chart */
			 PROTO_LIST : 1, /**< Identifier of protocol advanced table chart */
			 PROTO_CLASS_LIST : 2, /**< Identifier protocol-in-class table chart */
			 CLASS_LIST : 3, /**< Identifier of classes of protocol table chart */
		 },

		 /**
		  * Constants: MMTDrop defined traffic metrics
		  */
		 MetricId : {
			 DATA_VOLUME : 1, /**< Identifier of data volume metric */
			 PACKET_COUNT : 2, /**< Identifier of packet count metric */
			 PAYLOAD_VOLUME : 3, /**< Identifier of payload data volume metric */
			 ACTIVE_FLOWS : 4, /**< Identifier of active flows metric */
		 },

		 /**
		  * Mapping between metric IDs and metric names
		  */
		 MetricID2Name : {
			 1 : "Data Volume",
			 2 : "Packet Count",
			 3 : "Payload Volume",
			 4 : "Active Flows",
		 },

		 /**
		  * Mapping between metric IDs and metric names
		  */
		 MetricName2ID : {
			 "Data Volume": 1,
			 "Packet Count": 2,
			 "Payload Volume": 3,
			 "Active Flows": 4,
		 },

		 /**
		  * Constants: MMTDrop defined flow metrics
		  */
		 FlowMetricId : {
			 DATA_VOLUME : 1, /**< Identifier of data volume metric */
			 PACKET_COUNT : 2, /**< Identifier of packet count metric */
			 PAYLOAD_VOLUME : 3, /**< Identifier of payload data volume metric */
			 ACTIVE_FLOWS : 4, /**< Identifier of active flows metric */
			 UL_DATA_VOLUME : 5, /**< Identifier of uplink data volume metric */
			 DL_DATA_VOLUME : 6, /**< Identifier of downlink data volume metric */
			 UL_PACKET_COUNT : 7, /**< Identifier of uplink data volume metric */
			 DL_PACKET_COUNT : 8, /**< Identifier of downlink data volume metric */
			 FLOW_DURATION: 9, /**< Identifier of the flow duration metric */
		 },


		 /**
		  * Mapping between metric IDs and metric names
		  */
		 FlowMetricID2Name : {
			 1 : "Data Volume",
			 2 : "Packet Count",
			 3 : "Payload Volume",
			 4 : "Active Flows",
			 5 : "UL Data Volume",
			 6 : "DL Data Volume",
			 7 : "UL Packet Count",
			 8 : "DL Packet Count",
			 9 : "Flow Duration",
		 },

		 /**
		  * Mapping between metric IDs and metric names
		  */
		 FlowMetricName2ID : {
			 "Data Volume": 1,
			 "Packet Count": 2,
			 "Payload Volume": 3,
			 "Active Flows": 4,
			 "UL Data Volume": 5,
			 "DL Data Volume": 6,
			 "UL Packet Count": 7,
			 "DL Packet Count": 8,
			 "Flow Duration": 9
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
		  * Mapping between RTP metric IDs and metric names
		  */
		 RTPMetricName2ID : {
			 "Packet Loss"     : 1,
			 "Loss Burstiness" : 2,
			 "Jitter"          : 3,
			 "Quality Index"   : 4,
		 },

		 /**
		  * Constants: MMTDrop defined HTTP flow metrics
		  */
		 HTTPMetricId : {
			 RESPONSE_TIME       : "Response Time", /**< Identifier of response time metric */
			 INTERACTION_TIME    : "Interaction Time", /**< Identifier of interaction time metric */
			 INTERACTIONS_COUNT  : "Transactions Nb", /**< Identifier of interaction time metric */
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
		  * Mapping between HTTP metric IDs and metric names
		  */
		 HTTPMetricName2ID : {
			 "Response Time"    : 1,
			 "Interaction Time" : 2,
			 "Transactions Nb"  : 3,
		 },

		 getYLabel: function(filter) {
			 if(filter.metric === MMTDrop.FlowMetricID2Name[MMTDrop.FlowMetricId.DATA_VOLUME]) {
				 return "data";
			 }
			 if(filter.metric === MMTDrop.FlowMetricID2Name[MMTDrop.FlowMetricId.PACKET_COUNT]) {
				 return "packets";
			 }
			 if(filter.metric === MMTDrop.FlowMetricID2Name[MMTDrop.FlowMetricId.PAYLOAD_VOLUME]) {
				 return "payload data";
			 }
			 if(filter.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.ACTIVE_FLOWS]) {
				 return "flows";
			 }
			 if(filter.metric === MMTDrop.FlowMetricID2Name[MMTDrop.FlowMetricId.UL_DATA_VOLUME]) {
				 return "uplink data";
			 }
			 if(filter.metric === MMTDrop.FlowMetricID2Name[MMTDrop.FlowMetricId.UL_PACKET_COUNT]) {
				 return "uplink packets";
			 }
			 if(filter.metric === MMTDrop.FlowMetricID2Name[MMTDrop.FlowMetricId.DL_DATA_VOLUME]) {
				 return "downlink data";
			 }
			 if(filter.metric === MMTDrop.FlowMetricID2Name[MMTDrop.FlowMetricId.DL_PACKET_COUNT]) {
				 return "downlink packets";
			 }
			 if(filter.metric === MMTDrop.FlowMetricID2Name[MMTDrop.FlowMetricId.FLOW_DURATION]) {
				 return "flow duration";
			 }
			 return filter.metric;
			 //return "";
		 },

		 /**
		  * Constants: Protocol Id,Name 
		  */
		 ProtocolsIDName: {
			 0: 'All', 2: '163', 3: '360', 4: '302_FOUND', 5: '360BUY', 6: '56', 7: '8021Q', 8: '888', 9: 'ABOUT', 10: 'ADCASH', 11: 'ADDTHIS', 12: 'ADF', 13: 'ADOBE', 14: 'AFP', 15: 'AH', 16: 'AIM', 17: 'AIMINI', 18: 'ALIBABA', 19: 'ALIPAY', 20: 'ALLEGRO', 21: 'AMAZON', 22: 'AMEBLO', 23: 'ANCESTRY', 24: 'ANGRYBIRDS', 25: 'ANSWERS', 26: 'AOL', 27: 'APPLE', 28: 'APPLEJUICE', 29: 'ARMAGETRON', 30: 'ARP', 31: 'ASK', 32: 'AVG', 33: 'AVI', 34: 'AWEBER', 35: 'AWS', 36: 'BABYLON', 37: 'BADOO', 38: 'BAIDU', 39: 'BANKOFAMERICA', 40: 'BARNESANDNOBLE', 41: 'BATMAN', 42: 'BATTLEFIELD', 43: 'BATTLENET', 44: 'BBB', 45: 'BBC_ONLINE', 46: 'BESTBUY', 47: 'BETFAIR', 48: 'BGP', 49: 'BIBLEGATEWAY', 50: 'BILD', 51: 'BING', 52: 'BITTORRENT', 53: 'BLEACHERREPORT', 54: 'BLOGFA', 55: 'BLOGGER', 56: 'BLOGSPOT', 57: 'BODYBUILDING', 58: 'BOOKING', 59: 'CBSSPORTS', 60: 'CENT', 61: 'CHANGE', 62: 'CHASE', 63: 'CHESS', 64: 'CHINAZ', 65: 'CITRIX', 66: 'CITRIXONLINE', 67: 'CLICKSOR', 68: 'CNN', 69: 'CNZZ', 70: 'COMCAST', 71: 'CONDUIT', 72: 'COPYSCAPE', 73: 'CORREIOS', 74: 'CRAIGSLIST', 75: 'CROSSFIRE', 76: 'DAILYMAIL', 77: 'DAILYMOTION', 78: 'DCERPC', 79: 'DIRECT_DOWNLOAD_LINK', 80: 'DEVIANTART', 81: 'DHCP', 82: 'DHCPV6', 83: 'DIGG', 84: 'DIRECTCONNECT', 85: 'DNS', 86: 'DOFUS', 87: 'DONANIMHABER', 88: 'DOUBAN', 89: 'DOUBLECLICK', 90: 'DROPBOX', 91: 'EBAY', 92: 'EDONKEY', 93: 'EGP', 94: 'EHOW', 95: 'EKSISOZLUK', 96: 'ELECTRONICSARTS', 97: 'ESP', 98: 'ESPN', 99: 'ETHERNET', 100: 'ETSY', 101: 'EUROPA', 102: 'EUROSPORT', 103: 'FACEBOOK', 104: 'FACETIME', 105: 'FASTTRACK', 106: 'FC2', 107: 'FEIDIAN', 108: 'FIESTA', 109: 'FILETOPIA', 110: 'FIVERR', 111: 'FLASH', 112: 'FLICKR', 113: 'FLORENSIA', 114: 'FOURSQUARE', 115: 'FOX', 116: 'FREE', 117: 'FTP', 118: 'GADUGADU', 119: 'GAMEFAQS', 120: 'GAMESPOT', 121: 'GAP', 122: 'GARANTI', 123: 'GAZETEVATAN', 124: 'GIGAPETA', 125: 'GITHUB', 126: 'GITTIGIDIYOR', 127: 'GLOBO', 128: 'GMAIL', 129: 'GNUTELLA', 130: 'GOOGLE_MAPS', 131: 'GO', 132: 'GODADDY', 133: 'GOO', 134: 'GOOGLE', 135: 'GOOGLE_USER_CONTENT', 136: 'GOSMS', 137: 'GRE', 138: 'GROOVESHARK', 139: 'GROUPON', 140: 'GTALK', 141: 'GTP', 142: 'GTP2', 143: 'GUARDIAN', 144: 'GUILDWARS', 145: 'HABERTURK', 146: 'HAO123', 147: 'HEPSIBURADA', 148: 'HI5', 149: 'HALFLIFE2', 150: 'HOMEDEPOT', 151: 'HOOTSUITE', 152: 'HOTMAIL', 153: 'HTTP', 154: 'HTTP_CONNECT', 155: 'HTTP_PROXY', 156: 'HTTP_APPLICATION_ACTIVESYNC', 157: 'HUFFINGTON_POST', 158: 'HURRIYET', 159: 'I23V5', 160: 'IAX', 161: 'ICECAST', 162: 'APPLE_ICLOUD', 163: 'ICMP', 164: 'ICMPV6', 165: 'IFENG', 166: 'IGMP', 167: 'IGN', 168: 'IKEA', 169: 'IMAP', 170: 'IMAPS', 171: 'INTERNET_MOVIE_DATABASE', 172: 'IMESH', 173: 'IMESSAGE', 174: 'IMGUR', 175: 'INCREDIBAR', 176: 'INDIATIMES', 177: 'INSTAGRAM', 178: 'IP', 179: 'IP_IN_IP', 180: 'IPP', 181: 'IPSEC', 182: 'IPV6', 183: 'IRC', 184: 'IRS', 185: 'APPLE_ITUNES', 186: 'UNENCRYPED_JABBER', 187: 'JAPANPOST', 188: 'KAKAO', 189: 'KAT', 190: 'KAZAA', 191: 'KERBEROS', 192: 'KING', 193: 'KOHLS', 194: 'KONGREGATE', 195: 'KONTIKI', 196: 'L2TP', 197: 'LASTFM', 198: 'LDAP', 199: 'LEAGUEOFLEGENDS', 200: 'LEGACY', 201: 'LETV', 202: 'LINKEDIN', 203: 'LIVE', 204: 'LIVEDOOR', 205: 'LIVEMAIL', 206: 'LIVEINTERNET', 207: 'LIVEJASMIN', 208: 'LIVEJOURNAL', 209: 'LIVESCORE', 210: 'LIVINGSOCIAL', 211: 'LOWES', 212: 'MACYS', 213: 'MAIL_RU', 214: 'MANET', 215: 'MANOLITO', 216: 'MAPLESTORY', 217: 'MATCH', 218: 'MDNS', 219: 'MEDIAFIRE', 220: 'MEEBO', 221: 'MGCP', 222: 'MICROSOFT', 223: 'MILLIYET', 224: 'MINECRAFT', 225: 'MINICLIP', 226: 'MLBASEBALL', 227: 'MMO_CHAMPION', 228: 'MMS', 229: 'MOVE', 230: 'MOZILLA', 231: 'MPEG', 232: 'MSN', 233: 'MSSQL', 234: 'MULTIPLY', 235: 'MYNET', 236: 'MYSPACE', 237: 'MYSQL', 238: 'MYWEBSEARCH', 239: 'NBA', 240: 'NEOBUX', 241: 'NETBIOS', 242: 'NETFLIX', 243: 'NETFLOW', 244: 'NEWEGG', 245: 'NEWSMAX', 246: 'NFL', 247: 'NFS', 248: 'NICOVIDEO', 249: 'NIH', 250: 'NORDSTROM', 251: 'NTP', 252: 'NYTIMES', 253: 'ODNOKLASSNIKI', 254: 'OFF', 255: 'OGG', 256: 'ONET', 257: 'OPENFT', 258: 'ORANGEDONKEY', 259: 'OSCAR', 260: 'OSPF', 261: 'OUTBRAIN', 262: 'OVERSTOCK', 263: 'PANDO', 264: 'PAYPAL', 265: 'PCANYWHERE', 266: 'PCH', 267: 'PCONLINE', 268: 'PHOTOBUCKET', 269: 'PINTEREST', 270: 'PLAYSTATION', 271: 'POGO', 272: 'POP', 273: 'POPS', 274: 'POPO', 275: 'PORNHUB', 276: 'POSTGRES', 277: 'PPLIVE', 278: 'PPP', 279: 'PPPOE', 280: 'PPSTREAM', 281: 'PPTP', 282: 'PREMIERLEAGUE', 283: 'QQ', 284: 'QQLIVE', 285: 'QUAKE', 286: 'QUICKTIME', 287: 'R10', 288: 'RADIUS', 289: 'RAKUTEN', 290: 'RDP', 291: 'REALMEDIA', 292: 'REDDIT', 293: 'REDTUBE', 294: 'REFERENCE', 295: 'RENREN', 296: 'ROBLOX', 297: 'ROVIO', 298: 'RTP', 299: 'RTSP', 300: 'SABAHTR', 301: 'SAHIBINDEN', 302: 'SALESFORCE', 303: 'SALON', 304: 'SCTP', 305: 'SEARCHNU', 306: 'SEARCH_RESULTS', 307: 'SEARS', 308: 'SECONDLIFE', 309: 'SECURESERVER', 310: 'SFLOW', 311: 'SHAZAM', 312: 'SHOUTCAST', 313: 'SINA', 314: 'SIP', 315: 'SITEADVISOR', 316: 'SKY', 317: 'SKYPE', 318: 'SKYROCK', 319: 'SKYSPORTS', 320: 'SLATE', 321: 'SLIDESHARE', 322: 'SMB', 323: 'SMTP', 324: 'SMTPS', 325: 'SNMP', 326: 'SOCRATES', 327: 'SOFTONIC', 328: 'SOGOU', 329: 'SOHU', 330: 'SOPCAST', 331: 'SOSO', 332: 'SOULSEEK', 333: 'SOUNDCLOUD', 334: 'SOURGEFORGE', 335: 'SPIEGEL', 336: 'SPORX', 337: 'SPOTIFY', 338: 'SQUIDOO', 339: 'SSDP', 340: 'SSH', 341: 'SSL', 342: 'STACK_OVERFLOW', 343: 'STATCOUNTER', 344: 'STEALTHNET', 345: 'STEAM', 346: 'STUMBLEUPON', 347: 'STUN', 348: 'SULEKHA', 349: 'SYSLOG', 350: 'TAGGED', 351: 'TAOBAO', 352: 'TARGET', 353: 'TCO', 354: 'TCP', 355: 'TDS', 356: 'TEAMVIEWER', 357: 'TELNET', 358: 'TFTP', 359: 'THEMEFOREST', 360: 'THE_PIRATE_BAY', 361: 'THUNDER', 362: 'TIANYA', 363: 'TLS', 364: 'TMALL', 365: 'TORRENTZ', 366: 'TRUPHONE', 367: 'TUBE8', 368: 'TUDOU', 369: 'TUENTI', 370: 'TUMBLR', 371: 'TVANTS', 372: 'TVUPLAYER', 373: 'TWITTER', 374: 'UBI', 375: 'UCOZ', 376: 'UDP', 377: 'UDPLITE', 378: 'UOL', 379: 'USDEPARTMENTOFSTATE', 380: 'USENET', 381: 'USTREAM', 382: 'HTTP_APPLICATION_VEOHTV', 383: 'VIADEO', 384: 'VIBER', 385: 'VIMEO', 386: 'VK', 387: 'VKONTAKTE', 388: 'VNC', 389: 'WALMART', 390: 'WARRIORFORUM', 391: 'WAYN', 392: 'WEATHER', 393: 'WEBEX', 394: 'WEEKLYSTANDARD', 395: 'WEIBO', 396: 'WELLSFARGO', 397: 'WHATSAPP', 398: 'WIGETMEDIA', 399: 'WIKIA', 400: 'WIKIMEDIA', 401: 'WIKIPEDIA', 402: 'WILLIAMHILL', 403: 'WINDOWSLIVE', 404: 'WINDOWSMEDIA', 405: 'WINMX', 406: 'WINUPDATE', 407: 'WORLD_OF_KUNG_FU', 408: 'WORDPRESS_ORG', 409: 'WARCRAFT3', 410: 'WORLDOFWARCRAFT', 411: 'WOWHEAD', 412: 'WWE', 413: 'XBOX', 414: 'XDMCP', 415: 'XHAMSTER', 416: 'XING', 417: 'XINHUANET', 418: 'XNXX', 419: 'XVIDEOS', 420: 'YAHOO', 421: 'YAHOOGAMES', 422: 'YAHOOMAIL', 423: 'YANDEX', 424: 'YELP', 425: 'YOUKU', 426: 'YOUPORN', 427: 'YOUTUBE', 428: 'ZAPPOS', 429: 'ZATTOO', 430: 'ZEDO', 431: 'ZOL', 432: 'ZYNGA', 433: '3PC', 434: 'ANY_0HOP', 435: 'ANY_DFS', 436: 'ANY_HIP', 437: 'ANY_LOCAL', 438: 'ANY_PES', 439: 'ARGUS', 440: 'ARIS', 441: 'AX_25', 442: 'BBN_RCC_MON', 443: 'BNA', 444: 'BR_SAT_MON', 445: 'CBT', 446: 'CFTP', 447: 'CHAOS', 448: 'COMPAQ_PEER', 449: 'CPHB', 450: 'CPNX', 451: 'CRTP', 452: 'CRUDP', 453: 'DCCP', 454: 'DCN_MEAS', 455: 'DDP', 456: 'DDX', 457: 'DGP', 458: 'EIGRP', 459: 'EMCON', 460: 'ENCAP', 461: 'ETHERIP', 462: 'FC', 463: 'FIRE', 464: 'GGP', 465: 'GMTP', 466: 'HIP', 467: 'HMP', 468: 'I_NLSP', 469: 'IATP', 470: 'IDPR', 471: 'IDPR_CMTP', 472: 'IDRP', 473: 'IFMP', 474: 'IGP', 475: 'IL', 476: 'IPCOMP', 477: 'IPCV', 478: 'IPLT', 479: 'IPPC', 480: 'IPTM', 481: 'IPX_IN_IP', 482: 'IRTP', 483: 'IS_IS', 484: 'ISO_IP', 485: 'ISO_TP4', 486: 'KRYPTOLAN', 487: 'LARP', 488: 'LEAF_1', 489: 'LEAF_2', 490: 'MERIT_INP', 491: 'MFE_NSP', 492: 'MHRP', 493: 'MICP', 494: 'MOBILE', 495: 'MOBILITY_HEADER', 496: 'MPLS_IN_IP', 497: 'MTP', 498: 'MUX', 499: 'NARP', 500: 'NETBLT', 501: 'NSFNET_IGP', 502: 'NVP_II', 503: 'PGM', 504: 'PIM', 505: 'PIPE', 506: 'PNNI', 507: 'PRM', 508: 'PTP', 509: 'PUP', 510: 'PVP', 511: 'QNX', 512: 'RSVP', 513: 'RSVP_E2E_IGNORE', 514: 'RVD', 515: 'SAT_EXPAK', 516: 'SAT_MON', 517: 'SCC_SP', 518: 'SCPS', 519: 'SDRP', 520: 'SECURE_VMTP', 521: 'SHIM6', 522: 'SKIP', 523: 'SM', 524: 'SMP', 525: 'SNP', 526: 'SPRITE_RPC', 527: 'SPS', 528: 'SRP', 529: 'SSCOPMCE', 530: 'ST', 531: 'STP', 532: 'SUN_ND', 533: 'SWIPE', 534: 'TCF', 535: 'TLSP', 536: 'TP_PP', 537: 'TRUNK_1', 538: 'TRUNK_2', 539: 'UTI', 540: 'VINES', 541: 'VISA', 542: 'VMTP', 543: 'VRRP', 544: 'WB_EXPAK', 545: 'WB_MON', 546: 'WSN', 547: 'XNET', 548: 'XNS_IDP', 549: 'XTP', 550: 'BUZZNET', 551: 'COMEDY', 552: 'RAMBLER', 553: 'SMUGMUG', 554: 'ARCHIEVE', 555: 'CITYNEWS', 556: 'SCIENCESTAGE', 557: 'ONEWORLD', 558: 'DISQUS', 559: 'BLOGCU', 560: 'EKOLEY', 561: '500PX', 562: 'FOTKI', 563: 'FOTOLOG', 564: 'JALBUM', 565: 'LOCKERZ', 566: 'PANORAMIO', 567: 'SNAPFISH', 568: 'WEBSHOTS', 569: 'MEGA', 570: 'VIDOOSH', 571: 'AFREECA', 572: 'WILDSCREEN', 573: 'BLOGTV', 574: 'HULU', 575: 'MEVIO', 576: 'LIVESTREAM', 577: 'LIVELEAK', 578: 'DEEZER', 579: 'BLIPTV', 580: 'BREAK', 581: 'CITYTV', 582: 'COMEDYCENTRAL', 583: 'ENGAGEMEDIA', 584: 'SCREENJUNKIES', 585: 'RUTUBE', 586: 'SEVENLOAD', 587: 'MUBI', 588: 'IZLESENE', 589: 'VIDEO_HOSTING', 590: 'BOX', 591: 'SKYDRIVE', 592: '7DIGITAL', 593: 'CLOUDFRONT', 594: 'TANGO', 595: 'WECHAT', 596: 'LINE', 597: 'BLOOMBERG', 598: 'MSCDN', 599: 'AKAMAI', 600: 'YAHOOMSG', 601: 'BITGRAVITY', 602: 'CACHEFLY', 603: 'CDN77', 604: 'CDNETWORKS', 605: 'CHINACACHE', 606: 'COTENDO', 607: 'EDGECAST', 608: 'FASTLY', 609: 'HIGHWINDS', 610: 'INTERNAP', 611: 'LEVEL3', 612: 'LIMELIGHT', 613: 'MAXCDN', 614: 'NETDNA', 615: 'VOXEL', 616: 'RACKSPACE', 617: 'GAMEFORGE', 618: 'METIN2', 619: 'OGAME', 620: 'BATTLEKNIGHT', 621: '4STORY', 622: 'FBMSG', 623: 'GCM',
		 },

		 /**
		  * Constants: Protocol Name, Id 
		  */
		 ProtocolsNameID: {
			 'All': 0, '163': 2, '360': 3, '302_FOUND': 4, '360BUY': 5, '56': 6, '8021Q': 7, '888': 8, 'ABOUT': 9, 'ADCASH': 10, 'ADDTHIS': 11, 'ADF': 12, 'ADOBE': 13, 'AFP': 14, 'AH': 15, 'AIM': 16, 'AIMINI': 17, 'ALIBABA': 18, 'ALIPAY': 19, 'ALLEGRO': 20, 'AMAZON': 21, 'AMEBLO': 22, 'ANCESTRY': 23, 'ANGRYBIRDS': 24, 'ANSWERS': 25, 'AOL': 26, 'APPLE': 27, 'APPLEJUICE': 28, 'ARMAGETRON': 29, 'ARP': 30, 'ASK': 31, 'AVG': 32, 'AVI': 33, 'AWEBER': 34, 'AWS': 35, 'BABYLON': 36, 'BADOO': 37, 'BAIDU': 38, 'BANKOFAMERICA': 39, 'BARNESANDNOBLE': 40, 'BATMAN': 41, 'BATTLEFIELD': 42, 'BATTLENET': 43, 'BBB': 44, 'BBC_ONLINE': 45, 'BESTBUY': 46, 'BETFAIR': 47, 'BGP': 48, 'BIBLEGATEWAY': 49, 'BILD': 50, 'BING': 51, 'BITTORRENT': 52, 'BLEACHERREPORT': 53, 'BLOGFA': 54, 'BLOGGER': 55, 'BLOGSPOT': 56, 'BODYBUILDING': 57, 'BOOKING': 58, 'CBSSPORTS': 59, 'CENT': 60, 'CHANGE': 61, 'CHASE': 62, 'CHESS': 63, 'CHINAZ': 64, 'CITRIX': 65, 'CITRIXONLINE': 66, 'CLICKSOR': 67, 'CNN': 68, 'CNZZ': 69, 'COMCAST': 70, 'CONDUIT': 71, 'COPYSCAPE': 72, 'CORREIOS': 73, 'CRAIGSLIST': 74, 'CROSSFIRE': 75, 'DAILYMAIL': 76, 'DAILYMOTION': 77, 'DCERPC': 78, 'DIRECT_DOWNLOAD_LINK': 79, 'DEVIANTART': 80, 'DHCP': 81, 'DHCPV6': 82, 'DIGG': 83, 'DIRECTCONNECT': 84, 'DNS': 85, 'DOFUS': 86, 'DONANIMHABER': 87, 'DOUBAN': 88, 'DOUBLECLICK': 89, 'DROPBOX': 90, 'EBAY': 91, 'EDONKEY': 92, 'EGP': 93, 'EHOW': 94, 'EKSISOZLUK': 95, 'ELECTRONICSARTS': 96, 'ESP': 97, 'ESPN': 98, 'ETHERNET': 99, 'ETSY': 100, 'EUROPA': 101, 'EUROSPORT': 102, 'FACEBOOK': 103, 'FACETIME': 104, 'FASTTRACK': 105, 'FC2': 106, 'FEIDIAN': 107, 'FIESTA': 108, 'FILETOPIA': 109, 'FIVERR': 110, 'FLASH': 111, 'FLICKR': 112, 'FLORENSIA': 113, 'FOURSQUARE': 114, 'FOX': 115, 'FREE': 116, 'FTP': 117, 'GADUGADU': 118, 'GAMEFAQS': 119, 'GAMESPOT': 120, 'GAP': 121, 'GARANTI': 122, 'GAZETEVATAN': 123, 'GIGAPETA': 124, 'GITHUB': 125, 'GITTIGIDIYOR': 126, 'GLOBO': 127, 'GMAIL': 128, 'GNUTELLA': 129, 'GOOGLE_MAPS': 130, 'GO': 131, 'GODADDY': 132, 'GOO': 133, 'GOOGLE': 134, 'GOOGLE_USER_CONTENT': 135, 'GOSMS': 136, 'GRE': 137, 'GROOVESHARK': 138, 'GROUPON': 139, 'GTALK': 140, 'GTP': 141, 'GTP2': 142, 'GUARDIAN': 143, 'GUILDWARS': 144, 'HABERTURK': 145, 'HAO123': 146, 'HEPSIBURADA': 147, 'HI5': 148, 'HALFLIFE2': 149, 'HOMEDEPOT': 150, 'HOOTSUITE': 151, 'HOTMAIL': 152, 'HTTP': 153, 'HTTP_CONNECT': 154, 'HTTP_PROXY': 155, 'HTTP_APPLICATION_ACTIVESYNC': 156, 'HUFFINGTON_POST': 157, 'HURRIYET': 158, 'I23V5': 159, 'IAX': 160, 'ICECAST': 161, 'APPLE_ICLOUD': 162, 'ICMP': 163, 'ICMPV6': 164, 'IFENG': 165, 'IGMP': 166, 'IGN': 167, 'IKEA': 168, 'IMAP': 169, 'IMAPS': 170, 'INTERNET_MOVIE_DATABASE': 171, 'IMESH': 172, 'IMESSAGE': 173, 'IMGUR': 174, 'INCREDIBAR': 175, 'INDIATIMES': 176, 'INSTAGRAM': 177, 'IP': 178, 'IP_IN_IP': 179, 'IPP': 180, 'IPSEC': 181, 'IPV6': 182, 'IRC': 183, 'IRS': 184, 'APPLE_ITUNES': 185, 'UNENCRYPED_JABBER': 186, 'JAPANPOST': 187, 'KAKAO': 188, 'KAT': 189, 'KAZAA': 190, 'KERBEROS': 191, 'KING': 192, 'KOHLS': 193, 'KONGREGATE': 194, 'KONTIKI': 195, 'L2TP': 196, 'LASTFM': 197, 'LDAP': 198, 'LEAGUEOFLEGENDS': 199, 'LEGACY': 200, 'LETV': 201, 'LINKEDIN': 202, 'LIVE': 203, 'LIVEDOOR': 204, 'LIVEMAIL': 205, 'LIVEINTERNET': 206, 'LIVEJASMIN': 207, 'LIVEJOURNAL': 208, 'LIVESCORE': 209, 'LIVINGSOCIAL': 210, 'LOWES': 211, 'MACYS': 212, 'MAIL_RU': 213, 'MANET': 214, 'MANOLITO': 215, 'MAPLESTORY': 216, 'MATCH': 217, 'MDNS': 218, 'MEDIAFIRE': 219, 'MEEBO': 220, 'MGCP': 221, 'MICROSOFT': 222, 'MILLIYET': 223, 'MINECRAFT': 224, 'MINICLIP': 225, 'MLBASEBALL': 226, 'MMO_CHAMPION': 227, 'MMS': 228, 'MOVE': 229, 'MOZILLA': 230, 'MPEG': 231, 'MSN': 232, 'MSSQL': 233, 'MULTIPLY': 234, 'MYNET': 235, 'MYSPACE': 236, 'MYSQL': 237, 'MYWEBSEARCH': 238, 'NBA': 239, 'NEOBUX': 240, 'NETBIOS': 241, 'NETFLIX': 242, 'NETFLOW': 243, 'NEWEGG': 244, 'NEWSMAX': 245, 'NFL': 246, 'NFS': 247, 'NICOVIDEO': 248, 'NIH': 249, 'NORDSTROM': 250, 'NTP': 251, 'NYTIMES': 252, 'ODNOKLASSNIKI': 253, 'OFF': 254, 'OGG': 255, 'ONET': 256, 'OPENFT': 257, 'ORANGEDONKEY': 258, 'OSCAR': 259, 'OSPF': 260, 'OUTBRAIN': 261, 'OVERSTOCK': 262, 'PANDO': 263, 'PAYPAL': 264, 'PCANYWHERE': 265, 'PCH': 266, 'PCONLINE': 267, 'PHOTOBUCKET': 268, 'PINTEREST': 269, 'PLAYSTATION': 270, 'POGO': 271, 'POP': 272, 'POPS': 273, 'POPO': 274, 'PORNHUB': 275, 'POSTGRES': 276, 'PPLIVE': 277, 'PPP': 278, 'PPPOE': 279, 'PPSTREAM': 280, 'PPTP': 281, 'PREMIERLEAGUE': 282, 'QQ': 283, 'QQLIVE': 284, 'QUAKE': 285, 'QUICKTIME': 286, 'R10': 287, 'RADIUS': 288, 'RAKUTEN': 289, 'RDP': 290, 'REALMEDIA': 291, 'REDDIT': 292, 'REDTUBE': 293, 'REFERENCE': 294, 'RENREN': 295, 'ROBLOX': 296, 'ROVIO': 297, 'RTP': 298, 'RTSP': 299, 'SABAHTR': 300, 'SAHIBINDEN': 301, 'SALESFORCE': 302, 'SALON': 303, 'SCTP': 304, 'SEARCHNU': 305, 'SEARCH_RESULTS': 306, 'SEARS': 307, 'SECONDLIFE': 308, 'SECURESERVER': 309, 'SFLOW': 310, 'SHAZAM': 311, 'SHOUTCAST': 312, 'SINA': 313, 'SIP': 314, 'SITEADVISOR': 315, 'SKY': 316, 'SKYPE': 317, 'SKYROCK': 318, 'SKYSPORTS': 319, 'SLATE': 320, 'SLIDESHARE': 321, 'SMB': 322, 'SMTP': 323, 'SMTPS': 324, 'SNMP': 325, 'SOCRATES': 326, 'SOFTONIC': 327, 'SOGOU': 328, 'SOHU': 329, 'SOPCAST': 330, 'SOSO': 331, 'SOULSEEK': 332, 'SOUNDCLOUD': 333, 'SOURGEFORGE': 334, 'SPIEGEL': 335, 'SPORX': 336, 'SPOTIFY': 337, 'SQUIDOO': 338, 'SSDP': 339, 'SSH': 340, 'SSL': 341, 'STACK_OVERFLOW': 342, 'STATCOUNTER': 343, 'STEALTHNET': 344, 'STEAM': 345, 'STUMBLEUPON': 346, 'STUN': 347, 'SULEKHA': 348, 'SYSLOG': 349, 'TAGGED': 350, 'TAOBAO': 351, 'TARGET': 352, 'TCO': 353, 'TCP': 354, 'TDS': 355, 'TEAMVIEWER': 356, 'TELNET': 357, 'TFTP': 358, 'THEMEFOREST': 359, 'THE_PIRATE_BAY': 360, 'THUNDER': 361, 'TIANYA': 362, 'TLS': 363, 'TMALL': 364, 'TORRENTZ': 365, 'TRUPHONE': 366, 'TUBE8': 367, 'TUDOU': 368, 'TUENTI': 369, 'TUMBLR': 370, 'TVANTS': 371, 'TVUPLAYER': 372, 'TWITTER': 373, 'UBI': 374, 'UCOZ': 375, 'UDP': 376, 'UDPLITE': 377, 'UOL': 378, 'USDEPARTMENTOFSTATE': 379, 'USENET': 380, 'USTREAM': 381, 'HTTP_APPLICATION_VEOHTV': 382, 'VIADEO': 383, 'VIBER': 384, 'VIMEO': 385, 'VK': 386, 'VKONTAKTE': 387, 'VNC': 388, 'WALMART': 389, 'WARRIORFORUM': 390, 'WAYN': 391, 'WEATHER': 392, 'WEBEX': 393, 'WEEKLYSTANDARD': 394, 'WEIBO': 395, 'WELLSFARGO': 396, 'WHATSAPP': 397, 'WIGETMEDIA': 398, 'WIKIA': 399, 'WIKIMEDIA': 400, 'WIKIPEDIA': 401, 'WILLIAMHILL': 402, 'WINDOWSLIVE': 403, 'WINDOWSMEDIA': 404, 'WINMX': 405, 'WINUPDATE': 406, 'WORLD_OF_KUNG_FU': 407, 'WORDPRESS_ORG': 408, 'WARCRAFT3': 409, 'WORLDOFWARCRAFT': 410, 'WOWHEAD': 411, 'WWE': 412, 'XBOX': 413, 'XDMCP': 414, 'XHAMSTER': 415, 'XING': 416, 'XINHUANET': 417, 'XNXX': 418, 'XVIDEOS': 419, 'YAHOO': 420, 'YAHOOGAMES': 421, 'YAHOOMAIL': 422, 'YANDEX': 423, 'YELP': 424, 'YOUKU': 425, 'YOUPORN': 426, 'YOUTUBE': 427, 'ZAPPOS': 428, 'ZATTOO': 429, 'ZEDO': 430, 'ZOL': 431, 'ZYNGA': 432, '3PC': 433, 'ANY_0HOP': 434, 'ANY_DFS': 435, 'ANY_HIP': 436, 'ANY_LOCAL': 437, 'ANY_PES': 438, 'ARGUS': 439, 'ARIS': 440, 'AX_25': 441, 'BBN_RCC_MON': 442, 'BNA': 443, 'BR_SAT_MON': 444, 'CBT': 445, 'CFTP': 446, 'CHAOS': 447, 'COMPAQ_PEER': 448, 'CPHB': 449, 'CPNX': 450, 'CRTP': 451, 'CRUDP': 452, 'DCCP': 453, 'DCN_MEAS': 454, 'DDP': 455, 'DDX': 456, 'DGP': 457, 'EIGRP': 458, 'EMCON': 459, 'ENCAP': 460, 'ETHERIP': 461, 'FC': 462, 'FIRE': 463, 'GGP': 464, 'GMTP': 465, 'HIP': 466, 'HMP': 467, 'I_NLSP': 468, 'IATP': 469, 'IDPR': 470, 'IDPR_CMTP': 471, 'IDRP': 472, 'IFMP': 473, 'IGP': 474, 'IL': 475, 'IPCOMP': 476, 'IPCV': 477, 'IPLT': 478, 'IPPC': 479, 'IPTM': 480, 'IPX_IN_IP': 481, 'IRTP': 482, 'IS_IS': 483, 'ISO_IP': 484, 'ISO_TP4': 485, 'KRYPTOLAN': 486, 'LARP': 487, 'LEAF_1': 488, 'LEAF_2': 489, 'MERIT_INP': 490, 'MFE_NSP': 491, 'MHRP': 492, 'MICP': 493, 'MOBILE': 494, 'MOBILITY_HEADER': 495, 'MPLS_IN_IP': 496, 'MTP': 497, 'MUX': 498, 'NARP': 499, 'NETBLT': 500, 'NSFNET_IGP': 501, 'NVP_II': 502, 'PGM': 503, 'PIM': 504, 'PIPE': 505, 'PNNI': 506, 'PRM': 507, 'PTP': 508, 'PUP': 509, 'PVP': 510, 'QNX': 511, 'RSVP': 512, 'RSVP_E2E_IGNORE': 513, 'RVD': 514, 'SAT_EXPAK': 515, 'SAT_MON': 516, 'SCC_SP': 517, 'SCPS': 518, 'SDRP': 519, 'SECURE_VMTP': 520, 'SHIM6': 521, 'SKIP': 522, 'SM': 523, 'SMP': 524, 'SNP': 525, 'SPRITE_RPC': 526, 'SPS': 527, 'SRP': 528, 'SSCOPMCE': 529, 'ST': 530, 'STP': 531, 'SUN_ND': 532, 'SWIPE': 533, 'TCF': 534, 'TLSP': 535, 'TP_PP': 536, 'TRUNK_1': 537, 'TRUNK_2': 538, 'UTI': 539, 'VINES': 540, 'VISA': 541, 'VMTP': 542, 'VRRP': 543, 'WB_EXPAK': 544, 'WB_MON': 545, 'WSN': 546, 'XNET': 547, 'XNS_IDP': 548, 'XTP': 549, 'BUZZNET': 550, 'COMEDY': 551, 'RAMBLER': 552, 'SMUGMUG': 553, 'ARCHIEVE': 554, 'CITYNEWS': 555, 'SCIENCESTAGE': 556, 'ONEWORLD': 557, 'DISQUS': 558, 'BLOGCU': 559, 'EKOLEY': 560, '500PX': 561, 'FOTKI': 562, 'FOTOLOG': 563, 'JALBUM': 564, 'LOCKERZ': 565, 'PANORAMIO': 566, 'SNAPFISH': 567, 'WEBSHOTS': 568, 'MEGA': 569, 'VIDOOSH': 570, 'AFREECA': 571, 'WILDSCREEN': 572, 'BLOGTV': 573, 'HULU': 574, 'MEVIO': 575, 'LIVESTREAM': 576, 'LIVELEAK': 577, 'DEEZER': 578, 'BLIPTV': 579, 'BREAK': 580, 'CITYTV': 581, 'COMEDYCENTRAL': 582, 'ENGAGEMEDIA': 583, 'SCREENJUNKIES': 584, 'RUTUBE': 585, 'SEVENLOAD': 586, 'MUBI': 587, 'IZLESENE': 588, 'VIDEO_HOSTING': 589, 'BOX': 590, 'SKYDRIVE': 591, '7DIGITAL': 592, 'CLOUDFRONT': 593, 'TANGO': 594, 'WECHAT': 595, 'LINE': 596, 'BLOOMBERG': 597, 'MSCDN': 598, 'AKAMAI': 599, 'YAHOOMSG': 600, 'BITGRAVITY': 601, 'CACHEFLY': 602, 'CDN77': 603, 'CDNETWORKS': 604, 'CHINACACHE': 605, 'COTENDO': 606, 'EDGECAST': 607, 'FASTLY': 608, 'HIGHWINDS': 609, 'INTERNAP': 610, 'LEVEL3': 611, 'LIMELIGHT': 612, 'MAXCDN': 613, 'NETDNA': 614, 'VOXEL': 615, 'RACKSPACE': 616, 'GAMEFORGE': 617, 'METIN2': 618, 'OGAME': 619, 'BATTLEKNIGHT': 620, '4STORY': 621, 'FBMSG': 622, 'GCM': 623,
		 },

		 CategoriesIdsMap: {
			 0:'All', 1:'Web', 2:'P2P', 3:'Gaming', 4:'Streaming', 5:'Conversational', 6:'Mail', 7:'FileTransfer', 8:'CloudStorage', 9:'DirectDownloadLink', 10:'Network', 11:'Tunnelling', 12:'DataBase', 13:'Remote', 14:'Misc', 15:'CDN'
		 },

		 CategoriesNamesMap: {
			 'All':0, 'Web':1, 'P2P':2, 'Gaming':3, 'Streaming':4, 'Conversational':5, 'Mail':6, 'FileTransfer':7, 'CloudStorage':8, 'DirectDownloadLink':9, 'Network':10, 'Tunnelling':11, 'DataBase':12, 'Remote':13, 'Misc':14, 'CDN':15
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


		 CategoriesAppsNamesMap: {
			 1: ['163', '360', '302_FOUND', '360BUY', '56', 'ABOUT', 'ADCASH', 'ADDTHIS', 'ADF', 'ADOBE', 'AFP', 'ALIBABA', 'ALIPAY', 'ALLEGRO', 'AMAZON', 'AMEBLO', 'ANCESTRY', 'ANSWERS', 'AOL', 'APPLE', 'ASK', 'AVG', 'AVI', 'AWEBER', 'AWS', 'BABYLON', 'BAIDU', 'BANKOFAMERICA', 'BARNESANDNOBLE', 'BBB', 'BBC_ONLINE', 'BESTBUY', 'BIBLEGATEWAY', 'BILD', 'BING', 'BLEACHERREPORT', 'BLOGFA', 'BLOGGER', 'BLOGSPOT', 'BODYBUILDING', 'BOOKING', 'CBSSPORTS', 'CENT', 'CHANGE', 'CHASE', 'CHINAZ', 'CLICKSOR', 'CNN', 'CNZZ', 'COMCAST', 'CONDUIT', 'COPYSCAPE', 'CORREIOS', 'CRAIGSLIST', 'DAILYMAIL', 'DEVIANTART', 'DIGG', 'DONANIMHABER', 'DOUBAN', 'DOUBLECLICK', 'EBAY', 'EHOW', 'EKSISOZLUK', 'ESPN', 'ETSY', 'EUROPA', 'EUROSPORT', 'FACEBOOK', 'FC2', 'FIVERR', 'RTMP', 'FLICKR', 'FOURSQUARE', 'FOX', 'FREE', 'GAP', 'GARANTI', 'GAZETEVATAN', 'GIGAPETA', 'GITHUB', 'GITTIGIDIYOR', 'GLOBO', 'GOOGLE_MAPS', 'GO', 'GODADDY', 'GOO', 'GOOGLE', 'GOOGLE_USER_CONTENT', 'GROUPON', 'GUARDIAN', 'HABERTURK', 'HAO123', 'HEPSIBURADA', 'HI5', 'HOMEDEPOT', 'HOOTSUITE', 'HTTP', 'HTTP_CONNECT', 'HTTP_PROXY', 'HUFFINGTONPOST', 'HURRIYET', 'I23V5', 'IFENG', 'IKEA', 'IMDB', 'IMGUR', 'INCREDIBAR', 'INDIATIMES', 'INSTAGRAM', 'IRS', 'JAPANPOST', 'KAT', 'KOHLS', 'LEGACY', 'LETV', 'LINKEDIN', 'LIVE', 'LIVEDOOR', 'LIVEINTERNET', 'LIVEJASMIN', 'LIVEJOURNAL', 'LIVESCORE', 'LIVINGSOCIAL', 'LOWES', 'MACYS', 'MATCH', 'MICROSOFT', 'MILLIYET', 'MLBASEBALL', 'MOZILLA', 'MULTIPLY', 'MYNET', 'MYSPACE', 'MYWEBSEARCH', 'NBA', 'NEOBUX', 'NEWEGG', 'NEWSMAX', 'NFL', 'NICOVIDEO', 'NIH', 'NORDSTROM', 'NYTIMES', 'ODNOKLASSNIKI', 'ONET', 'ORANGEDONKEY', 'OUTBRAIN', 'OVERSTOCK', 'PAYPAL', 'PCONLINE', 'PHOTOBUCKET', 'PINTEREST', 'POPO', 'PORNHUB', 'PREMIERLEAGUE', 'QQ', 'QUICKTIME', 'R10', 'RAKUTEN', 'REDDIT', 'REDTUBE', 'REFERENCE', 'RENREN', 'SABAHTR', 'SAHIBINDEN', 'SALESFORCE', 'SALON', 'SEARCHNU', 'SEARCH_RESULTS', 'SEARS', 'SECURESERVER', 'SINA', 'SITEADVISOR', 'SKY', 'SKYROCK', 'SKYSPORTS', 'SLATE', 'SLIDESHARE', 'SOCRATES', 'SOFTONIC', 'SOGOU', 'SOHU', 'SOSO', 'SOUNDCLOUD', 'SOURGEFORGE', 'SPIEGEL', 'SPORX', 'SQUIDOO', 'STACK_OVERFLOW', 'STATCOUNTER', 'STUMBLEUPON', 'SULEKHA', 'TAGGED', 'TAOBAO', 'TARGET', 'TCO', 'THEMEFOREST', 'THE_PIRATE_BAY', 'TIANYA', 'TMALL', 'TUBE8', 'TUDOU', 'TUENTI', 'TUMBLR', 'TWITTER', 'UCOZ', 'UOL', 'USDEPARTMENTOFSTATE', 'USENET', 'VIADEO', 'VK', 'VKONTAKTE', 'WALMART', 'WARRIORFORUM', 'WAYN', 'WEATHER', 'WEEKLYSTANDARD', 'WEIBO', 'WELLSFARGO', 'WIGETMEDIA', 'WIKIA', 'WIKIMEDIA', 'WIKIPEDIA', 'WILLIAMHILL', 'WINDOWSLIVE', 'WINDOWSMEDIA', 'WINUPDATE', 'WORDPRESS_ORG', 'WWE', 'XHAMSTER', 'XING', 'XINHUANET', 'XNXX', 'XVIDEOS', 'YAHOO', 'YANDEX', 'YELP', 'YOUKU', 'YOUPORN', 'ZAPPOS', 'ZEDO', 'ZOL', 'BUZZNET', 'COMEDY', 'RAMBLER', 'SMUGMUG', 'ARCHIEVE', 'CITYNEWS', 'SCIENCESTAGE', 'ONEWORLD', 'DISQUS', 'BLOGCU', 'EKOLEY', '500PX', 'FOTKI', 'FOTOLOG', 'JALBUM', 'LOCKERZ', 'PANORAMIO', 'SNAPFISH', 'WEBSHOTS', 'BREAK', 'ENGAGEMEDIA', 'BLOOMBERG', 'MSCDN', 'GCM'],
			 2: ['AIMINI', 'APPLEJUICE', 'BITTORRENT', 'DIRECTCONNECT', 'EDONKEY', 'FASTTRACK', 'FILETOPIA', 'GNUTELLA', 'IMESH', 'KAZAA', 'MANOLITO', 'OPENFT', 'PANDO', 'SOULSEEK', 'STEALTHNET', 'THUNDER', 'TORRENTZ', 'WINMX'],
			 3: ['888', 'ANGRYBIRDS', 'ARMAGETRON', 'BATTLEFIELD', 'BATTLENET', 'BETFAIR', 'CHESS', 'CROSSFIRE', 'DOFUS', 'ELECTRONICSARTS', 'FIESTA', 'FLORENSIA', 'GAMEFAQS', 'GAMESPOT', 'GUILDWARS', 'HALFLIFE2', 'IGN', 'KING', 'KONGREGATE', 'LEAGUEOFLEGENDS', 'MAPLESTORY', 'MINECRAFT', 'MINICLIP', 'MMO_CHAMPION', 'PCH', 'PLAYSTATION', 'POGO', 'QUAKE', 'ROBLOX', 'ROVIO', 'SECONDLIFE', 'STEAM', 'UBI', 'WORLD_OF_KUNG_FU', 'WARCRAFT3', 'WORLDOFWARCRAFT', 'WOWHEAD', 'XBOX', 'YAHOOGAMES', 'ZYNGA', 'GAMEFORGE', 'METIN2', 'OGAME', 'BATTLEKNIGHT', '4STORY'],
			 4: ['DAILYMOTION', 'FEIDIAN', 'GROOVESHARK', 'ICECAST', 'APPLE_ITUNES', 'KONTIKI', 'LASTFM', 'MMS', 'MOVE', 'MPEG', 'NETFLIX', 'OFF', 'OGG', 'PPLIVE', 'PPSTREAM', 'QQLIVE', 'REALMEDIA', 'RTP', 'RTSP', 'SHAZAM', 'SHOUTCAST', 'SOPCAST', 'SPOTIFY', 'TVANTS', 'TVUPLAYER', 'USTREAM', 'HTTP_APPLICATION_VEOHTV', 'VIMEO', 'YOUTUBE', 'ZATTOO', 'VIDOOSH', 'AFREECA', 'WILDSCREEN', 'BLOGTV', 'HULU', 'MEVIO', 'LIVESTREAM', 'LIVELEAK', 'DEEZER', 'BLIPTV', 'CITYTV', 'COMEDYCENTRAL', 'SCREENJUNKIES', 'RUTUBE', 'SEVENLOAD', 'MUBI', 'IZLESENE', 'VIDEO_HOSTING', '7DIGITAL'],
			 5: ['AIM', 'BADOO', 'FACETIME', 'GADUGADU', 'GOSMS', 'GTALK', 'IAX', 'IMESSAGE', 'IRC', 'JABBER', 'KAKAO', 'MEEBO', 'MGCP', 'MSN', 'OSCAR', 'SIP', 'SKYPE', 'TRUPHONE', 'VIBER', 'WHATSAPP', 'TANGO', 'WECHAT', 'LINE', 'YAHOOMSG', 'FBMSG'],
			 6: ['GMAIL', 'HOTMAIL', 'IMAP', 'IMAPS', 'LIVEMAIL', 'MAIL_RU', 'POP', 'POPS', 'SMTP', 'SMTPS', 'YAHOOMAIL'],
			 7: ['FTP', 'NFS', 'SMB', 'TFTP'],
			 8: ['DROPBOX', 'ICLOUD', 'BOX', 'SKYDRIVE'],
			 9: ['DIRECT_DOWNLOAD_LINK', 'MEDIAFIRE', 'MEGA'],
			 10: ['8021Q', 'AH', 'ARP', 'BATMAN', 'BGP', 'DHCP', 'DHCPV6', 'DNS', 'EGP', 'ESP', 'ETHERNET', 'ICMP', 'ICMPV6', 'IGMP', 'IP', 'IPP', 'IPSEC', 'IPV6', 'KERBEROS', 'LDAP', 'MANET', 'MDNS', 'NETBIOS', 'NETFLOW', 'NTP', 'OSPF', 'RADIUS', 'SCTP', 'SFLOW', 'SNMP', 'SSDP', 'SSL', 'STUN', 'SYSLOG', 'TCP', 'TLS', 'UDP', 'UDPLITE', '3PC', 'ANY_0HOP', 'ANY_DFS', 'ANY_HIP', 'ANY_LOCAL', 'ANY_PES', 'ARGUS', 'ARIS', 'AX_25', 'BBN_RCC_MON', 'BNA', 'BR_SAT_MON', 'CBT', 'CFTP', 'CHAOS', 'COMPAQ_PEER', 'CPHB', 'CPNX', 'CRTP', 'CRUDP', 'DCCP', 'DCN_MEAS', 'DDP', 'DDX', 'DGP', 'EIGRP', 'EMCON', 'ENCAP', 'FC', 'FIRE', 'GGP', 'GMTP', 'HIP', 'HMP', 'I_NLSP', 'IATP', 'IDPR', 'IDPR_CMTP', 'IDRP', 'IFMP', 'IGP', 'IL', 'IPCOMP', 'IPCV', 'IPLT', 'IPPC', 'IPTM', 'IRTP', 'IS_IS', 'ISO_IP', 'ISO_TP4', 'KRYPTOLAN', 'LARP', 'LEAF_1', 'LEAF_2', 'MERIT_INP', 'MFE_NSP', 'MHRP', 'MICP', 'MOBILE', 'MOBILITY_HEADER', 'MTP', 'MUX', 'NARP', 'NETBLT', 'NSFNET_IGP', 'NVP_II', 'PGM', 'PIM', 'PIPE', 'PNNI', 'PRM', 'PTP', 'PUP', 'PVP', 'QNX', 'RSVP', 'RSVP_E2E_IGNORE', 'RVD', 'SAT_EXPAK', 'SAT_MON', 'SCC_SP', 'SCPS', 'SDRP', 'SECURE_VMTP', 'SHIM6', 'SKIP', 'SM', 'SMP', 'SNP', 'SPRITE_RPC', 'SPS', 'SRP', 'SSCOPMCE', 'ST', 'STP', 'SUN_ND', 'SWIPE', 'TCF', 'TLSP', 'TP_PP', 'TRUNK_1', 'TRUNK_2', 'UTI', 'VINES', 'VISA', 'VMTP', 'VRRP', 'WB_EXPAK', 'WB_MON', 'WSN', 'XNET', 'XNS_IDP', 'XTP'],
			 11: ['GRE', 'GTP', 'GTP2', 'IP_IN_IP', 'L2TP', 'PPP', 'PPPOE', 'PPTP', 'ETHERIP', 'IPX_IN_IP', 'MPLS_IN_IP'],
			 12: ['MSSQL', 'MYSQL', 'POSTGRES', 'TDS'],
			 13: ['PCANYWHERE', 'RDP', 'SSH', 'TEAMVIEWER', 'TELNET', 'VNC', 'XDMCP'],
			 14: ['CITRIX', 'CITRIXONLINE', 'DCERPC', 'HTTP_ACTIVESYNC', 'WEBEX'],
			 15: ['CLOUDFRONT', 'AKAMAI', 'BITGRAVITY', 'CACHEFLY', 'CDN77', 'CDNETWORKS', 'CHINACACHE', 'COTENDO', 'EDGECAST', 'FASTLY', 'HIGHWINDS', 'INTERNAP', 'LEVEL3', 'LIMELIGHT', 'MAXCDN', 'NETDNA', 'VOXEL', 'RACKSPACE'],
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
		 getAppId : function(path) {
			 var n = path.toString().lastIndexOf(".");
			 return path.toString().substring(n + 1, path.toString().length);
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

		 period : {
			 MINUTE : "minute",
			 HOUR	: "hour",
			 DAY	: "day",
			 WEEK: "week",
			 MONTH	: "month",
		 }
};


///////////////////////////////////////////////////////////////////////////////////////////
//class MMTDrop.Parameters
//get or set parameters from/to local storage
///////////////////////////////////////////////////////////////////////////////////////////
MMTDrop.Parameters = function (){
	var support = true;
	//check if browser supports localStorage
	var storage = window.localStorage;
	try {
		storage.setItem("test", "1");
		storage.removeItem("test");
	} catch (error) {
		storage = window.fakeStorage;	//TODO add code for fakeStorage
	}
	
	this.get = function (key){
		return JSON.parse(storage.getItem(key));
	};

	this.set = function(key, value){
		storage.setItem(key, JSON.stringify(value));
	};

	this.remove = function (key){
		storage.removeItem(key);
	}
}();


///////////////////////////////////////////////////////////////////////////////////////////
//class MMTDrop.Database
//get data from database via MMT-Operator
///////////////////////////////////////////////////////////////////////////////////////////
MMTDrop.tools = {
		/**
		 * Convert an object to an array
		 */
		object2Array : function ( obj ){
			return Object.keys(obj).map(function(key){
				return obj[key];
			});
		},

		/**
		 * Get the first element of an Object or Array
		 * @param obj
		 * @returns
		 */
		getFirstElement : function( obj ){
			for (var key in obj)
				return obj[key];
		}

};


///////////////////////////////////////////////////////////////////////////////////////////
//class MMTDrop.Database
//get data from database via MMT-Operator
///////////////////////////////////////////////////////////////////////////////////////////
MMTDrop.Database = {

		/**
		 * Get data from MMT-Operator
		 * @param param = { format: {99, 0, 1, 2, 3},			//default:  99     <br/>
	   			probe : number								//			any    <br/>
	   			source: text								//			any    <br/>
	   			period: {minute, hour, day, week, month}	//			minute <br/>
	   			raw	  : {true, false}						//			true   <br/>
		 * @param callback is an object containing callback functions.
		 *  It has form {error: callback1, success: callback2}: 
		 *  	callback1 and callback2 are called when getting data fail or success, respectively.<br/>
		 *  They take the form: @{callback1(xhr, status, error)} and @{callback2(data)} 
		 *  @return null if the parameter @{callback} presents. 
		 *  Otherwise, the function is call synchronously and returns data after getting them from database.
		 */
		get : function(param, callback){

			//if operatorURL is not defined, we take local
			var url = (operatorURL || "/traffic/data");

			//asyn
			if (callback){
				$.ajax({
					url		: url,
					type	: "GET",
					dataType: "json",
					data	: param,
					cache	: false,

					error 	: callback.error, //(xhr, status, error),
					success	: callback.sucess, // (data)
				});
				return;
			}

			$.ajax({
				url		: url,
				type	: "GET",
				dataType: "json",
				data	: param,
				cache	: false,
				async	: false,
				error 	: function(xhr, status, error){
					return null;
				},
				success	: function(data){
					return data;
				}
			});
		},

		/**
		 * Split data to n arrays arr1, arr2, ..., arrn. Each array contains data elements having the same "probe"
		 * @param data: is an array of messages
		 * @return an Object whose elements key-value are <br/>
		 * 	- key  : is ID of probe<br/>
		 *  - value: is an array of messages captured by this probe
		 */
		splitDataByProbe : function( data ){
			var obj = {};
			for (var i=0; i<data.length; i++){
				var msg = data[i];
				var probeID = msg[1];  //msg[0] = format, msg[2] = source, msg[3] = time
				if (obj[probeID] == undefined)
					//create a new array for this probeID
					obj[probeID] = [];

				obj[probeID].push(msg);
			}
			return obj;
		}
}

///////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////
//class MMTDrop.ReportFactory
//It is an object. It creates several pre-defined reports.
///////////////////////////////////////////////////////////////////////////////////////////

MMTDrop.ReportFactory = {
		createApplicationReport: function(elemid, gstats) {
			var report = new MMTDrop.Reports({
				'stats': gstats,
				'elemid': elemid,
				'title': "Application Report",
				'elements': [
				             {'chart': [{'type':'timeline',
				            	 'options': {
				            		 'getDataFct': MMTDrop.DataFactory.createAppsTimeLineChart,
				            		 'seriesName': "Packet Count",
				            		 'ylabel': "Number of Packets"
				            	 }},
				            	 {'type':'pie',
				            		 'options': {
				            			 'getDataFct': MMTDrop.DataFactory.createAppsPieChart,
				            			 'seriesName': "Packet Count",
				            			 'ylabel': "Number of Packets"
				            		 }},{'type':'bar',
				            			 'options': {
				            				 'getDataFct': MMTDrop.DataFactory.createAppsBarChart,
				            				 'seriesName': "Packet Count",
				            				 'ylabel': "Number of Packets"
				            			 }},
				            			 {'type':'table',
				            				 'options': {
				            					 'colnames': ["Name", "Packets", "Data", "Payload", "Flows"],
				            					 'getDataArgs': [MMTDrop.MetricId.PACKET_COUNT, MMTDrop.MetricId.DATA_VOLUME, MMTDrop.MetricId.PAYLOAD_VOLUME, MMTDrop.MetricId.ACTIVE_FLOWS],
				            					 'getDataFct': MMTDrop.DataFactory.createApplicationTableData,
				            				 }}
				            			 ],
				            			 'pos': [0, 12]},                  
				            			 ],
				            			 'filter': [{ 'type': 'appname', 'label': 'App',    'select': function(e){}},
				            			            {'type': 'metric',  'label': 'Metric', 'select': function(e){}},
				            			            {'type': 'period',  'label': 'Period', 'select': function(e){redraw(e);}},
				            			            {'type': 'probe',   'label': 'Probe',  'select': function(e){}}]
			});
			return report;
		},

		createProtocolTreeReport: function(elemid, gstats) {
			var report = new MMTDrop.Reports.Chart({
				'type':'tree',
				'gstats': gstats,
				'elemid': elemid,
				'colnames': ["Name", "UL Packets", "DL Packets", "Total Packets", "UL Bytes", "DL Bytes", "Total Bytes"],
				'getDataFct': MMTDrop.DataFactory.createTreeTableData,
				'link': function(row) {return  "#appreport?appname=" + MMTDrop.getAppName(row[0].toString());}
			//'dblclick': function(ev){
			//		window.location = "#appreport?appname=" + MMTDrop.getAppName(ev.data.path.toString());
			//	}
			});
			return report;
		},

		createAppCategoriesReport: function(elemid, gstats) {
			var report = new MMTDrop.Reports({
				'stats': gstats,
				'elemid': elemid,
				'title': "Application Categories Report",
				'elements': [
				             {'chart': [
				                        {'type':'pie',
				                        	'options': {
				                        		'getDataFct': MMTDrop.DataFactory.createAppCategoryMetricPie,
				                        		'seriesName': "Packet Count",
				                        		'ylabel': "Number of Packets"
				                        	}},
				                        	{'type':'bar',
				                        		'options': {
				                        			'getDataFct': MMTDrop.DataFactory.createAppCategoryMetricBar,
				                        			'seriesName': "Packet Count",
				                        			'ylabel': "Number of Packets"
				                        		}}                        
				                        	],
				                        	'pos': [0, 12]}
				             ],
				             'filter': [{'type': 'appclass', 'label': 'Class', 'select': function(e){}},
				                        {'type': 'metric', 'label': 'Metric', 'select': function(e){}}]
//			{'type': 'period', 'label': 'Period', 'select': function(e){console.log(e);}}]
			});
			return report;
		},

		createTrafficOverviewReport: function(elemid, gstats) {
			var report = new MMTDrop.Reports({
				'stats': gstats,
				'elemid': elemid,
				'title': "Protocol Hierarchy",
				'elements': [
				             {'chart': [{
				            	 'type':'tree',
				            	 'options': {
				            		 'colnames': ["Name", "Packets", "Data"],
				            		 'getDataArgs': [MMTDrop.MetricId.PACKET_COUNT, MMTDrop.MetricId.DATA_VOLUME],
				            		 'getDataFct': MMTDrop.DataFactory.createTreeTableData,
				            		 'multiSelect': true,
				            		 'click': function(ev){
				            			 apppaths = [];
				            			 for(p in ev.data.path) {
				            				 apppaths.push(ev.data.path[p].toString());
				            			 }
				            			 ev.data.chart.report.setFilter({'apppaths': apppaths});
				            			 //this report contains two elements, 0 is the treetable
				            			 //1 is the chart
				            			 ev.data.chart.report.updateElement(1);
				            		 },
				            		 'link': function(row) {return  "#appreport?appname=" + MMTDrop.getAppName(row[0].toString());}
				            		 //'dblclick': function(ev){
				            		 //window.location = "#appreport?appname=" + MMTDrop.getAppName(ev.data.path.toString());
				            		 //}
				            	 }
				             }],
				             'pos': [0, 4]
				             },
				             {'chart': [{'type':'timeline',
				            	 'options': {
				            		 'getDataFct': MMTDrop.DataFactory.createAppPathTimeLineChart,
				            		 'seriesName': "Packet Count",
				            	 }}
				             ],
				             'pos': [0, 8]},
				             ],
				             'filter': [{'type': 'metric', 'label': 'Metric', 'select': function(e){}}]
//			{'type': 'period', 'label': 'Period', 'select': function(e){}}]
			});
			return report;
		},


		createFlowReport : function(elem, gstats){

		}
};


///////////////////////////////////////////////////////////////////////////////////////////
//class MMTDrop.Reports
//It is a class. It creates a generale report.
///////////////////////////////////////////////////////////////////////////////////////////

/** Class: MMTDrop.Reports
 *  An object container for all MMTDrop.Reports functions.
 */
MMTDrop.Reports = function(options) {
	this.elements = [];
	this.elempos = [];
	this.filters = [];
	this.active_chart = 0;
	this.stats = options.stats;
	this.elemid = options.elemid;
	this.title = options.title;
	this.isInit = false;
	this.filter = {};
	this.linepos = 0;        

	for(elem in options.elements) {
		var elemopts = options.elements[elem];
		elemopts.elemid = this.elemid + '_elem' + elem;
		elem = this.initElement(elemopts);
		for (i in elemopts.chart) {
			var chartopts = elemopts.chart[i];
			var type = chartopts.type;
			var opt = chartopts.options;
			opt.report = this;
			opt.type = type;
			opt.gstats = this.stats;
			opt.elemid = elemopts.elemid + '_chart';
			if (chartopts.isdefault) {
				elem.active_chart = i;
			}
			this.initChart(elem, opt);
		}
	}

	for (i in options.filter) {
		this.initFilter(options.filter[i]);
	}
};

MMTDrop.Reports.prototype = {
		/**
		 * Renders the report 
		 */
		render : function(filter) {
			this.setFilter(filter);

			if (this.isInit) {
				this.updateElements();
				return;
			}
			this.setInit();

			report_header =  $('<div>', {

			});
			report_header.appendTo($('#' + this.elemid));

			if(this.title) {
				report_title = $('<h1>', {'class': 'page-header', 'style': 'margin-bottom: 10px;', 'text': this.title});
				report_title.appendTo(report_header);
			}

			control_row = $('<div>', {'class': 'row', 'style': 'margin-bottom: 10px;'});
			control_row.appendTo(report_header);
			for (i in this.filters) {
				var fcontainer = $('<div>', {'class': 'col-xs-6 col-sm-4 col-md-3 col-lg-2  pull-right'});
				var fdiv = $('<div>', {'class': 'input-group pull-right'});
				var span = $('<span>', {'class': 'input-group-addon', 'text': this.filters[i].label});
				var ftr = $('<select>', {
					'id' : this.elemid + '_ftr_' + i,
					'class' : 'form-control'
				});
				for (j in this.filters[i].data) {
					var opt = $('<option>', {
						'text' : this.filters[i].data[j],
						'value' : this.filters[i].data[j]
					});
					opt.appendTo(ftr);
				}
				span.appendTo(fdiv);
				ftr.appendTo(fdiv);
				fdiv.appendTo(fcontainer);
				fcontainer.appendTo(control_row);
			}  

			elemcount = 0;
			for(l in this.elempos) {
				var line = $('<div>', {
					'class': 'row'
				});
				line.appendTo($('#' + this.elemid));
				for(e in this.elempos[l]) {
					var row = $('<div>', {
						'class': 'col-md-' + this.elempos[l][e].width
					});
					row.appendTo(line);
					elem = this.elempos[l][e].elem;
					var elem_div = $('<div>', {
						'id' :elem.elemid,
						'class': 'report-element'
					});
					elem_div.appendTo(row);

					if (elem.buttons.length > 1) {
						var btngroup = $('<div>', {
							'id' : elem.elemid + '_btngrp',
							'class' : 'report-element-top btn-group center'
						});
						for (i in elem.buttons) {
							var btn = $('<button>', {
								'id' : elem.elemid + '_btn_' + i,
								'class' : 'btn btn-large',
								//'text' : elem.buttons[i]
							}).append(this.getChartTypeIconByName(elem.buttons[i]));
							btn.appendTo(btngroup);
						}
						btngroup.appendTo(elem_div);
					}

					var chart = $('<div>', {
						'id' : elem.elemid + '_chart'                                         
					});

					chart.appendTo(elem_div);
					elem.charts[elem.active_chart].render(this.filter);

					if (elem.buttons.length > 1) {
						for (i in elem.buttons) {
							$('#' + elem.elemid + '_btn_' + i).click({
								bid : i,
								elemid : elemcount,
								elem : elem,
								report : this
							}, function(e) {
								if (e.data.elem.chartchange) {
									e.data.elem.chartchange(e.data.bid);
								}
								if (e.data.bid == e.data.elem.active_chart) {
									return;
									//same chart, do nothing
								} else {
									e.data.report.updateChart(e.data.elemid, e.data.bid);
								}
							});
						}
					}
					elemcount ++;
				}
			}

			for (i in this.filters) {
				$('#' + this.elemid + '_ftr_' + i).change({
					fid : i,
					report : this
				}, function(e, ui) {
					if (e.data.report.filters[e.data.fid].select) {
						e.data.report.filters[e.data.fid].select($(this).find('option:selected').val());
					}
					if (e.data.fid === 'appname') {
						e.data.report.filter.appname = $(this).find('option:selected').val();
					} else if (e.data.fid === 'metric') {
						e.data.report.filter.metric = $(this).find('option:selected').val();
					} else if (e.data.fid === 'flowmetric') {
						e.data.report.filter.flowmetric = $(this).find('option:selected').val();
					} else if (e.data.fid === 'appclass') {
						e.data.report.filter.appclass = $(this).find('option:selected').val();
					} else {
						e.data.report.filter[ e.data.fid ] = $(this).find('option:selected').val();
					}
					e.data.report.updateElements();
				});
			}

		},

		/**
		 * Updates the report chart at index id  
		 */
		updateChart : function(elemid, id) {
			elem = this.elements[elemid];
			var old_chart = elem.charts[elem.active_chart];
			old_chart.destroy();
			elem.charts[id].render(this.filter);
			elem.active_chart = id;
		},

		/**
		 * Updates the report element at index id  
		 */
		updateElement : function(id) {
			this.updateChart(id, this.elements[id].active_chart);
		},

		/**
		 * Updates the report elements  
		 */
		updateElements : function() {
			for(id in this.elements) {
				this.updateElement(id);
			}
		},

		/**
		 * Initializes a report chart based on the given options 
		 */
		initChart : function(elem, options) {
			if (options.type == "bar") {
				elem.charts.push(new MMTDrop.Reports.Chart(options));
				elem.buttons.push(options.type);
			} else if (options.type == "pie") {
				elem.charts.push(new MMTDrop.Reports.Chart(options));
				elem.buttons.push(options.type);
			} else if (options.type == "tree") {
				elem.charts.push(new MMTDrop.Reports.Chart(options));
				elem.buttons.push(options.type);                        
			} else if (options.type == "table") {
				elem.charts.push(new MMTDrop.Reports.Chart(options));
				elem.buttons.push(options.type);
			} else if (options.type == "timeline" || options.type == "scatter" || options.type == "xy") {
				elem.charts.push(new MMTDrop.Reports.Chart(options));
				elem.buttons.push(options.type);
			}
		},

		/**
		 * Initializes a report element based on the given options 
		 */
		initElement : function(options) {
			this.elements.push({charts: [], buttons: [], active_chart: 0, elemid: options.elemid,
				chartchange: options.chartchange});
			if(options.pos) {
				if(this.elempos[options.pos[0]]) {
					this.elempos[options.pos[0]].push({width: Math.min(options.pos[1], 12), elem: this.elements[this.elements.length -1]});
				} else {
					this.elempos[options.pos[0]] = [];
					this.elempos[options.pos[0]].push({width: Math.min(options.pos[1], 12), elem: this.elements[this.elements.length -1]});
				}
				this.linepos = Math.max(this.linepos, options.pos[0]);
			}else {
				this.linepos += 1;
				this.elempos[this.linepos] = {width: 12, elem: this.elements[this.elements.length -1]};
			}
			return this.elements[this.elements.length -1];
		},

		/**
		 * Initializes a report filter 
		 */
		initFilter : function(options) {
			if (options.type) {
				this.filters[options.type] = {
						type  : options.type,
						label : options.label || options.type,
						data  : options.data || null,
				};
				if (options.select) {
					this.filters[options.type].select = options.select;
				}
				if ( options.data ) {
					this.filter[options.type] = options.data[1];
					console.log('init filter', this.filter[options.type]);
				}
				if (options.type == "appname") {
					data = [];
					data[0] = 'All';
					this.filters[options.type].data = data.concat(this.stats.getActiveAppNames());
					this.filter.appname = 'All';
					this.filter.appid = MMTDrop.ProtocolsNameID[this.filter.appname];				
				} else if (options.type == "appclass") {
					data = [];
					data[0] = 'All';
					this.filters[options.type].data = data.concat(this.stats.getActiveAppCategoriesNames());
					//this.filter.appclass = this.filters[options.type].data[0]; 
					this.filter.appclass = 'All';
					this.filter.appclassid = MMTDrop.CategoriesNamesMap[this.filter.appclass]; 
				} else if (options.type == "metric") {
					this.filters[options.type].data = MMTDrop.MetricID2Name;
					this.filter.metric = MMTDrop.MetricID2Name[MMTDrop.MetricId.DATA_VOLUME];
				}else if (options.type == "flowmetric") {
					this.filters[options.type].data = MMTDrop.FlowMetricID2Name;
					this.filter.flowmetric = MMTDrop.FlowMetricID2Name[MMTDrop.FlowMetricId.DATA_VOLUME];
				} else if (options.type == "period") {
					this.filters[options.type].data = ['1 Hour', '1 Day', '1 Week', '1 Month'];
					this.filter.period = '1 Hour';
				} else if (options.type === "probe") {
					
				}
			}
		},

		/**
		 * Sets a filter option (control option) 
		 */
		setFilter : function(filter) {
			if (filter) {
				for(f in filter) {
					if ((f === "appname") && (this.filter.appname != filter.appname)) {
						this.filter.appname = filter.appname;
						this.filter.appid = MMTDrop.ProtocolsNameID[filter.appname];
						//Update the filter if it exists
						$('#' + this.elemid + '_ftr_appname').val(filter.appname);
					} else if ((f === "metric") && (this.filter.metric != filter.metric)) {
						this.filter.metric = filter.metric;
						this.filter.metricid = MMTDrop.MetricName2ID[filter.metric];
						//Update the filter if it exists
						$('#' + this.elemid + '_ftr_metric').val(filter.metric);
					} else if ((f === "flowmetric") && (this.filter.flowmetric != filter.flowmetric)) {
						this.filter.flowmetric = filter.flowmetric;
						this.filter.flowmetricid = MMTDrop.FlowMetricName2ID[filter.flowmetric];
						//Update the filter if it exists
						$('#' + this.elemid + '_ftr_flowmetric').val(filter.flowmetric);
					} else if ((f === "appclass") && (this.filter.appclass != filter.appclass)) {
						this.filter.appclass = filter.appclass;
						this.filter.appclassid = MMTDrop.CategoriesNamesMap[filter.appclass];
						//Update the filter if it exists
						$('#' + this.elemid + '_ftr_appclass').val(filter.appclass);
					} else if(!(f === "appclassid" || f === "metricid" || f === "flowmetricid" || f === "appid") &&  this.filter[f] != filter[f]) {
						this.filter[f] = filter[f];
					}
				}
			}
		},

		getChartTypeIconByName: function(name) {
			if(name === 'pie') return $('<i>', {'class': 'glyphicons-pie'});
			if(name === 'bar') return $('<i>', {'class': 'glyphicons-bar'});
			if(name === 'timeline' || name === 'scatter' || name === 'xy' ) return $('<i>', {'class': 'glyphicons-chart'});
			if(name === 'tree') return $('<i>', {'class': 'glyphicons-table'});
			if(name === 'table') return $('<i>', {'class': 'glyphicons-table'});
		},

		/**
		 * Sets this report to initialized state 
		 */
		setInit : function() {
			this.isInit = true;
		},

		/**
		 * Sets the report to non initilaized state
		 */
		resetInit : function() {
			this.isInit = false;
		},

		/**
		 * Destroys the report  
		 */
		destroy : function() {
			for (i in this.elements) {
				elem = this.elements[i];
				elem.charts[elem.active_chart].destroy();
			}
			this.isInit = this.resetInit();
			$('#' + this.elemid).empty();
		},
};


///////////////////////////////////////////////////////////////////////////////////////////
//class MMTDrop.Reports.Chart
///////////////////////////////////////////////////////////////////////////////////////////

MMTDrop.Reports.Chart = function(options) {
	var _options = options;
	var _type = options.type;
	this.appstats = options.gstats;
	var _elemid = options.elemid;
	var _colnames = options.colnames;
	var _title = options.title;
	this.getdata = options.getDataFct;
	this.getdatargs = null;
	var _multiselect = false;
	if(options.multiSelect)  {
		_multiselect = options.multiSelect;
	}
	if(options.getDataArgs) {
		this.getdatargs = options.getDataArgs;
	}
	var _ylabel = options.ylabel;
	var _seriesName = options.seriesName;
	var _report = null;
	if(options.report) {
		_report = options.report;
	}

	_click = null;
	_dblclick = null;
	_link = null;

	if (options.click) {
		_click = options.click;
	}
	if (options.dblclick) {
		_dblclick = options.dblclick;
	}
	if (options.link) {
		_link = options.link;
	}
	this.filter = {};
	var _isInit = false;

	var _chart = null;	//contains HightChart
	var _data  = null;
	
	var _this = this;
	var _getData = function () {
		if( _this.appstats instanceof Array ) {
			var retval = [];
			for( var i in _this.appstats ) {
				var res = _this.getdata(_this.appstats[i], _this.filter, _this.getdatargs);
				for( var j in res ) retval.push( res[j] );
			}
			_data = retval;
			return retval;
		} else {
			_data = _this.getdata(_this.appstats, _this.filter, _this.getdatargs);
			return _data;
		}
	};
	
	isTimelineChart = function ( ) {
		return ( _type === "timeline" || _type === "scatter" );
	};


	/**
	 * Renders tree table chart
	 */
	_render_tree = function(filter) {

		var treeWrapper = $('<div>', {
			'class' : 'report-element-tree'                                         
		});         

		var treetable = $('<table>', {
			'id' : _elemid + '_treetable',
			'cellpadding' : 0,
			'cellspacing' : 0,
			'border' : 0
		});

		/*
		var caption = $('<caption>');
		var expand = $('<a>', {
			'href' : '#',
			'class' : 'btn',
			'onclick' : 'jQuery("#' + _elemid + '_treetable").treetable("expandAll"); return false;',
			'text' : 'Expand All'
		});
		var collapse = $('<a>', {
			'href' : '#',
			'class' : 'btn',
			'onclick' : 'jQuery("#' + _elemid + '_treetable").treetable("collapseAll"); return false;',
			'text' : 'Collapse All'
		});
		expand.appendTo(caption);
		collapse.appendTo(caption);
		 */

		var thead = $('<thead>');
		var tr = $('<tr>');
		for ( i = 0; i < _colnames.length; i++) {
			var th = $('<th>', {
				'text' : _colnames[i]
			});
			th.appendTo(tr);
		}

		tr.appendTo(thead);
		var tbody = $('<tbody>');
		var arrData = _getData();
		for (i in arrData) {
			if (arrData[i].length > 3) {
				var row_tr;
				if (arrData[i][0] == arrData[i][1]) {
					row_tr = $('<tr>', {
						'data-tt-id' : arrData[i][0].replace(/\./g,"-")
					});
				} else {
					row_tr = $('<tr>', {
						'data-tt-id' : arrData[i][0].replace(/\./g,"-"),
						'data-tt-parent-id' : arrData[i][1].replace(/\./g,"-")
					});
				}
				if(_link == null) {
					var row_name = $('<td>', {
						'text' : arrData[i][2]
					});
				}else {
					var row_name = $('<td>');
					var row_name_link = $('<a>', {
						'text' : arrData[i][2],
						'href' : _link(arrData[i])
					});
					row_name_link.appendTo(row_name);
				}
				row_name.appendTo(row_tr);

				for ( j = 3; j < Math.min(arrData[i].length, _colnames.length + 2); j++) {
					var cell = $('<td>', {
						'text' : arrData[i][j]
					});
					cell.appendTo(row_tr);
				}
				row_tr.appendTo(tbody);
			}
		}

		thead.appendTo(treetable);
		tbody.appendTo(treetable);
		//caption.appendTo(treetable);
		//append tretable to wrapper
		treetable.appendTo(treeWrapper);
		treeWrapper.appendTo($('#' + _elemid));

		$("#" + _elemid + "_treetable").treetable({
			expandable : true
		});
		$("#" + _elemid + "_treetable").treetable("expandAll");

		if(_multiselect) {
			$("#" + _elemid + "_treetable tbody tr").click({
				chart : this
			}, function(e) {
				// Highlight selected row
				if ( $(this).hasClass('selected') ) {
					$(this).removeClass('selected');
				}else {
					$(this).addClass('selected');
				}
				var selection = [];
				$(".selected").each(function(){selection.push(String($(this).data("ttId")).replace(/\-/g,"."));});

				if (e.data.chart.click) {
					ev = {data: {chart: e.data.chart, path: selection}};
					e.data.chart.click(ev);
				}
			});
		}else {
			$("#" + _elemid + "_treetable tbody tr").click({
				chart : this
			}, function(e) {
				// Highlight selected row
				$(".selected").not(this).removeClass("selected");
				$(this).addClass("selected");
				if (e.data.chart.click) {
					ev = {data: {chart: e.data.chart, path: String($(this).data("ttId")).replace(/\-/g,".")}};
					e.data.chart.click(ev);
				}
			});
		}

		$("#" + _elemid + "_treetable tbody tr").dblclick({
			chart : this
		}, function(e) {
			if (e.data.chart.dblclick) {
				ev = {data: {chart: e.data.chart, path: String($(this).data("ttId")).replace(/\-/g,".")}};
				e.data.chart.dblclick(ev);
			}
		});
		/*check if no path is selected, then to click in the first 'tr'
           of the tree element
		 */
		apppaths = filter.apppaths;
		//Sets the first tr as the default view
		if(typeof apppaths  === 'undefined'){                   
			$("#" + _elemid + "_treetable tbody tr:first").addClass("selected");
			selection = [];
			$("#" + _elemid + "_treetable tbody tr:first").each(function(){selection.push(String($(this).data("ttId")).replace(/\-/g,"."));});
			if(_report) _report.filter.apppaths = selection;
		}else {
			for(p in apppaths) {
				$("#" + _elemid + "_treetable tbody tr").each(function(){if(String($(this).data("ttId")).replace(/\-/g,".") == apppaths[p]) $(this).addClass("selected");});
			}
		}

	};

	/**
	 * Renders data table chart
	 */
	_render_table = function() {
		var arrData = _getData();
		var cnames = [];
		for ( i = 0; i < _colnames.length; i++) {
			if (i == 0) {
				cnames.push({
					"sTitle" : _colnames[i]
				});
			} else {
				cnames.push({
					"sTitle" : _colnames[i],
					//"fnRender" : function(obj) {
					//	var sReturn = obj.aData[obj.iDataColumn];
					//	var returnButton = "<div class='progress'><div class='bar' style='width: 60%;'></div></div>";
					//	return returnButton;
					//}
				});
			}
		}

		$('#' + _elemid).html('<table cellpadding="0" cellspacing="0" border="0" class="table table-striped table-bordered" id="' + _elemid + '_datatable"></table>');
		_oTable = $('#' + _elemid + '_datatable').dataTable({
			//"sDom" : "<'row'<'span6'l><'span6'f>r>t<'row'<'span6'i><'span6'p>>",
			//"sDom": 'T<"clear">lfrtip',
			"sDom": "<'row'<'span6'T><'span6'f>r>t<'row'<'span6'i><'span6'p>>",
			//"sPaginationType" : "bootstrap",
			"oLanguage" : {
				"sLengthMenu" : "_MENU_ records per page"
			},
			"aaData" : arrData,
			"aoColumns" : cnames,
			"oTableTools": {
				"aButtons": [
				             //"copy",
				             "print",
				             {
				            	 "sExtends":    "collection",
				            	 "sButtonText": "Save",
				            	 "aButtons":    [ "csv", "pdf" ]
				             }
				             ]
			}
		});

		$('#' + _elemid + ' tbody tr').dblclick({
			chart : this,
			eid : $('#' + _elemid + '_datatable').dataTable()
		}, function(e) {
			if (e.data.chart.dblclick) {
				e.data.chart.dblclick($('td:eq(0)', this).html());
			}
		});
		$('#' + _elemid + ' tbody tr').click({
			chart : this,
			eid : $('#' + _elemid + '_datatable').dataTable()
		}, function(e) {
			if ($(this).hasClass('row_selected')) {
				$(this).removeClass('row_selected');
			} else {
				e.data.eid.$('tr.row_selected').removeClass('row_selected');
				$(this).addClass('row_selected');
			}
			if (e.data.chart.click) {
				e.data.chart.click($('td:eq(0)', this).html());
			}
		});
	};

	/**
	 * Renders a bar chart 
	 */
	_render_bar = function() {
		var arrData = _getData();
		if(arrData.series) {
			series = arrData.series;
		}else {
			series = arrData;
		}
		if(arrData.categories) {
			_colnames = arrData.categories;
		}
		_chart = new Highcharts.Chart({
			chart : {
				renderTo : _elemid,
				borderColor: '#ccc',
				borderWidth: 1,
				defaultSeriesType : 'column',
				zoomType : 'xy',
				spacingTop:30,
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
				text : _title
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
				enabled: false
			},            
			xAxis : {
				categories : _colnames
			},
			yAxis : {
				title : {
					text : MMTDrop.getYLabel(_filter)
				}
			},
			series : series
		});
	};

	/**
	 * Renders a pie chart 
	 */
	_render_pie = function() {
		_chart = new Highcharts.Chart({
			chart : {
				renderTo : _elemid,
				borderColor: '#ccc',
				borderWidth: 1,
				type : 'pie',
				spacingTop:30,
				spacingRight:30 
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
			tooltip : {
				formatter : function() {
					return '<b>' + _point.name + '</b>: ' + _y;
				}
			},
			plotOptions : {
				pie : {
					//startAngle : 270,
					allowPointSelect : true,
					cursor : 'pointer',
					dataLabels : {
						enabled : true,
						formatter : function() {
							return '<b>' + _point.name + '</b>: ' + Highcharts.numberFormat(_percentage, 2) + ' %';
						}
					},
					showInLegend : true,
					events : {
						click : function(event) {
						}
					},
					showInLegend : true
				}
			},
			title : {
				text : _title
			},
			series : [{
				type : 'pie',
				name : _seriesName,
				data : _getData()
			}]
		});
	};

	/**
	 * Renders a timeline chart 
	 */
	_render_timeline = function(type) {
		var opt = {
			chart : {
				renderTo : options.elemid,
				borderColor: '#ccc',
				borderWidth: 1,
				type : type || 'spline',
				zoomType : 'xy',
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
				maxZoom: isTimelineChart() ? 15000 : 1, // 15seconds
						gridLineWidth: 1,
						type : isTimelineChart() ? 'datetime' : '',
			},
			yAxis : {
				title : {
					text : MMTDrop.getYLabel(_this.filter)
				},
				min : 0
			},
			title : {
				text : _title?_title:""
			},
			tooltip: {
				shared: true
			},
			plotOptions: {
				scatter: {
					marker: {
						radius: 3,
						states: {
							hover: {
								enabled: true,
								lineColor: 'rgb(100,100,100)'
							}
						}
					},
					states: {
						hover: {
							marker: {
								enabled: false
							}
						}
					},
					tooltip: {
						headerFormat: '<b>{series.name}</b><br>',
						pointFormat: '{point.y}'
					}
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
				},
			},
			series : _getData(),
		};
		_chart = new Highcharts.Chart(opt);
	};
	
	/**
	 * Renders the chart 
	 */
	this.render = function(filter) {
		//try{
		this.setFilter(filter);

		if (_isInit)
			return;
		_setInit();

		if (_type == "bar") {
			_render_bar();
		} else if (_type == "pie") {
			_render_pie();
		} else if (_type == "tree") {
			_render_tree();
		} else if (_type == "table") {
			_render_table();
		} else if (_type == "timeline") {
			_render_timeline(); //default rendering to spline
		} else if (_type == "scatter") {
			_render_timeline("scatter");
		} else if (_type == "xy") {
			_render_timeline();
		}
		//}catch (err){
		//	console.log("Error : " + err + ", line: " + err.lineNumber + ", file: " + err.fileName);
		//}
	};
	
	/**
	 *Sets the chart to initialized state 
	 */
	_setInit = function() {
		_isInit = true;
	};

	/**
	 * Sets the chart to non initialized state
	 */
	_resetInit = function() {
		_isInit = false;
	};

	
	/**
	 * Sets a filter options 
	 */
	this.setFilter = function(filter) {
		if (filter) {
			_filter = _this.filter;
			for(f in filter) {
				if ((f === "appname") && (_filter.appname != filter.appname)) {
					_filter.appname = filter.appname;
					_filter.appid = MMTDrop.ProtocolsNameID[filter.appname];
					_resetInit();
				} else if ((f === "metric") && (_filter.metric != filter.metric)) {
					_filter.metric = filter.metric;
					_filter.metricid = MMTDrop.MetricName2ID[filter.metric];
					_resetInit();
				} else if ((f === "flowmetric") && (_filter.flowmetric != filter.flowmetric)) {
					_filter.flowmetric = filter.flowmetric;
					_filter.flowmetricid = MMTDrop.FlowMetricName2ID[filter.flowmetric];
					_resetInit();
				} else if ((f === "appclass") && (_filter.appclass != filter.appclass)) {
					_filter.appclass = filter.appclass;
					_filter.appclassid = MMTDrop.CategoriesNamesMap[filter.appclass];
					_resetInit();
				} else if(!(f === "appclassid" || f === "metricid" || f === "flowmetricid" || f === "appid") &&  _filter[f] != filter[f]) {
					_filter[f] = filter[f];
					_resetInit();
				}
			}
		}
	};

	/**
	 * Destroys the chart 
	 */
	this.destroy = function() {
		_isInit = false;
		if (_type == "tree") {
		} else if (_type == "table") {
			$('#' + _elemid + '_datatable').dataTable().fnDestroy();
		} else if (_type == "bar" || _type == "pie" ||
				_type == "timeline" || _type == "scatter" || _type == "xy") {
			if (_chart){
				_chart.destroy();
				_chart = null;
			}
		}
		$('#' + _elemid).empty();
	};
};

/**
 * Class: MMTDrop.DataFactory
 * An object container for all the data creation functions.
 */
MMTDrop.DataFactory = {
		createTreeTableData : function(appstats, options, args) {
			var arrData = [[]];
			for (i in appstats.rootapps) {
				for (j in appstats.rootapps[i].stats) {
					appstats.rootapps[i].stats[j].getGlobalStats(arrData, args);
				}
			}
			arrData.splice(0, 1);
			for (i in arrData) {
				arrData[i][2] = MMTDrop.getProtocolNameFromID(arrData[i][2]);
			}
			return arrData;
		},

		createApplicationTableData : function(gstats, options, args) {
			var data = [];
			id = options.appid;
			if (id && id != '') {
				metric = gstats.appstats[id].getApplicationStatsArray(args);
				data.push(metric);
				if(gstats.appstats[id].hasChildren()) {
					for(i in gstats.appstats[id].stats) {
						for(j in gstats.appstats[id].stats[i].children) {
							if (gstats.appstats[id].stats[i].children[j].packetcount > 0) {
								childstats = gstats.appstats[id].stats[i].children[j];
								metric = childstats.getStatsArray(args);
								metric[0] = MMTDrop.getProtocolNameFromID(childstats.getAppId()) + '/' +
								MMTDrop.getProtocolNameFromID(gstats.appstats[id].getAppId());
								data.push(metric);
							}                   
						}
					}
				} 
			} else {
				for (id in gstats.appstats) {
					if (gstats.appstats[id].hasTraffic()) {
						packets = gstats.appstats[id].getApplicationStatsArray(args);
						data.push(packets);
					}
				}
			}
			data.sort(function(a, b) {return b[1] - a[1];});
			return data;
		},

		createAppsGlobalStatistics : function(appstats, options) {
			var data = [];
			for (id in appstats.appstats) {
				var rowdata = [];
				rowdata.push(appstats.appstats[id].getMetric(MMTDrop.MetricId.PACKET_COUNT));
				rowdata.push(appstats.appstats[id].getMetric(MMTDrop.MetricId.DATA_VOLUME));
				rowdata.push(appstats.appstats[id].getMetric(MMTDrop.MetricId.PAYLOAD_VOLUME));
				data.push({
					"name" : appstats.appstats[id].getAppId(),
					"data" : rowdata
				});
			}
			return data;
		},

		createAppsPacketCountForPieChart : function(appstats, options) {
			var data = [];
			var packetCount;
			var name;
			for (id in appstats.appstats) {
				name = MMTDrop.getProtocolNameFromID(appstats.appstats[id].getAppId());
				packetCount = appstats.appstats[id].getMetric(MMTDrop.MetricId.PACKET_COUNT);
				data.push({
					"name" : name,
					"y" : packetCount
				});
			}
			return data;
		},

		createAppsTimeLineChart : function(gstats, options) {
			var data = [];
			var name;
			var packets = [];
			id = options.appid;
			total = 0;
			if (id && id != '') {
				if (gstats.appstats[id].hasTraffic()) {
					if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.DATA_VOLUME]) {
						packets = gstats.appstats[id].getDataTimePoints(gstats.timepoints);
						total =  gstats.appstats[id].getMetric(MMTDrop.MetricId.DATA_VOLUME);
					}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PACKET_COUNT]) {
						packets = gstats.appstats[id].getPacketTimePoints(gstats.timepoints);
						total =  gstats.appstats[id].getMetric(MMTDrop.MetricId.PACKET_COUNT);
					}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PAYLOAD_VOLUME]) {
						packets = gstats.appstats[id].getPayloadTimePoints(gstats.timepoints);
						total =  gstats.appstats[id].getMetric(MMTDrop.MetricId.PAYLOAD_VOLUME);
					}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.ACTIVE_FLOWS]) {
						packets = gstats.appstats[id].getActiveFlowsTimePoints(gstats.timepoints);
						total =  gstats.appstats[id].getMetric(MMTDrop.MetricId.ACTIVE_FLOWS);
					}

					name = MMTDrop.getProtocolNameFromID(gstats.appstats[id].getAppId());

					data.push({
						"name" : name,
						"data" : packets,
						"total": total
					});
				}
				for(i in gstats.appstats[id].stats) {
					for(j in gstats.appstats[id].stats[i].children) {
						if (gstats.appstats[id].stats[i].children[j].packetcount > 0) {
							childstats = gstats.appstats[id].stats[i].children[j];
							child_packets = [];
							if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.DATA_VOLUME]) {
								child_packets = childstats.getDataTimePoints(gstats.timepoints);
								total =  childstats.getMetric(MMTDrop.MetricId.DATA_VOLUME);
							}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PACKET_COUNT]) {
								child_packets = childstats.getPacketTimePoints(gstats.timepoints);
								total =  childstats.getMetric(MMTDrop.MetricId.PACKET_COUNT);
							}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PAYLOAD_VOLUME]) {
								child_packets = childstats.getPayloadTimePoints(gstats.timepoints);
								total =  childstats.getMetric(MMTDrop.MetricId.PAYLOAD_VOLUME);
							}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.ACTIVE_FLOWS]) {
								child_packets = childstats.getActiveFlowsTimePoints(gstats.timepoints);
								total =  childstats.getMetric(MMTDrop.MetricId.ACTIVE_FLOWS);
							}

							child_name = MMTDrop.getProtocolNameFromID(childstats.getAppId());

							data.push({
								"name" : child_name+'/'+name,
								"type" : "areaspline",
								"data" : child_packets,
								"total": total
							});
						}                    
					}
				}
			} else {
				for (id in gstats.appstats) {
					if (gstats.appstats[id].hasTraffic()) {
						if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.DATA_VOLUME]) {
							packets = gstats.appstats[id].getDataTimePoints(gstats.timepoints);
							total =  gstats.appstats[id].getMetric(MMTDrop.MetricId.DATA_VOLUME);
						}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PACKET_COUNT]) {
							packets = gstats.appstats[id].getPacketTimePoints(gstats.timepoints);
							total =  gstats.appstats[id].getMetric(MMTDrop.MetricId.PACKET_COUNT);
						}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PAYLOAD_VOLUME]) {
							packets = gstats.appstats[id].getPayloadTimePoints(gstats.timepoints);
							total =  gstats.appstats[id].getMetric(MMTDrop.MetricId.PAYLOAD_VOLUME);
						}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.ACTIVE_FLOWS]) {
							packets = gstats.appstats[id].getActiveFlowsTimePoints(gstats.timepoints);
							total =  gstats.appstats[id].getMetric(MMTDrop.MetricId.ACTIVE_FLOWS);
						}

						name = MMTDrop.getProtocolNameFromID(gstats.appstats[id].getAppId());

						data.push({
							"name" : name,
							"data" : packets,
							"total": total
						});
					}
				}
			}
			data.sort(function(a, b){return b.total - a.total;});
			if(data.length > 10) {
				data.splice(10, data.length - 10);
			}
			return data;    
		},

		createTOverviewTimeLineChart : function(gstats, options) {
			var data = [];
			var name;
			var packets = [];
			id = options.appid;
			for (id in gstats.rootapps) {
				if (gstats.rootapps[id].hasTraffic()) {
					if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.DATA_VOLUME]) {
						packets = gstats.rootapps[id].getDataTimePoints(gstats.timepoints);
					}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PACKET_COUNT]) {
						packets = gstats.rootapps[id].getPacketTimePoints(gstats.timepoints);
					}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PAYLOAD_VOLUME]) {
						packets = gstats.rootapps[id].getPayloadTimePoints(gstats.timepoints);
					}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.ACTIVE_FLOWS]) {
						packets = gstats.rootapps[id].getActiveFlowsTimePoints(gstats.timepoints);
					}

					name = MMTDrop.getProtocolNameFromID(gstats.rootapps[id].getAppId());

					data.push({
						"name" : name,
						"data" : packets
					});
				}
			}

			return data;    
		},

		createDashTimeLineChart : function(gstats, options) {
			if (!options.metric) options.metric = MMTDrop.MetricID2Name[MMTDrop.MetricId.DATA_VOLUME];
			var data = [];
			var name;
			var packets = [];
			id = options.appid;
			for (id in gstats.rootapps) {
				if (gstats.rootapps[id].hasTraffic()) {
					if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.DATA_VOLUME]) {
						packets = gstats.rootapps[id].getDataTimePoints(gstats.timepoints);
						total =  gstats.rootapps[id].getMetric(MMTDrop.MetricId.DATA_VOLUME);
					}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PACKET_COUNT]) {
						packets = gstats.rootapps[id].getPacketTimePoints(gstats.timepoints);
						total =  gstats.rootapps[id].getMetric(MMTDrop.MetricId.PACKET_COUNT);
					}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PAYLOAD_VOLUME]) {
						packets = gstats.rootapps[id].getPayloadTimePoints(gstats.timepoints);
						total =  gstats.rootapps[id].getMetric(MMTDrop.MetricId.PAYLOAD_VOLUME);
					}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.ACTIVE_FLOWS]) {
						packets = gstats.rootapps[id].getActiveFlowsTimePoints(gstats.timepoints);
						total =  gstats.rootapps[id].getMetric(MMTDrop.MetricId.ACTIVE_FLOWS);
					}

					name = MMTDrop.getProtocolNameFromID(gstats.rootapps[id].getAppId());

					data.push({
						"name" : name,
						"data" : packets,
						"total": total
					});
				}
			}

			for (id in gstats.appstats) {
				if (gstats.appstats[id].hasTraffic() && (!gstats.appstats[id].hasChildren())) {
					if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.DATA_VOLUME]) {
						packets = gstats.appstats[id].getDataTimePoints(gstats.timepoints);
						total =  gstats.appstats[id].getMetric(MMTDrop.MetricId.DATA_VOLUME);
					}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PACKET_COUNT]) {
						packets = gstats.appstats[id].getPacketTimePoints(gstats.timepoints);
						total =  gstats.appstats[id].getMetric(MMTDrop.MetricId.PACKET_COUNT);
					}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PAYLOAD_VOLUME]) {
						packets = gstats.appstats[id].getPayloadTimePoints(gstats.timepoints);
						total =  gstats.appstats[id].getMetric(MMTDrop.MetricId.PAYLOAD_VOLUME);
					}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.ACTIVE_FLOWS]) {
						packets = gstats.appstats[id].getActiveFlowsTimePoints(gstats.timepoints);
						total =  gstats.appstats[id].getMetric(MMTDrop.MetricId.ACTIVE_FLOWS);
					}

					name = MMTDrop.getProtocolNameFromID(gstats.appstats[id].getAppId());

					data.push({
						"name" : name,
						"type" : "areaspline",
						"data" : packets,
						"total": total
					});
				}
			}

			data.sort(function(a, b){return b.total - a.total;});
			if(data.length > 6) {
				data.splice(6, data.length - 6);
			}
			return data;    
		},

		createAppTimeLineChart : function(gstats, options) {
			var data = [];
			var name;
			var packets = [];
			var total = 0;
			for(p in options.apps) {
				id = MMTDrop.getAppId(options.apps[p]);
				if(gstats.appstats[id]) {
					if (gstats.appstats[id].hasTraffic() ) {
						if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.DATA_VOLUME]) {
							packets = gstats.appstats[id].getDataTimePoints(gstats.timepoints);
							total =  gstats.appstats[id].getMetric(MMTDrop.MetricId.DATA_VOLUME);
						}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PACKET_COUNT]) {
							packets = gstats.appstats[id].getPacketTimePoints(gstats.timepoints);
							total =  gstats.appstats[id].getMetric(MMTDrop.MetricId.PACKET_COUNT);
						}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PAYLOAD_VOLUME]) {
							packets = gstats.appstats[id].getPayloadTimePoints(gstats.timepoints);
							total =  gstats.appstats[id].getMetric(MMTDrop.MetricId.PAYLOAD_VOLUME);
						}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.ACTIVE_FLOWS]) {
							packets = gstats.appstats[id].getActiveFlowsTimePoints(gstats.timepoints);
							total =  gstats.appstats[id].getMetric(MMTDrop.MetricId.ACTIVE_FLOWS);
						}

						name = MMTDrop.getProtocolNameFromID(gstats.appstats[id].getAppId());

						data.push({
							"name" : name,
							"data" : packets,
							"total": total
						});
					}
				}
			}
			return data;
		},

		createAppPathTimeLineChart : function(gstats, options) {
			var data = [];
			var name;
			var packets = [];
			var total = 0;
			for(p in options.apppaths) {
				app_id = MMTDrop.getAppId(options.apppaths[p]);
				stat_instance = gstats.appstats[app_id].getStatsByPath(options.apppaths[p]);
				if(stat_instance) {
					if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.DATA_VOLUME]) {
						packets = stat_instance.getDataTimePoints(gstats.timepoints);
						total =  stat_instance.getMetric(MMTDrop.MetricId.DATA_VOLUME);
					}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PACKET_COUNT]) {
						packets = stat_instance.getPacketTimePoints(gstats.timepoints);
						total =  stat_instance.getMetric(MMTDrop.MetricId.PACKET_COUNT);
					}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PAYLOAD_VOLUME]) {
						packets = stat_instance.getPayloadTimePoints(gstats.timepoints);
						total =  stat_instance.getMetric(MMTDrop.MetricId.PAYLOAD_VOLUME);
					}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.ACTIVE_FLOWS]) {
						packets = stat_instance.getActiveFlowsTimePoints(gstats.timepoints);
						total =  stat_instance.getMetric(MMTDrop.MetricId.ACTIVE_FLOWS);
					}

					name = MMTDrop.getPathFriendlyName(options.apppaths[p]); 

					data.push({
						"name" : name,
						"data" : packets,
						"total": total
					});
				}
			}
			return data;
		},


		createAppsPieChart : function(gstats, options) {
			var data = [];
			id = options.appid;
			if (id && id != '') {
				if(gstats.appstats[id].hasChildren()) {
					for(i in gstats.appstats[id].stats) {
						for(j in gstats.appstats[id].stats[i].children) {
							if (gstats.appstats[id].stats[i].children[j].packetcount > 0) {
								childstats = gstats.appstats[id].stats[i].children[j];
								metric = 0;
								if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.DATA_VOLUME]) {
									metric = childstats.bytecount;
								}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PACKET_COUNT]) {
									metric = childstats.packetcount;
								}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PAYLOAD_VOLUME]) {
									metric = childstats.payloadcount;
								}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.ACTIVE_FLOWS]) {
									metric = childstats.flowcount;
								}

								child_name = MMTDrop.getProtocolNameFromID(childstats.getAppId());

								data.push({
									"name" : MMTDrop.getProtocolNameFromID(childstats.getAppId()) + '/' +
									MMTDrop.getProtocolNameFromID(gstats.appstats[id].getAppId()),
									"y" : metric
								});
							}                    
						}
					}
				} else {
					metric = 0;
					if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.DATA_VOLUME]) {
						metric = gstats.appstats[id].getMetric(MMTDrop.MetricId.DATA_VOLUME);
					}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PACKET_COUNT]) {
						metric = gstats.appstats[id].getMetric(MMTDrop.MetricId.PACKET_COUNT);
					}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PAYLOAD_VOLUME]) {
						metric = gstats.appstats[id].getMetric(MMTDrop.MetricId.PAYLOAD_VOLUME);
					}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.ACTIVE_FLOWS]) {
						metric = gstats.appstats[id].getMetric(MMTDrop.MetricId.ACTIVE_FLOWS);
					}

					data.push({
						"name" : MMTDrop.getProtocolNameFromID(gstats.appstats[id].getAppId()),
						"y" : metric
					});
				}
			} else {
				for (id in gstats.appstats) {
					if (gstats.appstats[id].hasTraffic()) {
						if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.DATA_VOLUME]) {
							packets = gstats.appstats[id].getMetric(MMTDrop.MetricId.DATA_VOLUME);
						}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PACKET_COUNT]) {
							packets = gstats.appstats[id].getMetric(MMTDrop.MetricId.PACKET_COUNT);
						}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PAYLOAD_VOLUME]) {
							packets = gstats.appstats[id].getMetric(MMTDrop.MetricId.PAYLOAD_VOLUME);
						}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.ACTIVE_FLOWS]) {
							packets = gstats.appstats[id].getMetric(MMTDrop.MetricId.ACTIVE_FLOWS);
						}

						name = MMTDrop.getProtocolNameFromID(gstats.appstats[id].getAppId());

						data.push({
							"name" : name,
							"y" : packets
						});
					}
				}
			}
			data.sort(function(a, b) {return b.y - a.y;});
			MMTDrop.DataFactory.getTopItemsPie(data);
			return data;    
		},

		getTopItemsPie : function(data, options) {
			index = data.length;
			total = 0;
			for(i in data) total += data[i].y;

			for(i in data) {
				if((data[i].y / total) < 0.01) {
					index = i;
					break;
				}
			}

			if(data.length > 10) {
				if(index > 10) index = 10;
			}

			if(index != data.length) {
				other = data.splice(index, data.length - index);
				other_metric = 0;
				for(i in other) other_metric += other[i].y;
				data.push({"name": "Other", "y": other_metric});
			}

			return data;
		},

		getTopItemsBar : function(data, options) {
			index = data.length;
			if(index === 0) return data; //data is empty, return now

			total = 0;
			if(options.isParentFirst) {
				total = data[0].y;
			}else {
				for(i in data) {
					total += data[i].y;
				}
			}

			for(i in data) {
				if((data[i].y / total) < 0.01) {
					index = i;
					break;
				}
			}

			if(data.length > 10) {
				if(index > 10) index = 10;
			}

			if(index != data.length) {
				other = data.splice(index, data.length - index);
				other_metric = 0;
				for(i in other) other_metric += other[i].y;
				data.push({"cat": "Other", "y": other_metric});
			}
			return data;
		},

		createAppsBarChart : function(gstats, options) {
			var retval = [];
			var categories = [];
			var data = [];
			var unsorted = [];
			id = options.appid;
			if (id && id != '') {
				metric = 0;
				if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.DATA_VOLUME]) {
					metric = gstats.appstats[id].getMetric(MMTDrop.MetricId.DATA_VOLUME);
				}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PACKET_COUNT]) {
					metric = gstats.appstats[id].getMetric(MMTDrop.MetricId.PACKET_COUNT);
				}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PAYLOAD_VOLUME]) {
					metric = gstats.appstats[id].getMetric(MMTDrop.MetricId.PAYLOAD_VOLUME);
				}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.ACTIVE_FLOWS]) {
					metric = gstats.appstats[id].getMetric(MMTDrop.MetricId.ACTIVE_FLOWS);
				}

				unsorted.push({"cat": MMTDrop.getProtocolNameFromID(gstats.appstats[id].getAppId()), "y": metric});

				//categories.push(MMTDrop.getProtocolNameFromID(gstats.appstats[id].getAppId()));
				//data.push({"y" : metric});

				if(gstats.appstats[id].hasChildren()) {
					for(i in gstats.appstats[id].stats) {
						for(j in gstats.appstats[id].stats[i].children) {
							if (gstats.appstats[id].stats[i].children[j].packetcount > 0) {
								childstats = gstats.appstats[id].stats[i].children[j];
								metric = 0;
								if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.DATA_VOLUME]) {
									metric = childstats.bytecount;
								}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PACKET_COUNT]) {
									metric = childstats.packetcount;
								}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PAYLOAD_VOLUME]) {
									metric = childstats.payloadcount;
								}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.ACTIVE_FLOWS]) {
									metric = childstats.flowcount;
								}

								child_name = MMTDrop.getProtocolNameFromID(childstats.getAppId());
								unsorted.push({"cat": MMTDrop.getProtocolNameFromID(childstats.getAppId()) + '/' +
									MMTDrop.getProtocolNameFromID(gstats.appstats[id].getAppId()), "y": metric});

								//categories.push(MMTDrop.getProtocolNameFromID(childstats.getAppId()) + '/' +
										//        MMTDrop.getProtocolNameFromID(gstats.appstats[id].getAppId()));

								//data.push({"y" : metric});
							}                    
						}
					}
				} 
			} else {
				for (id in gstats.appstats) {
					if (gstats.appstats[id].hasTraffic()) {
						if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.DATA_VOLUME]) {
							metric = gstats.appstats[id].getMetric(MMTDrop.MetricId.DATA_VOLUME);
						}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PACKET_COUNT]) {
							metric = gstats.appstats[id].getMetric(MMTDrop.MetricId.PACKET_COUNT);
						}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.PAYLOAD_VOLUME]) {
							metric = gstats.appstats[id].getMetric(MMTDrop.MetricId.PAYLOAD_VOLUME);
						}else if(options.metric === MMTDrop.MetricID2Name[MMTDrop.MetricId.ACTIVE_FLOWS]) {
							metric = gstats.appstats[id].getMetric(MMTDrop.MetricId.ACTIVE_FLOWS);
						}

						unsorted.push({"cat": MMTDrop.getProtocolNameFromID(gstats.appstats[id].getAppId()), "y": metric});
						//categories.push(MMTDrop.getProtocolNameFromID(gstats.appstats[id].getAppId()));
						//data.push({"y" : metric});
					}
				}
			}

			unsorted.sort(function(a, b){return b.y - a.y;});

			MMTDrop.DataFactory.getTopItemsBar(unsorted, {isParentFirst: true});

			for(i in unsorted) {
				categories.push(unsorted[i].cat);
				data.push({"y": unsorted[i].y});
			}
			retval= {categories: categories, series: [{data: data}]};
			return retval;    
		},

		createAppCategoryMetricPie : function(gstats, options) {
			var data = [];
			id = options.appclassid;
			metricid = MMTDrop.MetricName2ID[options.metric];
			if (id && id != '') {
				for(i in MMTDrop.CategoriesAppIdsMap[id]) {
					if(gstats.appstats[MMTDrop.CategoriesAppIdsMap[id][i]]) {
						name = gstats.appstats[MMTDrop.CategoriesAppIdsMap[id][i]].getAppName();
						metric = gstats.appstats[MMTDrop.CategoriesAppIdsMap[id][i]].getExclusiveMetric(metricid);
						if(metric) {
							data.push({
								"name" : name,
								"y" : metric
							});
						}
					}
				}
			}else {
				for(c in MMTDrop.CategoriesAppIdsMap) {
					metric = 0;
					for(i in MMTDrop.CategoriesAppIdsMap[c]) {
						if(gstats.appstats[MMTDrop.CategoriesAppIdsMap[c][i]]) {
							metric += gstats.appstats[MMTDrop.CategoriesAppIdsMap[c][i]].getExclusiveMetric(metricid);
						}
					}
					if(metric) {
						data.push({
							"name" : MMTDrop.CategoriesIdsMap[c],
							"y" : metric
						});
					}
				}
			}
			data.sort(function(a, b){return b.y - a.y;});
			MMTDrop.DataFactory.getTopItemsPie(data);
			return data;
		},

		createAppCategoryMetricBar : function(gstats, options) {
			var retval = [];
			var categories = [];
			var data = [];
			var unsorted = [];
			id = options.appclassid;
			metricid = MMTDrop.MetricName2ID[options.metric];
			if (id && id != '') {
				for(i in MMTDrop.CategoriesAppIdsMap[id]) {
					if(gstats.appstats[MMTDrop.CategoriesAppIdsMap[id][i]]) {
						name = gstats.appstats[MMTDrop.CategoriesAppIdsMap[id][i]].getAppName();
						metric = gstats.appstats[MMTDrop.CategoriesAppIdsMap[id][i]].getExclusiveMetric(metricid);
						if(metric) {
							unsorted.push({"cat": name, "y": metric});
							//categories.push(name);
							//data.push({"y" : metric});
						}
					}
				}
			}else {
				for(c in MMTDrop.CategoriesAppIdsMap) {
					metric = 0;
					for(i in MMTDrop.CategoriesAppIdsMap[c]) {
						if(gstats.appstats[MMTDrop.CategoriesAppIdsMap[c][i]]) {
							metric += gstats.appstats[MMTDrop.CategoriesAppIdsMap[c][i]].getExclusiveMetric(metricid);
						}
					}
					if(metric) {
						unsorted.push({"cat": MMTDrop.CategoriesIdsMap[c], "y": metric});
						//categories.push(MMTDrop.CategoriesIdsMap[c]);
						//data.push({"y" : metric});
					}
				}
			}
			unsorted.sort(function(a, b){return b.y - a.y;});
			MMTDrop.DataFactory.getTopItemsBar(unsorted, {isParentFirst: false});
			for(i in unsorted) {
				categories.push(unsorted[i].cat);
				data.push({"y": unsorted[i].y});
			}
			retval= {categories: categories, series: [{data: data}]};
			return retval;    
		},
};

MMTDrop.GlobalStats = function() {
	this.meta = {};
	this.appstats = [];
	this.rootapps = [];
	this.timepoints = [];
	this.highest_timepoint = 0;
};

MMTDrop.GlobalStats.prototype = {
		getAppStats : function(id) {
			if (!this.appstats[id]) {
				this.appstats[id] = new MMTDrop.APPStats(id);
			}
			return this.appstats[id];
		},

		processEntry : function(entry) {
			if(entry[MMTDrop.StatsColumnId.FORMAT_ID] == MMTDrop.CsvFormat.STATS_FORMAT) {
				timepoint = entry[MMTDrop.StatsColumnId.TIMESTAMP];
				if(timepoint > this.highest_timepoint) {
					this.highest_timepoint = timepoint;
					this.timepoints.push(timepoint);
				}

				var appid = entry[MMTDrop.StatsColumnId.APP_ID];
				if (!this.appstats[appid]) {
					this.appstats[appid] = new MMTDrop.APPStats(appid);
				}
				this.appstats[appid].addUpdateStats(this, entry);
			}
		},

		getAppsStatistics : function(elem) {
			var data = [];
			for (id in this.appstats) {
				data.push ([this.appstats[id].getAppId(),
				            this.appstats[id].getMetric(elem)]);
			}
			return data;
		},
		
		getAppsPacketCountStatistics : function() {
			return getAppsStatistics(MMTDrop.MetricId.PACKET_COUNT);
		},
		
		getAppsDataVolumeStatistics : function() {
			return getAppsStatistics(MMTDrop.MetricId.DATA_VOLUME);
		},

		getAppsPayloadVolumeStatistics : function() {
			return getAppsStatistics(MMTDrop.MetricId.PAYLOAD_VOLUME);
		},

		getActiveAppNames : function() {
			var data = [];
			for (id in this.appstats) {
				data.push(this.appstats[id].getAppName());
			}
			data.sort();
			return data;
		},

		getActiveAppCategoriesNames : function() {
			var data = [];
			for(c in MMTDrop.CategoriesAppIdsMap) {
				for (id in MMTDrop.CategoriesAppIdsMap[c]) {
					if(this.appstats[MMTDrop.CategoriesAppIdsMap[c][id]]) {
						if(this.appstats[MMTDrop.CategoriesAppIdsMap[c][id]].getExclusiveMetric(MMTDrop.MetricId.ACTIVE_FLOWS)) {
							data.push(MMTDrop.CategoriesIdsMap[c]);
							break;
						}
					}
				}
			}
			return data;
		},

		getActiveAppIds : function() {
			var data = [];
			for (id in this.appstats) {
				data.push(this.appstats[id].getAppId());
			}
			return data;
		},

};

MMTDrop.APPStats = function(id) {
	this.id = id;
	this.stats = {};
};

MMTDrop.APPStats.prototype = {
		addUpdateStats : function(appstats, entry) {
			var path = MMTDrop.getEntryPath(entry);
			if (!this.stats[path]) {
				this.stats[path] = new MMTDrop.Stats(this.id, path);
				parentapp_id = MMTDrop.getParentApp(path);
				if (parentapp_id != -1) {
					parentapp = appstats.getAppStats(MMTDrop.getParentApp(path));
					parentapp.updateOnChildEntry(appstats, this.stats[path], path);
				} else {
					if (!appstats.rootapps[path]) {
						appstats.rootapps[path] = this;
					}
				}
			}
			this.stats[path].update(entry);
		},

		updateOnChildEntry : function(appstats, child_stats, child_path) {
			var path = MMTDrop.getParentPath(child_path);
			if (!this.stats[path]) {
				this.stats[path] = new MMTDrop.Stats(this.id, path);
				this.stats[path].addChild(child_path, child_stats);
				child_stats.setParent(this.stats[path]);
				parent_path = MMTDrop.getParentPath(path);
				if (parent_path == ".") {
					if (!appstats.rootapps[path]) {
						appstats.rootapps[path] = this;
					}
					return;
				} else {
					parentapp = appstats.getAppStats(MMTDrop.getParentApp(path));
					parentapp.updateOnChildEntry(appstats, this.stats[path], path);
					return;
				}
			} else {
				this.stats[path].addChild(child_path, child_stats);
				child_stats.setParent(this.stats[path]);
			}
		},

		getAppId : function() {
			return this.id;
		},

		getAppName : function() {
			return MMTDrop.ProtocolsIDName[this.id];
		},

		hasTraffic: function() {
			for (i in this.stats) {
				if(this.stats[i].packetcount) return true;
			}
			return false;
		},

		getMetric : function(metric) {
			data = 0;
			for (i in this.stats) {
				data += this.stats[i].getMetric(metric);
			}
			return data;
		},

		getChildrenMetric : function(metric) {
			data = 0;
			for (i in this.stats) {
				for(j in this.stats[i].children) {
					data += this.stats[i].children[j].getMetric(metric);
				}
			}
			return data;
		},

		getExclusiveMetric : function(metric) {
			//Exclusive metrics can't be negative.
			//The simple difference between this metric and children metric might be negative however
			//this is the case for the active flows of Ethernet,
			//Ethernet does not maitain flows, so its active flows is 0, its children (IP, IPv6) will have!!!
			var exclusive_metric = this.getMetric(metric) - this.getChildrenMetric(metric);
			if(exclusive_metric < 0) return 0;
			return exclusive_metric;
		},

		getApplicationStatsArray : function(args) {
			var data = [];
			data.push(this.getAppName());
			if(args) {
				for(m in args) {
					data.push(this.getMetric(args[m]));
				}
			}else {
				data.push(this.flowcount);

				data.push(this.ul_packetcount);
				data.push(this.dl_packetcount);
				data.push(this.packetcount);

				data.push(this.ul_bytecount);
				data.push(this.dl_bytecount);
				data.push(this.bytecount);

				data.push(this.ul_payloadcount);
				data.push(this.dl_payloadcount);
				data.push(this.payloadcount);
			}
			return data;
		},

		getTimePoints : function(timepoints, attr) {
			var data = {};
			for (i in this.stats) {
				var aflows = 0;
				for(t in timepoints){
					if(this.stats[i].timepoints[timepoints[t]]) 
						aflows = this.stats[i].timepoints[timepoints[t]][attr];

					if(data[timepoints[t]]) {
						data[timepoints[t]][1] += aflows;
					}else {
						data[timepoints[t]] = [timepoints[t], aflows];
					}
				}
			}

			var temp = MMTDrop.tools.object2Array(data);
			temp.sort(function(a, b){return a[0] - b[0]});
			return temp;
		},

		getDataTimePoints : function(timepoints) {
			return this.getTimePoints(timepoints, 'bytecount');
		},

		getPacketTimePoints : function(timepoints) {
			return this.getTimePoints(timepoints, 'packetcount');
		},

		getPayloadTimePoints : function(timepoints) {
			return this.getTimePoints(timepoints, 'payloadcount');
		},

		getActiveFlowsTimePoints : function(timepoints) {
			return this.getTimePoints(timepoints, 'active_flowcount');
		},

		hasChildren: function() {
			retval = false;
			for(i in this.stats) {
				for(j in this.stats[i].children) {
					return true;
				}
			}
			return retval;
		},

		getStatsByPath : function(path) {
			for(s in this.stats) {
				if(this.stats[s].path === path) return this.stats[s];
			}
			return null;
		},
};

MMTDrop.Stats = function(app_id, path) {
	this.appid = app_id;
	this.path = path;
	this.flowcount = 0; /**< flows count */
	this.packetcount = 0; /**> packet count */
	this.bytecount = 0; /**> data volume */
	this.payloadcount = 0; /**< payload data volume */

	this.ul_packetcount = 0; /**> uplink packet count */
	this.ul_bytecount = 0; /**> uplink data volume */
	this.ul_payloadcount = 0; /**< uplink payload data volume */

	this.dl_packetcount = 0; /**> downlink packet count */
	this.dl_bytecount = 0; /**> downlink data volume */
	this.dl_payloadcount = 0; /**< downlink payload data volume */

	this.parent = null;
	this.children = {};
	this.timepoints = {};
};

MMTDrop.Stats.prototype = {
		addChild : function(path, child_stats) {
			if (!this.children[path]) {
				this.children[path] = child_stats;
			}
		},

		setParent : function(parent) {
			this.parent = parent;
		},

		getAppId : function() {
			return this.appid;
		},

		getAppName : function() {
			return MMTDrop.ProtocolsIDName[this.appid];
		},

		update : function(entry) {
			this.flowcount = entry[MMTDrop.StatsColumnId.TOTAL_FLOWS];
			this.packetcount += entry[MMTDrop.StatsColumnId.PACKET_COUNT];
			this.bytecount += entry[MMTDrop.StatsColumnId.DATA_VOLUME];
			this.payloadcount += entry[MMTDrop.StatsColumnId.PAYLOAD_VOLUME];

			if(entry[MMTDrop.StatsColumnId.UL_PACKET_COUNT]) {
				this.ul_packetcount += entry[MMTDrop.StatsColumnId.UL_PACKET_COUNT];
			} 

			if(entry[MMTDrop.StatsColumnId.UL_DATA_VOLUME]) {
				this.ul_bytecount += entry[MMTDrop.StatsColumnId.UL_DATA_VOLUME];
			} 

			if(entry[MMTDrop.StatsColumnId.UL_PAYLOAD_VOLUME]) {
				this.ul_payloadcount += entry[MMTDrop.StatsColumnId.UL_PAYLOAD_VOLUME];
			} 

			if(entry[MMTDrop.StatsColumnId.DL_PACKET_COUNT]) {
				this.dl_packetcount += entry[MMTDrop.StatsColumnId.DL_PACKET_COUNT];
			} 

			if(entry[MMTDrop.StatsColumnId.DL_DATA_VOLUME]) {
				this.dl_bytecount += entry[MMTDrop.StatsColumnId.DL_DATA_VOLUME];
			} 

			if(entry[MMTDrop.StatsColumnId.DL_PAYLOAD_VOLUME]) {
				this.dl_payloadcount += entry[MMTDrop.StatsColumnId.DL_PAYLOAD_VOLUME];
			} 

			if (this.timepoints[entry[MMTDrop.StatsColumnId.TIMESTAMP]]) {
			} else {
				this.timepoints[entry[MMTDrop.StatsColumnId.TIMESTAMP]] = new MMTDrop.StatsTimePoint(entry);
			}
		},

		/**
		 * Returns an array with the following structure:
		 * [path, parent_path, appname, ul packets, dl packets, total packets, 
		 * ul volume, dl volume, total volume, ul pauload, dl payload, total payload]
		 */
		getGlobalStats : function(arrData, args) {
			arrData.push([]);
			arrData[arrData.length - 1].push(this.path);
			if (this.parent) {
				arrData[arrData.length - 1].push(this.parent.path);
			} else {
				arrData[arrData.length - 1].push(this.path);
			}
			arrData[arrData.length - 1].push(this.appid);
			if(args) {
				for(m in args) {
					arrData[arrData.length - 1].push(this.getMetric(args[m]));
				}
			}else {
				arrData[arrData.length - 1].push(this.flowcount);

				arrData[arrData.length - 1].push(this.ul_packetcount);
				arrData[arrData.length - 1].push(this.dl_packetcount);
				arrData[arrData.length - 1].push(this.packetcount);

				arrData[arrData.length - 1].push(this.ul_bytecount);
				arrData[arrData.length - 1].push(this.dl_bytecount);
				arrData[arrData.length - 1].push(this.bytecount);

				arrData[arrData.length - 1].push(this.ul_payloadcount);
				arrData[arrData.length - 1].push(this.dl_payloadcount);
				arrData[arrData.length - 1].push(this.payloadcount);
			}
			for (i in this.children) {
				if (i)
					this.children[i].getGlobalStats(arrData, args);
			}
		},

		getStatsArray : function(args) {
			data = [];
			data.push(this.getAppName());
			if(args) {
				for(m in args) {
					data.push(this.getMetric(args[m]));
				}
			}else {
				data.push(this.flowcount);

				data.push(this.ul_packetcount);
				data.push(this.dl_packetcount);
				data.push(this.packetcount);

				data.push(this.ul_bytecount);
				data.push(this.dl_bytecount);
				data.push(this.bytecount);

				data.push(this.ul_payloadcount);
				data.push(this.dl_payloadcount);
				data.push(this.payloadcount);
			}
			return data;
		},


		getTimePoints : function(timepoints, attr) {
			attr = attr || "bytecount";

			console.log(timepoints);
			console.log(this.timepoints);

			var data = {};
			for(t in timepoints){
				data[timepoints[t]] = [timepoints[t], 0];
			}

			for (j in this.timepoints) {
				//since using two different sets as keys
				// ==> maybe data does not contains a key [this.timepoints[j].time] 
				//why using two different times (timepoints vs. this.timepoints) ???
				if (data[this.timepoints[j].time])
					data[this.timepoints[j].time][1] += this.timepoints[j][attr];
			}

			return MMTDrop.tools.object2Array(data);
		},

		getPacketTimePoints : function(timepoints) {
			return this.getTimePoints(timepoints, 'packetcount');
		},

		getDataTimePoints : function(timepoints) {
			return this.getTimePoints(timepoints, 'bytecount');
		},

		getPayloadTimePoints : function(timepoints) {
			return this.getTimePoints(timepoints, 'payloadcount');
		},

		getActiveFlowsTimePoints : function(timepoints) {
			return this.getTimePoints(timepoints, 'active_flowcount');
		},

		getMetric: function(metric) {
			if(metric === MMTDrop.MetricId.DATA_VOLUME)
				return this.bytecount;
			if(metric === MMTDrop.MetricId.PACKET_COUNT)
				return this.packetcount;
			if(metric === MMTDrop.MetricId.PAYLOAD_VOLUME)
				return this.payloadcount;
			if(metric === MMTDrop.MetricId.ACTIVE_FLOWS)
				return this.flowcount; //this is a global metric, the sum of active flows of a protocol is the total number of flows
			return 0;
		},
};

MMTDrop.StatsTimePoint = function(entry) {
	this.format = entry[MMTDrop.StatsColumnId.FORMAT_ID];
	this.probe = entry[MMTDrop.StatsColumnId.PROBE_ID];
	this.source = entry[MMTDrop.StatsColumnId.SOURCE_ID];

	this.time = entry[MMTDrop.StatsColumnId.TIMESTAMP];

	this.flowcount = entry[MMTDrop.StatsColumnId.TOTAL_FLOWS];

	if(entry[MMTDrop.StatsColumnId.ACTIVE_FLOWS] > 0) this.active_flowcount = entry[MMTDrop.StatsColumnId.ACTIVE_FLOWS];
	else this.active_flowcount = 0;

	this.packetcount = entry[MMTDrop.StatsColumnId.PACKET_COUNT];
	this.bytecount = entry[MMTDrop.StatsColumnId.DATA_VOLUME];
	this.payloadcount = entry[MMTDrop.StatsColumnId.PAYLOAD_VOLUME];

	if(entry[MMTDrop.StatsColumnId.UL_PACKET_COUNT]) {
		this.ul_packetcount = entry[MMTDrop.StatsColumnId.UL_PACKET_COUNT];
	} else {
		this.ul_packetcount = 0;
	}

	if(entry[MMTDrop.StatsColumnId.UL_DATA_VOLUME]) {
		this.ul_bytecount = entry[MMTDrop.StatsColumnId.UL_DATA_VOLUME];
	} else {
		this.ul_bytecount = 0;
	}

	if(entry[MMTDrop.StatsColumnId.UL_PAYLOAD_VOLUME]) {
		this.ul_payloadcount = entry[MMTDrop.StatsColumnId.UL_PAYLOAD_VOLUME];
	} else {
		this.ul_payloadcount = 0;
	}

	if(entry[MMTDrop.StatsColumnId.DL_PACKET_COUNT]) {
		this.dl_packetcount = entry[MMTDrop.StatsColumnId.DL_PACKET_COUNT];
	} else {
		this.dl_packetcount = 0;
	}

	if(entry[MMTDrop.StatsColumnId.DL_DATA_VOLUME]) {
		this.dl_bytecount = entry[MMTDrop.StatsColumnId.DL_DATA_VOLUME];
	} else {
		this.dl_bytecount = 0;
	}

	if(entry[MMTDrop.StatsColumnId.DL_PAYLOAD_VOLUME]) {
		this.dl_payloadcount = entry[MMTDrop.StatsColumnId.DL_PAYLOAD_VOLUME];
	} else {
		this.dl_payloadcount = 0;
	}
};

MMTDrop.StatsTimePoint.prototype = {
		update : function(entry) {
			if (this.time === entry[MMTDrop.StatsColumnId.TIMESTAMP]) {
				return;
				//Cannot update stats of different periods. Time should be the same for the update
			}
			this.flowcount += entry[MMTDrop.StatsColumnId.TOTAL_FLOWS];

			if(entry[MMTDrop.StatsColumnId.ACTIVE_FLOWS] > 0) this.active_flowcount += entry[MMTDrop.StatsColumnId.ACTIVE_FLOWS];

			this.packetcount += entry[MMTDrop.StatsColumnId.PACKET_COUNT];
			this.bytecount += entry[MMTDrop.StatsColumnId.DATA_VOLUME];
			this.payloadcount += entry[MMTDrop.StatsColumnId.PAYLOAD_VOLUME];

			if(entry[MMTDrop.StatsColumnId.UL_PACKET_COUNT]) {
				this.ul_packetcount += entry[MMTDrop.StatsColumnId.UL_PACKET_COUNT];
			} 

			if(entry[MMTDrop.StatsColumnId.UL_DATA_VOLUME]) {
				this.ul_bytecount += entry[MMTDrop.StatsColumnId.UL_DATA_VOLUME];
			} 

			if(entry[MMTDrop.StatsColumnId.UL_PAYLOAD_VOLUME]) {
				this.ul_payloadcount += entry[MMTDrop.StatsColumnId.UL_PAYLOAD_VOLUME];
			} 

			if(entry[MMTDrop.StatsColumnId.DL_PACKET_COUNT]) {
				this.dl_packetcount += entry[MMTDrop.StatsColumnId.DL_PACKET_COUNT];
			} 

			if(entry[MMTDrop.StatsColumnId.DL_DATA_VOLUME]) {
				this.dl_bytecount += entry[MMTDrop.StatsColumnId.DL_DATA_VOLUME];
			} 

			if(entry[MMTDrop.StatsColumnId.DL_PAYLOAD_VOLUME]) {
				this.dl_payloadcount += entry[MMTDrop.StatsColumnId.DL_PAYLOAD_VOLUME];
			} 
		},

		getMetric: function(metric) {
			if(metric === MMTDrop.MetricId.DATA_VOLUME)
				return this.bytecount;
			if(metric === MMTDrop.MetricId.PACKET_COUNT)
				return this.packetcount;
			if(metric === MMTDrop.MetricId.PAYLOAD_VOLUME)
				return this.payloadcount;
			if(metric === MMTDrop.MetricId.ACTIVE_FLOWS)
				return this.active_flowcount;
			return 0;
		},
};

/////////////////////////////////////////////////////////////////
/////////////////////// Flow Stats //////////////////////////////
/////////////////////////////////////////////////////////////////

MMTDrop.FlowStats = function(items) {
	this.flowcount = 0; /**< flows count */

	this.ul_packets = 0; /**> uplink packet count */
	this.ul_data = 0; /**> uplink data volume */
	this.dl_packets = 0; /**> downlink packet count */
	this.dl_data = 0; /**> downlink data volume */

	this.flowitems = [];

	this.createItem = function( item ) {
		switch ( item[MMTDrop.StatsColumnId.FORMAT_ID] ) {
		case MMTDrop.CsvFormat.DEFAULT_APP_FORMAT :
			return new MMTDrop.FlowStatsItem( item );
		case MMTDrop.CsvFormat.WEB_APP_FORMAT :
			return new MMTDrop.HttpFlowStatsItem( item );
		case MMTDrop.CsvFormat.SSL_APP_FORMAT :
			return new MMTDrop.TlsFlowStatsItem( item );
		case MMTDrop.CsvFormat.RTP_APP_FORMAT :
			return new MMTDrop.RtpFlowStatsItem( item );
		default :
			return null;
		}
	};

	if( items ) {
		for( var i = 0; i < items.length; i ++ ) {
			if( MMTDrop.isFlowStats( items[i][MMTDrop.StatsColumnId.FORMAT_ID] ) ) {
				var item = this.createItem( items[ i ] );
				this.flowitems[item.fid] = item;
				this.flowcount += 1;
				this.ul_packets += item.ul_packets;
				this.dl_packets += item.dl_packets;
				this.ul_data += item.ul_data;
				this.dl_data += item.dl_data;
			}
		}
	}

	//this.sort(); // sort with respect to flow end time
};

MMTDrop.FlowStats.prototype = {

		getMetric: function(metric) {
			if(metric === MMTDrop.FlowMetricId.DATA_VOLUME)
				return this.ul_data + this.dl_data;
			if(metric === MMTDrop.FlowMetricId.PACKET_COUNT)
				return this.ul_packets + this.dl_packets;
			if(metric === MMTDrop.FlowMetricId.PAYLOAD_VOLUME)
				return this.ul_data + this.dl_data;
			if(metric === MMTDrop.FlowMetricId.ACTIVE_FLOWS)
				//TODO: this metric may be misleading as there are no active flows in flows statistics 
				//All flows reported here are already expired (this is the case as of 12/01/2015)
				return this.flowcount; 
			if(metric === MMTDrop.FlowMetricId.UL_DATA_VOLUME)
				return this.ul_data;
			if(metric === MMTDrop.FlowMetricId.UL_PACKET_COUNT)
				return this.ul_packets;
			if(metric === MMTDrop.FlowMetricId.DL_DATA_VOLUME)
				return this.dl_data;
			if(metric === MMTDrop.FlowMetricId.DL_PACKET_COUNT)
				return this.dl_packets;
			return 0;
		},

		sort: function ( metric, asc ) {
			asc = asc || false;
			if( metric ) {
				// sort with respect to the given metric! make sure the metric is a valid one :)
				if( asc ) {
					this.flowitems.sort( function(a, b) { return a.getMetric( metric ) - b.getMetric( metric ); } );
				} else {
					this.flowitems.sort( function(a, b) { return b.getMetric( metric ) - a.getMetric( metric ); } );
				}
			} else {
				// sort with respect to flow end time
				this.flowitems.sort( function(a, b) { return b.time - a.time; } );
			}
		},

		getTimePoints: function ( metric, sorted ) {
			//var retval = {name: MMTDrop.FlowMetricID2Name[metric], type: 'scatter', data: []};
			var retval = {name: MMTDrop.FlowMetricID2Name[metric], data: []};
			sorted = (sorted === true) ? true : false; //do not sort by default

			if( sorted ) this.sort( metric );

			for ( i in this.flowitems ) {
				retval.data.push([this.flowitems[i].time, this.flowitems[i].getMetric(metric)]);
			}
			return retval;
		},

		getDistribution: function ( metric ) {
			//var retval = {name: MMTDrop.FlowMetricID2Name[metric], type: 'scatter', data: []};
			var retval = {name: MMTDrop.FlowMetricID2Name[metric], data: []};

			this.sort( metric, true );

			var count = 0;
			for ( i in this.flowitems ) {
				count ++;
				//retval.data.push([count/this.flowcount, this.flowitems[i].getMetric(metric)]);
				retval.data.push([this.flowitems[i].getMetric(metric), 100 * count/this.flowcount]);
			}
			return retval;
		},

};


/**
 * Flow statistics data entry
 */
MMTDrop.FlowStatsItem = function(entry) {
	this.format = entry[MMTDrop.FlowStatsColumnId.FORMAT_ID];
	this.probe = entry[MMTDrop.FlowStatsColumnId.PROBE_ID];
	this.source = entry[MMTDrop.FlowStatsColumnId.SOURCE_ID];
	this.time = Math.floor(entry[MMTDrop.FlowStatsColumnId.TIMESTAMP]);
	this.fid = entry[MMTDrop.FlowStatsColumnId.FLOW_ID];
	this.start_time = Math.floor(entry[MMTDrop.FlowStatsColumnId.START_TIME]);
	this.ip_version = entry[MMTDrop.FlowStatsColumnId.IP_VERSION];
	this.server_addr = entry[MMTDrop.FlowStatsColumnId.SERVER_ADDR];
	this.client_addr = entry[MMTDrop.FlowStatsColumnId.CLIENT_ADDR];
	this.server_port = entry[MMTDrop.FlowStatsColumnId.SERVER_PORT];
	this.client_port = entry[MMTDrop.FlowStatsColumnId.CLIENT_PORT];
	this.transport_proto = entry[MMTDrop.FlowStatsColumnId.TRANSPORT_PROTO];
	this.ul_data = entry[MMTDrop.FlowStatsColumnId.UL_DATA_VOLUME];
	this.dl_data = entry[MMTDrop.FlowStatsColumnId.DL_DATA_VOLUME];
	this.ul_packets = entry[MMTDrop.FlowStatsColumnId.UL_PACKET_COUNT];
	this.dl_packets = entry[MMTDrop.FlowStatsColumnId.DL_PACKET_COUNT];
	this.tcp_rtt = entry[MMTDrop.FlowStatsColumnId.TCP_RTT];
	this.retransmission = entry[MMTDrop.FlowStatsColumnId.RETRANSMISSION_COUNT];
	this.family = entry[MMTDrop.FlowStatsColumnId.APP_FAMILY];
	this.content_class = entry[MMTDrop.FlowStatsColumnId.CONTENT_CLASS];
	this.path = entry[MMTDrop.FlowStatsColumnId.PROTO_PATH];
	this.app = entry[MMTDrop.FlowStatsColumnId.APP_NAME];
	this.duration = this.start_time - this.time;
};

MMTDrop.FlowStatsItem.prototype = {
		/** updates a flow statistics. If append is set: increment the existing stats, otherwise replace them */
		update : function(entry, append) {
			if( append ) {
				this.time = entry[MMTDrop.FlowStatsColumnId.TIMESTAMP];
				this.ul_data += entry[MMTDrop.FlowStatsColumnId.UL_DATA_VOLUME];
				this.dl_data += entry[MMTDrop.FlowStatsColumnId.DL_DATA_VOLUME];
				this.ul_packets += entry[MMTDrop.FlowStatsColumnId.UL_PACKET_COUNT];
				this.dl_packets += entry[MMTDrop.FlowStatsColumnId.DL_PACKET_COUNT];
				this.retransmission += entry[MMTDrop.FlowStatsColumnId.RETRANSMISSION_COUNT];
				this.duration = this.start_time - this.time;
			}else {
				this.time = entry[MMTDrop.FlowStatsColumnId.TIMESTAMP];
				this.ul_data = entry[MMTDrop.FlowStatsColumnId.UL_DATA_VOLUME];
				this.dl_data = entry[MMTDrop.FlowStatsColumnId.DL_DATA_VOLUME];
				this.ul_packets = entry[MMTDrop.FlowStatsColumnId.UL_PACKET_COUNT];
				this.dl_packets = entry[MMTDrop.FlowStatsColumnId.DL_PACKET_COUNT];
				this.tcp_rtt = entry[MMTDrop.FlowStatsColumnId.TCP_RTT];
				this.retransmission = entry[MMTDrop.FlowStatsColumnId.RETRANSMISSION_COUNT];
				this.duration = this.start_time - this.time;
			}
		},

		getMetric: function(metric) {
			if(metric === MMTDrop.FlowMetricId.DATA_VOLUME)
				return this.ul_data + this.dl_data;
			if(metric === MMTDrop.FlowMetricId.PACKET_COUNT)
				return this.ul_packets + this.dl_packets;
			if(metric === MMTDrop.FlowMetricId.PAYLOAD_VOLUME)
				return this.ul_data + this.dl_data;
			if(metric === MMTDrop.FlowMetricId.UL_DATA_VOLUME)
				return this.ul_data;
			if(metric === MMTDrop.FlowMetricId.UL_PACKET_COUNT)
				return this.ul_packets;
			if(metric === MMTDrop.FlowMetricId.DL_DATA_VOLUME)
				return this.dl_data;
			if(metric === MMTDrop.FlowMetricId.DL_PACKET_COUNT)
				return this.dl_packets;
			if(metric === MMTDrop.FlowMetricId.FLOW_DURATION)
				return this.duration;
			return 0;
		},

};

MMTDrop.HttpFlowStatsItem = function(entry) {
	MMTDrop.FlowStatsItem.call(this, entry);
	this.response_time = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.RESPONSE_TIME];
	this.transactions_count = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.TRANSACTIONS_COUNT];
	this.interaction_time = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.INTERACTION_TIME];
	this.hostname = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.HOSTNAME];
	this.mime = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.MIME_TYPE];
	this.referer = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.REFERER];
	this.device_os_id = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.DEVICE_OS_ID];
	this.cdn = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.CDN_FLAG];
};

MMTDrop.HttpFlowStatsItem.prototype = Object.create(MMTDrop.FlowStatsItem.prototype);
MMTDrop.HttpFlowStatsItem.constructor = MMTDrop.HttpFlowStatsItem;

MMTDrop.HttpFlowStatsItem.prototype = {
		getMetric: function(metric) {
			if(metric === MMTDrop.HTTPMetricId.RESPONSE_TIME)
				return this.response_time;
			if(metric === MMTDrop.HTTPMetricId.INTERACTION_TIME)
				return this.interaction_time;
			if(metric === MMTDrop.HTTPMetricId.INTERACTIONS_COUNT)
				return this.transactions_count;
			return MMTDrop.FlowStatsItem.prototype.getMetric.call(this, metric);
		},
};

MMTDrop.TlsFlowStatsItem = function(entry) {
	MMTDrop.FlowStatsItem.call(this, entry);
	this.server_name = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.TlsStatsColumnId.SERVER_NAME];
	this.cdn = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.TlsStatsColumnId.CDN_FLAG];
};

MMTDrop.TlsFlowStatsItem.prototype = Object.create(MMTDrop.FlowStatsItem.prototype);
MMTDrop.TlsFlowStatsItem.constructor = MMTDrop.TlsFlowStatsItem;

MMTDrop.RtpFlowStatsItem = function(entry) {
	MMTDrop.FlowStatsItem.call(this, entry);
	this.packet_loss = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.RtpStatsColumnId.PACKET_LOSS_RATE];
	this.packet_loss_burstiness = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.RtpStatsColumnId.PACKET_LOSS_BURSTINESS];
	this.jitter = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.RtpStatsColumnId.MAX_JITTER];
};

MMTDrop.RtpFlowStatsItem.prototype = {
		getMetric: function(metric) {
			if(metric === MMTDrop.RTPMetricId.PACKET_LOSS)
				return this.packet_loss;
			if(metric === MMTDrop.RTPMetricId.PACKET_LOSS_BURST)
				return this.packet_loss_burstiness;
			if(metric === MMTDrop.RTPMetricId.JITTER)
				return this.jitter;
			if(metric === MMTDrop.RTPMetricId.QUALITY_INDEX)
				return this.qindex;
			return MMTDrop.FlowStatsItem.prototype.getMetric.call(this, metric);
		},
};

MMTDrop.RtpFlowStatsItem.prototype = Object.create(MMTDrop.FlowStatsItem.prototype);
MMTDrop.RtpFlowStatsItem.constructor = MMTDrop.RtpFlowStatsItem;

/////////////////////////////////////////////////////////////////
///////////////////// Flow Stats History ////////////////////////
/////////////////////////////////////////////////////////////////

MMTDrop.FlowStatsHistory = function(items) {
	this.flowitems = [];

	this.createItem = function( item ) {
		switch ( item.format ) {
		case MMTDrop.CsvFormat.DEFAULT_APP_FORMAT :
			return new MMTDrop.FlowStatsHistoryItem( item );
		case MMTDrop.CsvFormat.WEB_APP_FORMAT :
			return new MMTDrop.HttpFlowStatsHistoryItem( item );
		case MMTDrop.CsvFormat.SSL_APP_FORMAT :
			return new MMTDrop.TlsFlowStatsHistoryItem( item );
		case MMTDrop.CsvFormat.RTP_APP_FORMAT :
			return new MMTDrop.RtpFlowStatsHistoryItem( item );
		default :
			return null;
		}
	};

	if( items ) {
		for( var i = 0; i < items.length; i ++ ) {
			if( MMTDrop.isFlowStats( items[i].format ) ) {
				var item = this.createItem( items[ i ] );
				if ( !this.flowitems[ item.time ] ) {
					this.flowitems[ item.time ] = item;
				} else {
					this.flowitems[ item.time ].update(item );
				}
			}
		}
	}
};

MMTDrop.FlowStatsHistory.prototype = {

		getMetric: function(metric) {
			return 0;
		},

		getTimePoints: function ( metric ) {
			//var retval = {name: MMTDrop.FlowMetricID2Name[metric], type: 'scatter', data: []};
			var retval = {name: MMTDrop.FlowMetricID2Name[metric], data: []};

			for ( i in this.flowitems ) {
				retval.data.push([this.flowitems[i].time, this.flowitems[i].getMetric(metric)]);
			}
			return retval;
		},

};


/**
 * Flow statistics data entry
 */
MMTDrop.FlowStatsHistoryItem = function(entry) {
	this.format = entry.format;
	this.probe = entry.probe; 
	this.source = entry.source;
	this.time = entry.time;
	this.path = entry.path;
	this.app = entry.app;
	this.count = entry.count;
};

MMTDrop.FlowStatsHistoryItem.prototype = {
		getMetric: function(metric) {
			return 0;
		},

		update: function ( item ) {
			this.count += item.count;
		}
};

MMTDrop.HttpFlowStatsHistoryItem = function(entry) {
	MMTDrop.FlowStatsHistoryItem.call(this, entry);
	this.response_time = entry.response_time;
	this.transactions_count = entry.transactions_count;
	this.interaction_time = entry.interaction_time; 
};

MMTDrop.HttpFlowStatsHistoryItem.prototype = Object.create(MMTDrop.FlowStatsHistoryItem.prototype);
MMTDrop.HttpFlowStatsHistoryItem.constructor = MMTDrop.HttpFlowStatsHistoryItem;

MMTDrop.HttpFlowStatsHistoryItem.prototype = {
		getMetric: function(metric) {
			if(metric === MMTDrop.HTTPMetricId.RESPONSE_TIME)
				return this.response_time/this.count;
			if(metric === MMTDrop.HTTPMetricId.INTERACTION_TIME)
				return this.interaction_time/this.count;
			if(metric === MMTDrop.HTTPMetricId.INTERACTIONS_COUNT)
				return this.transactions_count/this.count;
			return MMTDrop.FlowStatsHistoryItem.prototype.getMetric.call(this, metric);
		},

		update: function ( item ) {
			MMTDrop.FlowStatsHistoryItem.prototype.update.call(this, item);
			this.response_time += item.response_time;
			this.transactions_count += item.transactions_count;
			this.interaction_time += item.interaction_time; 
		}
};

MMTDrop.TlsFlowStatsHistoryItem = function(entry) {
	MMTDrop.FlowStatsHistoryItem.call(this, entry);
};

MMTDrop.TlsFlowStatsHistoryItem.prototype = Object.create(MMTDrop.FlowStatsHistoryItem.prototype);
MMTDrop.TlsFlowStatsHistoryItem.constructor = MMTDrop.TlsFlowStatsHistoryItem;

MMTDrop.RtpFlowStatsHistoryItem = function(entry) {
	MMTDrop.FlowStatsHistoryItem.call(this, entry);
	this.packet_loss = entry.packet_loss; 
	this.packet_loss_burstiness = entry.packet_loss_burstiness;
	this.jitter = entry.jitter;
};

MMTDrop.RtpFlowStatsHistoryItem.prototype = {
		getMetric: function(metric) {
			if(metric === MMTDrop.RTPMetricId.PACKET_LOSS)
				return this.packet_loss/this.count;
			if(metric === MMTDrop.RTPMetricId.PACKET_LOSS_BURST)
				return this.packet_loss_burstiness/this.count;
			if(metric === MMTDrop.RTPMetricId.JITTER)
				return this.jitter/this.count;
			if(metric === MMTDrop.RTPMetricId.QUALITY_INDEX)
				return this.qindex/this.count;
			return MMTDrop.FlowStatsHistoryItem.prototype.getMetric.call(this, metric);
		},

		update: function ( item ) {
			MMTDrop.FlowStatsHistoryItem.prototype.update.call(this, item);
			this.packet_loss += item.packet_loss; 
			this.packet_loss_burstiness += item.packet_loss_burstiness;
			this.jitter += item.jitter;
		}
};

MMTDrop.RtpFlowStatsHistoryItem.prototype = Object.create(MMTDrop.FlowStatsHistoryItem.prototype);
MMTDrop.RtpFlowStatsHistoryItem.constructor = MMTDrop.RtpFlowStatsHistoryItem;



///////////////////////////////////////////////////////////////////////////////////////////
//class MMTDrop.Parameters
//get or set parameters from/to local storage
///////////////////////////////////////////////////////////////////////////////////////////
MMTDrop.Parameters = function() {
	var support = true;
	// check if browser supports localStorage
	var storage = window.localStorage;
	try {
		storage.setItem("test", "1");
		storage.removeItem("test");
	} catch (error) {
		storage = window.fakeStorage; // TODO add code for fakeStorage
	}

	this.get = function(key) {
		return JSON.parse(storage.getItem(key));
	};

	this.set = function(key, value) {
		storage.setItem(key, JSON.stringify(value));
	};

	this.remove = function(key) {
		storage.removeItem(key);
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
//class MMTDrop.Database
//get data from database via MMT-Operator
///////////////////////////////////////////////////////////////////////////////////////////
MMTDrop.Database = function(param, dataProcessingCallback) {
	//this an abstract class
	if (this.constructor === MMTDrop.Database){
		throw new Error("Cannot instantiate abstract class MMTDrop.Database\n" +
				"Try with MMTDrop.Database.Traffic/Flow/Raw or create a new one!");
	}
	
	var _serverURL = MMTDrop.config.probeURL || "http://localhost:8088";
	if (_serverURL.substring(_serverURL.length - 1, 1) === "/")
		_serverURL += "traffic/data";
	else
		_serverURL += "/traffic/data";
	
	var _param = param;
	var _data = null;		  //it is data getting from MMT-Operator and it can    be modified during using of this object
	var _originalData = null; //it is data getting from MMT-Operator and it cannot be modified
	
	var _this = this;		  //pointer using in private methods
	
	/**
	 * data property
	 */
	Object.defineProperty(this, "data", {
		get: function(){
			if (_data == null)
				_this.reload();
			return _data;
		},
		set: function(obj){
			_data = obj;
		}
	});
	
	/**
	 * Reload data from MMT-Operator.
	 * If the @{param}
	 * @param param
	 */
	this.reload = function(param){
		if (param != null)
			_param = _param.mmt_merge(param);
		
		_originalData = _get (_param);
		if (dataProcessingCallback){
			_originalData = dataProcessingCallback(_originalData);
		}
		this.reset();
	}
	
	/**
	 * This resets any changes of data.
	 */
	this.reset = function(){
		if (_originalData)
			_data = MMTDrop.Tools.clone_originalData.mmt_cloneData();
	}
	
	
	/**
	 * Split data to n arrays arr1, arr2, ..., arrn. Each array contains data
	 * elements having the same "probe"
	 * 
	 * @param data:
	 *            is an array of messages
	 * @return an Object whose elements key-value are <br/> - key : is ID of
	 *         probe<br/> - value: is an array of messages captured by this
	 *         probe
	 */
	 function _splitDataByProbe(data) {
		 if (!data)
			 return {};
		var obj = {};
		for (var i = 0; i < data.length; i++) {
			var msg = data[i];
			var probeID = msg[1]; // msg[0] = format, msg[2] = source, msg[3]
									// = time
			if (obj[probeID] == undefined)
				// create a new array for this probeID
				obj[probeID] = [];

			obj[probeID].push(msg);
		}
		return obj;
	};

	/**
	 * Get data from MMT-Operator
	 * 
	 * @param param = {
	 *            format: {99, 0, 1, 2, 3}, //default: 99 <br/> probe : set of
	 *            number // any <br/> source: set of text // any <br/> period:
	 *            {minute, hour, day, week, month} // minute <br/> raw : {true,
	 *            false} // true <br/>
	 * @param callback
	 *            is an object containing callback functions. It has form
	 *            {error: callback1, success: callback2}: callback1 and
	 *            callback2 are called when getting data fail or success,
	 *            respectively.<br/> They take the form:
	 * @{callback1(xhr, status, error)} and
	 * @{callback2(data)}
	 * @return null if the parameter
	 * @{callback} presents. Otherwise, the function is call synchronously and
	 *             returns
	 * @{data} after getting them from database<br/>. The return data is an
	 *         object. Each key-value is a pair of probeID and its data.
	 * 
	 */
	 function _get(param, callback) {
		// asyn
		if (callback) {
			$.ajax({
				url : _serverURL,
				type : "GET",
				dataType : "json",
				data : param,
				cache : false,

				error : callback.error, // (xhr, status, error),
				success : function(data) {
					data = _splitDataByProbe(data);
					callback.sucess(data);
				}
			});
			return;
		}
		
		
		var data;
		$.ajax({
			url : _serverURL,
			type : "GET",
			dataType : "json",
			data : param,
			cache : false,
			async : false,
			error : function(xhr, status, error) {
				throw new Error("Cannot get data from database. " + error);
				return null;
			},
			success : function(d) {
				data = _splitDataByProbe(d);
				
			}
		});
		return data;
	};
}

MMTDrop.Database.Raw = function (param){
	/**
	 * Donot need any processing.
	 */
	function _processData( data ){
		return data;
	}
	
	//inherite from MMTDrop.Database
	MMTDrop.Database.call(this, param, _processData);
}

/**
 * Database for statistic of traffic (format = 99)
 */
MMTDrop.Database.Traffic = function(param){
	//overwrite format to 99
	param.format = 99;
	
	/**
	 * How data is processed for traffic stat.
	 */
	function _processData( data ){
		return data;
	}
	
	//inherite from MMTDrop.Database
	MMTDrop.Database.call(this, param, _processData);
}

/**
 * Database for statistic of flow (format = 0)
 */
MMTDrop.Database.Flow = function (param){
	//overwrite format to 0
	param.format = 0;
	
	/**
	 * How data is processed for flow stat.
	 */
	function _processData( data ){
		return data;
	}
	
	//inherite from MMTDrop.Database
	MMTDrop.Database.call(this, param, _processData);
}


/**
 * Get data from MMT-Operator in realtime.
 * @param param
 * @param callback is called each time data beeing available
 */
MMTDrop.Database.Realtime = function(param, callback){
	
}
///////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////
//Add some methods to general object 
//get data from database via MMT-Operator
//
//Do not add this prototype to Object.prototype. They may be called incidentally.
// These methodes can be fired automatically in some object (e.g., by: for var k in obj)
// e.g. $.ajax will try to fire all all methods (before submitting and after getting data to/from server)
///////////////////////////////////////////////////////////////////////////////////////////
MMTDrop.Tools = {
		/**
		 * Convert an object to an array
		 */
		object2Array : function ( obj ){
			return Object.keys(obj).map(function(key){
				return obj[key];
			});
		},

		/**
		 * Get the first element of an Object or Array
		 * @param obj
		 * @returns
		 */
		getFirstElement : function( obj ){
			for (var key in obj)
				return obj[key];
		},
		
		
		/**
		 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
		 * @param obj1
		 * @param obj2
		 * @returns obj3 a new object based on obj1 and obj2
		 */
		mergeObject : function (obj1,obj2){
		    var obj3 = {};
		    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
		    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
		    return obj3;
		},
		
		/**
		 * Clone a data object
		 * @returns a new object having the same data<br/>
		 * This cannot clone object's functions
		 */
		cloneData : function (obj){
			var seen = [];
		    //return JSON.parse( JSON.stringify (this));
		    var obj = JSON.stringify(this, function(key, val) {
		        if (typeof val == "object") {
		            if (seen.indexOf(val) >= 0)
		                return
		                seen.push(val)
		        }
		        return val
		    })

		    return JSON.parse(obj);
		}
};
