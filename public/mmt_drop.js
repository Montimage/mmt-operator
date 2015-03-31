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
}

MMTDrop.const ={
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
			 FORMAT_ID         : {id: 0, label: "Format"}, /**< Index of the format id column */
			 PROBE_ID          : {id: 1, label: "Probe"}, /**< Index of the probe id column */
			 SOURCE_ID         : {id: 2, label: "Source"}, /**< Index of the data source id column */
			 TIMESTAMP         : {id: 3, label: "Timestamp"}, /**< Index of the format id column */
			 APP_ID            : {id: 4, label: "App"}, /**< Index of the application id column */
			 APP_PATH          : {id: 5, label: "App Path"}, /**< Index of the application path column */
			 TOTAL_FLOWS       : {id: 6, label: "Flows"}, /**< Index of the is_leaf column */
			 ACTIVE_FLOWS      : {id: 7, label: "Active Flows"}, /**< Index of the active flows column */
			 DATA_VOLUME       : {id: 8, label: "Data Volume"}, /**< Index of the data volume column */
			 PAYLOAD_VOLUME    : {id: 9, label: "Payload Volume"}, /**< Index of the payload data volume column */
			 PACKET_COUNT      : {id: 10, label: "Packet Count"}, /**< Index of the packet count column */
			 UL_DATA_VOLUME    : {id: 11, label: "UL Data Volume"}, /**< Index of the data volume column */
			 UL_PAYLOAD_VOLUME : {id: 12, label: "UL Packet Count"}, /**< Index of the payload data volume column */
			 UL_PACKET_COUNT   : {id: 13, label: "UL Packet Count"}, /**< Index of the packet count column */
			 DL_DATA_VOLUME    : {id: 14, label: "DL Data Volume"}, /**< Index of the data volume column */
			 DL_PAYLOAD_VOLUME : {id: 15, label: "DL Payload Volume"}, /**< Index of the payload data volume column */
			 DL_PACKET_COUNT   : {id: 16, label: "DL Packet Count"}, /**< Index of the packet count column */
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
			 protocolName = ( id in MMTDrop.const.ProtocolsIDName) ? MMTDrop.const.ProtocolsIDName[id] : 'NaP';
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
//
//Do not add this prototype to Object.prototype. They may be called incidentally.
//These methodes can be fired automatically in some object (e.g., by: for var k in obj)
//e.g. $.ajax will try to fire all all methods (before submitting and after getting data to/from server)
///////////////////////////////////////////////////////////////////////////////////////////
MMTDrop.tools = function() {
	var _this = {};	//this = Window when this inside function(){ ... }();
	/**
	 * Convert an object to an array
	 */
	_this.object2Array = function ( obj ){
		return Object.keys(obj).map(function(key){
			return obj[key];
		});
	};

	/**
	 * Get the first element of an Object or Array
	 * @param obj
	 * @returns
	 */
	_this.getFirstElement = function( obj ){
		for (var key in obj)
			return obj[key];
	};

	/**
	  * Returns the first element that was inserted in the given array
	  */
	 _this.get1stElem = function(data) {
		 for (var prop in data)
			 if (data.propertyIsEnumerable(prop))
				 return prop;
	 };

	/**
	 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
	 * @param obj1
	 * @param obj2
	 * @returns obj3 a new object based on obj1 and obj2
	 */
	_this.mergeObjects = function (obj1,obj2){
		var obj3 = {};
		for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
		for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
		return obj3;
	};

	/**
	 * Clone a data object
	 * @returns a new object having the same data<br/>
	 * This cannot clone object's functions
	 */
	_this.cloneData = function (obj){
		var seen = [];
//		return JSON.parse( JSON.stringify (obj));
		var obj = JSON.stringify(obj, function(key, val) {
			if (typeof(val) === "object") {
				if (seen.indexOf(val) >= 0)
					return
					seen.push(val)
			}
			return val
		})

		return JSON.parse(obj);
	};

	/***
	 * Get an unique number.
	 * This counter will be reseted when the page loaded. It starts from 1.
	 */
	var _uniqueNumber = 0;
	_this.getUniqueNumber = function(){
		return (++ _uniqueNumber);
	}


	_this.capitalizeFirstLetter = function(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}


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

		_get = function (key){
			return JSON.parse(_storage.getItem(_prefix + key));
		};

		_set = function(key, value){
			_storage.setItem(_prefix + key, JSON.stringify(value));
		};

		_remove = function (key){
			_storage.removeItem(_prefix + key);
		}

		return {
			get   : _get,
			set   : _set,
			remove: _remove
		};
	}();

	
	/**
	 * Check if an object is a function
	 */
	_this.isFunction = function (callback){
		return (typeof(callback) === "function");
	}
	return _this;
}();


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
//class MMTDrop.Database
//get data from database via MMT-Operator
///////////////////////////////////////////////////////////////////////////////////////////

/**
 * A class representing data getting from MMT-Operator
 * @param param: an object, taking the form : {period: PERIOD, format: FORMAT, probe: [PROBE], source: [SOURCE], raw: BOOL}
 *  <br/> Default value: {period: minute, format: 99, probe: [], source:[], raw: false} 
 * @param dataProcessingFn: a function, taking the form : function(data) 
 */
MMTDrop.Database = function(param, dataProcessingFn) {
	//this an abstract class
	//if (this.constructor === MMTDrop.Database){
	//	throw new Error("Cannot instantiate abstract class MMTDrop.Database\n" +
	//			"Try with MMTDrop.Database.Traffic/Flow/Raw or create a new one!");
	//}
	
	var _serverURL = MMTDrop.config.probeURL || "http://localhost:8088";
	if (_serverURL.substring(_serverURL.length - 1, 1) === "/")
		_serverURL += "traffic/data";
	else
		_serverURL += "/traffic/data";
	
	var _param = param || {};
	var _data = [];		  //it is data getting from MMT-Operator and it can    be modified during using of this object
	var _originalData = []; //it is data getting from MMT-Operator and it cannot be modified
	var _isLoaded = false;
	
	var _this = this;		  //pointer using in private methods
	
	
	/**
	 * data property
	 */
	Object.defineProperty(this, "data", {
		get: function(){
			if (! _isLoaded)
				_this.reload();
			return _data;
		},
		set: function(obj){
			_data = obj;
		}
	});
	
	
	/**
	 * Get the original data getting from MMT-Operator
	 */
	this.getOriginalData = function(){
		if (! _isLoaded)
			_this.reload();
		return MMTDrop.tools.cloneData(_originalData);
	}
	
	/**
	 * Reload data from MMT-Operator.
	 * If the @{param}
	 * @param param
	 */
	this.reload = function(new_param){
		_isLoaded = true;
		
		if (new_param)
			_param = MMTDrop.tools.mergeObjects(_param, new_param);
		
		console.log(" - reload database: " + JSON.stringify(_param));
		
		_originalData = _get (_param);
		if (typeof(dataProcessingFn) == "function"){
			_originalData = dataProcessingFn(_originalData);
		}
		this.reset();
	}
	
	/**
	 * This resets any changes of data.
	 */
	this.reset = function(){
		if (_originalData){
			_data = MMTDrop.tools.cloneData(_originalData);
		}
	}
	
	this.stat = function(){
		var stat = {};
		
		/**
		 * Split data into n array, each array contains only element having the same id
		 */
		stat.splitData = function(col){
			if (col == null || col.id == null)
				throw new Error("Need to define an id");
			if (_this.data.length === 0)
				return {};
			
			var obj = {};
			for (var i=0; i<_data.length; i++){
				var msg = _data[i];
				if (msg){
					if (obj[msg[col.id]] == null)
						obj[msg[col.id]] = [];
					
					obj[msg[col.id]].push(msg); //msg[0]=format, msg[2]=source, msg[3]=time
				}
			}
			return obj;
		};
		
		
		/**
		 * 
		 */
		stat.sumByGroup = function(colSum, colGroup){
			
		}
		return stat;
	}();
	
	

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
					callback.sucess(data);
				}
			});
			return;
		}
		
		
		var data = {};
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
				data = d;
				
			}
		});
		return data;
	};
}

/**
 * 
 */
MMTDrop.databaseFactory = {
		/**
		 * Database for statistic of traffic (format = 99)
		 */
		createStatDB : function(param){
			//overwrite format to 99
			param.format = 99;
	
			var db = new MMTDrop.Database(param, function (data){
				//how data is processed for stat
				var k = MMTDrop.const.StatsColumnId.APP_ID.id;
				for (var i in data){
					var arr = data[i];
					
					arr[k] = MMTDrop.const.getProtocolNameFromID(arr[k]);
				}
				return data;
			});
			
			/**
			 * Get applications in database
			 * @return array of application ID
			 */
			db.stat.getApps = function(){
				return db.stat.splitData(MMTDrop.const.StatsColumnId.APP_ID);
			};
			
			
			return db;
		},

		/**
		 * Database for statistic of flow (format = 0)
		 */
		createFlowDB : function (param){
			//overwrite format to 0
			param.format = 0;
			
			
			return new MMTDrop.Database(param, function( data ){
				//how data is process for flow
				return data;
			});
		},
		

		/**
		 * Get data from MMT-Operator in realtime.
		 * @param param
		 * @param callback is called each time data beeing available
		 */
		createRealtimeDB : function(param, callback){
			//TODO
		}
}

///////////////////////////////////////////////////////////////////////////////////////////
//end MMTDrop.Database
///////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////
//MMTDrop.Filter
///////////////////////////////////////////////////////////////////////////////////////////
/**
 * @param = {id: unique, label: string, options : [{value: string, text: string}, {}], onchange: callback}
 * <br/> If @{param.onchange} function is defined, it will handle the changing. 
 * <br/> If the function return @{true}, the default actions 
 * <br/>   (store the change to localStorage, apply the change to its attached database) 
 * <br/>   are then executed. 
 * 
 * @filterFn = callback(value, db): this defines how database @{db} is filtered 
 * <br/>  when the option having @{value} was selected.
 * @prepareDataFn = callback(db) : this is called before this.filter
 */
MMTDrop.Filter = function (param, filterFn, prepareDataFn){

	var _currentSelectedValue = null;
	var _onFilterCallbacks = [];
	//database attached to this filter
	var _database = null;
	
	/**
	 * create and show an HTML element
	 * @param elemID : id of an HTML element parent containing the filter
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
		this.reload(param.options)
		
        //handle when the filter changing
        filter.change(function(e){
        	
        	console.log(param.label + " - selection index change");
        	
        	_currentSelectedValue = this.value; 	//value of the selected option of the filter
        		
        	//applying the filter to the current selection
        	_filter();
        });
	}
	
	//
	this.reload = function (options){
		var filter = $('#' + param.id);
		
		//remove the old options
		filter.find('option').remove();
		
		var defaultValue = null;
		//create list of options
        for (var i in options){
            var opt = $('<option>', {
                text : options[i].text,
                value: options[i].value
            });
            opt.appendTo(filter);
            
            //set default value to the first option
            if (defaultValue == null)
            	defaultValue = options[i].value;
        }
        
        
        
        //set selection to defaultValue (that is either the first option or the former selection)
    	filter.val(defaultValue);
    	_currentSelectedValue = defaultValue;
	}
	
	/**
	 * Bind the filter to a database
	 */
	this.filter = function (database){
		_database = database;
		if (MMTDrop.tools.isFunction(prepareDataFn))
			prepareDataFn(_database);
		
		
		_filter();
	}
	
	this.onFilter = function (callback, obj){
		if (MMTDrop.tools.isFunction(callback))
			_onFilterCallbacks.push ([callback, obj]);
	}
	
	function _filter(){
		if (MMTDrop.tools.isFunction(filterFn)){
			if (_database != null && _currentSelectedValue != null){
				console.log("  filtering " + param.label + "[" + _currentSelectedValue + "] on database ");
				filterFn(_currentSelectedValue, _database);
				
				//annonce to its callback registors
				for (var i in _onFilterCallbacks){
	        		var callback = _onFilterCallbacks[i];
	        		callback[0](_currentSelectedValue, _database, callback[1]);
	        	}
			}
		}
		else 
			throw new Error ("You need to implement how it filters data");
	}
}


MMTDrop.filterFactory = {
	createFlowMetricFilter : function(){
		var filter =  new MMTDrop.Filter({
			id      : "flow_metric_filter_" + MMTDrop.tools.getUniqueNumber(),
			label   : "Flows",
			options : [{value:1, text:"Data volume"},    {value:2, text:"Packet count"},
			           {value:3, text:"Payload volume"}, {value:4, text:"Active flow"},
			           {value:5, text:"UL Data volume"}, {value:6, text:"DL Data volume"},
			           {value:7, text:"UL Packet count"},{value:8, text:"DL Packet count"},
			           {value:9, text:"Flow duration"}],
		}, function (val, db){
			//how it filters database when the current selected option is @{val}
			
		});
		return filter;
	},
	
	createMetricFilter : function(){
		var filter =  new MMTDrop.Filter({
			id      : "metric_filter_" + MMTDrop.tools.getUniqueNumber(),
			label   : "Metric",
			options : [{value:1, text:"Data volume"},    {value:2, text:"Packet count"},
			          {value:3,  text:"Payload volume"}, {value:4, text:"Active flow"}],
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
		for (var k in MMTDrop.const.period){
			var key = MMTDrop.const.period[k];
			options.push({value: key, text: MMTDrop.tools.capitalizeFirstLetter(key)})
		}
		var filter =  new MMTDrop.Filter({
			id      : "period_filter_" + MMTDrop.tools.getUniqueNumber(),
			label   : "Period",
			options : options,
		}, 
		
		function (val, db){
			//how it filters database when the current selected option is @{val}	
			//It reloads data from MMT-Operator
			var param = {period:val};
			db.reload(param);
			
			console.log("Got " + db.data.length + " from DB");
		});
		return filter;
	},

	createProbeFilter : function(){
		var probeID = "probe_filter_" + MMTDrop.tools.getUniqueNumber();

		//create a list of options 
		var options = [{value:0, text: "All"}];
		var data = {};
		var filter =  new MMTDrop.Filter({
			id      : probeID,
			label   : "Probe",
			options : options,
		}, function (val, db){
			//show data from probeID = val (val=0 ==> any)
			if (data[val] != null)
				db.data = data[val];
		}, 
		//cache data
		function (db){
			//update the list of probes when database changing
			console.log("update list of probes when DB loaded");
			//update a list of probe IDs when database beeing available
			//to speedup, data are splited into groupes having the same probeID
			data = db.stat.splitData(MMTDrop.const.StatsColumnId.PROBE_ID);
			
			//get a list of probe IDs
			var probes = Object.keys(data);

			data[0] = db.data;
			
			//create list of options
			var opts = MMTDrop.tools.cloneData(options);
			for (var i in probes){
				opts.push({value: probes[i], text: probes[i]});
			}
			filter.reload(opts);

			
		});
		
		return filter;
	},
	
	createAppFilter : function(){
		var filterID = "app_filter_" + MMTDrop.tools.getUniqueNumber();
		
		//create a list of options 
		var data = {};
		var options = [{value:0, text: "All"}];
		var filter =  new MMTDrop.Filter({
			id      : filterID,
			label   : "App",
			options : options,
		}, function (val, db){
			if (data[val] != null)
				db.data = data[val];
			//how filtering data
		});
		
		//backup old filter function
		var filt = filter.filter;
		
		//redefine filter function
		filter.filter = function (db){
			//update the list of probes when database changing
			console.log("update list of probes when DB loaded");
			//update a list of probe IDs when database beeing available
			//get a list of probe IDs
			//to speedup, data are splited into groupes having the same AppID
			data = db.stat.getApps();
			var keys = Object.keys(data);
			
			data[0] = db.data;

			//create list of options
			var opts = MMTDrop.tools.cloneData(options);
			for (var i in keys){
				opts.push({value: keys[i], text: keys[i]});
			}
			filter.reload(opts);

			
			
			filt(db);
		}
		return filter;
	},
}
///////////////////////////////////////////////////////////////////////////////////////////
//end MMTDrop.Filter
///////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////
//MMTDrop.Report
///////////////////////////////////////////////////////////////////////////////////////////
MMTDrop.Report = function(title, database, filters, groupCharts, fluxOrder){
	
	/**
	 * Render the report to an HTML element
	 * @param elemID: id of the HTML element
	 */
	this.renderTo = function(elemID){
		var report_header =  $('<div>', {});
		report_header.appendTo($('#' + elemID));
		
		//draw header
		if(title) {
			var report_title = $('<h1>', {'class': 'page-header', 'style': 'margin-bottom: 10px;', 'text': title});
			report_title.appendTo(report_header);
		}

		//draw filter
		var filterID = elemID + "_filters";
		var control_row = $('<div>', {'class': 'row', 'style': 'margin-bottom: 10px;', id: filterID});
		control_row.appendTo(report_header);
		
		//render from left-right: filters[0] on the left
		for (var i = filters.length - 1; i>= 0; i--)
			filters[i].renderTo(elemID);
		
		//charts groups
		var rowDiv = $('<div>', {
			'class': 'row',
		});
		rowDiv.appendTo($('#' + elemID));
		
		for (var i=0; i<groupCharts.length; i++){
			//width of each group is maximal 12 (cols) 
			var w = groupCharts[i].width;
			if (w > 12)
				w = 12;
			
			var colDiv = $('<div>', {
				'class': 'col-md-' + w
			});
			colDiv.appendTo(rowDiv);

			var elemDiv = $('<div>', {
				'class': 'report-element'
			});
			elemDiv.appendTo(colDiv);

			
			var charts = groupCharts[i].charts;
			//draw chart icons
			if (charts.length > 1){
				var btngroup = $('<div>', {
					'class' : 'report-element-top btn-group center'
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
					
					btn.click({chart: j, group: i}, function (e){
						var charts = groupCharts[e.data.group].charts;
						//inactive the older chart in the group
						for (var k in charts){
							if (charts[k].isActive){
								charts[k].isActive = false;
								charts[k].clean();
								break;
							}
						}
						//set active and render it
						var chart = charts[e.data.chart];
						chart.isActive = true;
						chart.renderTo(chart.htmlID, database.data);
					});
				}
				btngroup.appendTo(elemDiv);
			}
			
			var chartID = "charts_group_" + i + "_";
			$('<div>', {
					'id' : chartID,
					class: 'row'
			}).appendTo(elemDiv);
			
			for (var j in charts){
				charts[j].htmlID = chartID;
				charts[j].isActive = false;
			}
			charts[0].isActive = true;
		}

		//registing some callbacks of data changing/loading
		for (var i=1; i<fluxOrder.length; i++){
			var filter = fluxOrder[i-1];
			if (Array.isArray(filter) == false){
				filter = [filter];
			}
			
			for (var j=0; j<filter.length; j++){
				filter[j].onFilter (function (val, db, obj){
					
					if (Array.isArray(obj) == false)
						obj = [obj];
					
					for (var k=0; k<obj.length; k++){
						if (obj[k] instanceof MMTDrop.Filter)
							obj[k].filter(database);
						else{
							if (obj[k].isActive)
								obj[k].renderTo(obj[k].htmlID, database.data);
						}
					}
					
				}, fluxOrder[i]);
			}
		};
		
		//filter for the first element
		var filter = fluxOrder[0];
		if (filter instanceof MMTDrop.Filter)
			filter.filter(database);
		else
			filter.renderTo(filter.htmlID, database.data);
	}
}

MMTDrop.reportFactory = {
	createCategoryReport : function(){
		
		var cBar  = MMTDrop.chartFactory.createBar({});
		var cLine = MMTDrop.chartFactory.createTimeline({});
		var cTree = MMTDrop.chartFactory.createTree({
			
		});
		var cTable= MMTDrop.chartFactory.createTable({
			data: {
				columns: [MMTDrop.const.StatsColumnId.APP_ID, 
				          MMTDrop.const.StatsColumnId.ACTIVE_FLOWS,
				          MMTDrop.const.StatsColumnId.DATA_VOLUME],
			}
		});
		
		var fPeriod = MMTDrop.filterFactory.createPeriodFilter();
		var fProbe  = MMTDrop.filterFactory.createProbeFilter();
		var fApp    = MMTDrop.filterFactory.createAppFilter();
		var fMetric = MMTDrop.filterFactory.createMetricFilter();
	    var fFlow   = MMTDrop.filterFactory.createFlowMetricFilter();
	    
	    var database = MMTDrop.databaseFactory.createStatDB({});
	    
		var report = new MMTDrop.Report(
				//title
				"Application Categories Report",
				
				//database
				database,
				
				//filers
				[fPeriod, fProbe, fApp, fMetric, fFlow],
				 
				//charts
				[
				   {charts: [cTree], width: 4},
				   {charts: [cTable, cBar, cLine], width: 8},
				 ],
				
				//order of data flux
				[fPeriod, fProbe, cTree, fApp, [cTable, cBar, cLine]]
				);
		return report;
	}
}
///////////////////////////////////////////////////////////////////////////////////////////
//end MMTDrop.Report
///////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////
//MMTDrop.Chart
///////////////////////////////////////////////////////////////////////////////////////////
/**
 * A template to create a new chart.
 * @param renderFn: function(elemID, database) is a callback using to render the chart to an HTML element
 * @param autoReload: auto reload the chart when database changing
 */
MMTDrop.Chart = function(renderFn){
	
	var _this = this;
	var _elemID = null;
	
	this.clean = function(){
		$('#' + _elemID).html('');
	}
	/**
	 * Render the chart to an HTML element
	 * @param elemID : id of the HTML element
	 */
	this.renderTo = function (elemID, data){
		if (elemID == null){
			console.log("render chart to nothing");
			return;
		}
		
		_elemID = elemID;
		
		console.log("rendering chart ...");
		if (MMTDrop.tools.isFunction(renderFn))
			renderFn(elemID, data);
		else
			throw new Error ("No render function is defined");
		
		_fireCallbacks();
	}
	
	var _onFilterCallbacks = [];
	
	function _fireCallbacks(){
		//annonce to its callback registors
		for (var i in _onFilterCallbacks){
    		var callback = _onFilterCallbacks[i];
    		callback[0](0, null, callback[1]);
    	}
	}
	
	this.onFilter = function(callback, obj){
		if (MMTDrop.tools.isFunction(callback))
			_onFilterCallbacks.push ([callback, obj]);
	}
	
	/**
	 * Icon reprenting for this chart
	 */
	this.getIcon = function(){
		throw new Error ("No icon is defined");
		
		/*
			if(name === 'pie') return $('<i>', {'class': 'glyphicons-pie'});
			if(name === 'bar') return $('<i>', {'class': 'glyphicons-bar'});
			if(name === 'timeline' || name === 'scatter' || name === 'xy' ) return $('<i>', {'class': 'glyphicons-chart'});
			if(name === 'tree') return $('<i>', {'class': 'glyphicons-table'});
			if(name === 'table') return $('<i>', {'class': 'glyphicons-table'});
			*/
	}
}


MMTDrop.chartFactory = {
	createBar : function (option){
		
		var chart = new MMTDrop.Chart( 
				function (elemID, data){
					//render to elemID
					//elem.html(JSON.stringify(data));
					if (option.data && MMTDrop.tools.isFunction(option.data.getDataFn))
						data = option.getDataFn(data);
					
					var ylabel = "";
					var categories = [];
					var series = [];
					
					chart.hightchart = new Highcharts.Chart({
						chart : {
							renderTo : elemID,
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
							enabled: false
						},            
						xAxis : {
							categories : categories
						},
						yAxis : {
							title : {
								text : ylabel
							}
						},
						series : series
					});
		});
		
		chart.getIcon = function(){
			return $('<i>', {'class': 'glyphicons-bar'});
		}
		return chart;
	},
	
	createPie : function (option){
		var chart = new MMTDrop.Chart( 
				function (elemID, data){
					//
					
					//render to elemID
					var elem = $('#' + elemID);
					elem.html(JSON.stringify(data));
		});
		
		chart.getIcon = function(){
			return $('<i>', {'class': 'glyphicons-pie'});
		}
		return chart;
	},
	
	createTimeline : function (option){
		var chart = new MMTDrop.Chart( 
				function (elemID, data){
					//
					
					//render to elemID
					var elem = $('#' + elemID);
					elem.html(JSON.stringify(data));
		});
		
		chart.getIcon = function(){
			return $('<i>', {'class': 'glyphicons-chart'});
		}
		return chart;
	},
	
	createScatter : function (option){
		var chart = new MMTDrop.Chart( 
				function (elemID, data){
					//
					
					//render to elemID
					var elem = $('#' + elemID);
					elem.html(JSON.stringify(data));
		});
		
		chart.getIcon = function(){
			return $('<i>', {'class': 'glyphicons-chart'});
		}
		return chart;
	},
	
	createXY : function (option){
		var chart = new MMTDrop.Chart( 
				function (elemID, data){
					//
					
					//render to elemID
					var elem = $('#' + elemID);
					elem.html(JSON.stringify(data));
		});
		
		chart.getIcon = function(){
			return $('<i>', {'class': 'glyphicons-chart'});
		}
		return chart;
	},
	
	createTree : function (option){
		var chart = new MMTDrop.Chart( 
				function (elemID, data){
					//
					
					//render to elemID
					var elem = $('#' + elemID);
					elem.html(JSON.stringify(data));
		});
		
		chart.getIcon = function(){
			return $('<i>', {'class': 'glyphicons-table'});
		}
		return chart;
	},
	
	createTable : function (option){
		var chart = new MMTDrop.Chart( 
				//render function
				function (elemID, data){
					//render to elemID
					var elem = $('#' + elemID);
					
					//elem.html(JSON.stringify(data));
					if (option.data &&  MMTDrop.tools.isFunction(option.data.getDataFn))
						data = option.data.getDataFn(data);
					
					var arr = [];
					for (var i=0; i<data.length; i++){
						var a = [];
						for (var j=0; j<option.data.columns.length; j++)
							a.push(data[i][option.data.columns[j].id]);
						
						arr.push(a);
					}
					
					var cnames = [];
					for (var i = 0; i < option.data.columns.length; i++) {
						cnames.push({
								"title": option.data.columns[i].label,
							});
					}
					
					var tblID = elemID + "_table_" + MMTDrop.tools.getUniqueNumber(); 
					
					elem.html('<table cellpadding="0" cellspacing="0" border="0" class="table table-striped table-bordered" id="' + tblID + '"></table>');
					$('#' + tblID).dataTable({
						"data"      : arr,
						"columns"   : cnames,
					});
					if (MMTDrop.tools.isFunction(option.dblclick)){
						$('#' + elem + ' tbody tr').dblclick({
							chart : this,
							eid : $('#' + this.elemid + '_datatable').dataTable()
						}, function(e) {
							if (e.data.chart.dblclick) {
								e.data.chart.dblclick($('td:eq(0)', this).html());
							}
						});
					}
					if (MMTDrop.tools.isFunction(option.click)){
						$('#' + elem + ' tbody tr').click({
							chart : this,
							eid : $('#' + elem + '_datatable').dataTable()
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
					}
		});
		
		chart.getIcon = function(){
			return $('<i>', {'class': 'glyphicons-table'});
		}
		return chart;
	}
}



MMTDrop.Charts = function(options) {
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


///////////////////////////////////////////////////////////////////////////////////////////
//End MMTDrop.Chart
///////////////////////////////////////////////////////////////////////////////////////////

