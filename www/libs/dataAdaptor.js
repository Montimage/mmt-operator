var ipLib = require("ip");
/** Class: MMTDrop
 *  An object container for all MMTDrop library functions.
 *
 *  This class is just a container for all the objects and constants
 *  used in the library.  It is not meant to be instantiated, but to
 *  provide a namespace for library objects, constants, and functions.
 */

var MMTDrop = {

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
        STATS_FORMAT : 100/**< Statistics format id */,
        SECURITY_FORMAT: 10,
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
        MAC_SRC             : 17, /**< Index of the MAC address source column */
        MAC_DEST            : 18, /**< Index of the MAC address source column */
    },
    
    SecurityColumnId           : {
        FORMAT_ID           : 0, /**< Index of the format id column */
        PROBE_ID            : 1, /**< Index of the probe id column */
        SOURCE_ID           : 2, /**< Index of the data source id column */
        TIMESTAMP           : 3, /**< Index of the format id column */
        PROPERTY              : 4, /**< Index of the application id column */
        VERDICT: 5,
        TYPE: 6,
        DESCRIPTION: 7,
        HISTORY: 8,
        VERDICT_COUNT: 9
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
        IS_LOCAL                : 11, /** 0 (if not a local address), 1 (local address,server),2 (local address,client),3 (local address,both server and client)*/
        TRANSPORT_PROTO         : 12, /**< Index of the transport protocol identifier column */
        UL_PACKET_COUNT         : 13, /**< Index of the uplink packet count column */
        DL_PACKET_COUNT         : 14, /**< Index of the downlink packet count column */
        UL_DATA_VOLUME          : 15, /**< Index of the uplink data volume column */
        DL_DATA_VOLUME          : 16, /**< Index of the downlink data volume column */
        TCP_RTT                 : 17, /**< Index of the TCP round trip time column */
        RETRANSMISSION_COUNT    : 18, /**< Index of the retransmissions count column */
        APP_FAMILY              : 19, /**< Index of the application family column */
        CONTENT_CLASS           : 20, /**< Index of the content class column */
        PROTO_PATH              : 21, /**< Index of the protocol path column */
        APP_NAME                : 22, /**< Index of the application name column */
        APP_FORMAT_ID           : 23, /**< Index of the start of the application specific statistics (this is not a real column, rather an index) */
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
    
    /**
    * 
    */
    setDirectionProtocolStat: function( msg, serverMAC ){
        var COL       = this.StatsColumnId;
        
        if( msg[COL.MAC_DEST] == serverMAC )
            return msg;
        else if ( msg[COL.MAC_SRC] == serverMAC ){
            //change direction
            msg[COL.MAC_SRC]  = msg[COL.MAC_DEST];
            msg[COL.MAC_DEST] = serverMAC;
            //Permute DL <--> UL
            var tmp 
            for(var i=0; i<3; i++){
                tmp                           = msg[ COL.UL_DATA_VOLUME + i ];
                msg[ COL.UL_DATA_VOLUME + i ] = msg[ COL.DL_DATA_VOLUME + i ];
                msg[ COL.DL_DATA_VOLUME + i ] = tmp;
            }
            return msg;
        }
        return null;
    },
    
    setDirectionProtocolFlow: function( msg, local_network){
        var COL       = this.FlowStatsColumnId;
        
        var rootsIP = [];
        for( var i in local_network ){
            var lo   = local_network[i];
            var root = ipLib.mask(lo.ip, lo.mask);
            
            rootsIP.push(  {root: root, mask: lo.mask } );
        }
        var isInside = function( ip ){
            for( var i in rootsIP ){
                var lo = rootsIP[i];
                if( ipLib.mask( ip, lo.mask ) == lo.root )
                    return true;
            }
            return false;  
        }        
        
        if( isInside( msg[COL.CLIENT_ADDR] )  )
            return msg;
        else if ( isInside( msg[COL.SERVER_ADDR] ) ){
            //Permute DL <--> UL
            var tmp = msg[COL.CLIENT_ADDR];

            //change direction
            msg[COL.CLIENT_ADDR] = msg[COL.SERVER_ADDR];
            msg[COL.SERVER_ADDR] = tmp;

            for(var i=0; i<2; i++){
                tmp                           = msg[ COL.UL_DATA_VOLUME + i ];
                msg[ COL.UL_DATA_VOLUME + i ] = msg[ COL.DL_DATA_VOLUME + i ];
                msg[ COL.DL_DATA_VOLUME + i ] = tmp;
            }
            return msg;
        }
        return null;
    }
};
MMTDrop.SecurityPoint = function( entry ){
    var retval = {};
    retval.format                   = entry[MMTDrop.SecurityColumnId.FORMAT_ID];
    retval.probe                    = entry[MMTDrop.SecurityColumnId.PROBE_ID];
    retval.source                   = entry[MMTDrop.SecurityColumnId.SOURCE_ID];
    retval.time                     = Math.floor(entry[MMTDrop.StatsColumnId.TIMESTAMP] * 1000);
    retval.property                 = entry[MMTDrop.SecurityColumnId.PROPERTY];
    retval.verdict                  = entry[MMTDrop.SecurityColumnId.VERDICT];
    retval.type                     = entry[MMTDrop.SecurityColumnId.TYPE];
    retval.description              = entry[MMTDrop.SecurityColumnId.DESCRIPTION];
    retval.history                  = JSON.stringify( entry[MMTDrop.SecurityColumnId.HISTORY] );
    if( entry[MMTDrop.SecurityColumnId.VERDICT_COUNT] )
        retval.verdict_count            = entry[MMTDrop.SecurityColumnId.VERDICT_COUNT];
    else
        retval.verdict_count = 1;
    return retval;
};

MMTDrop.reverseSecurityPoint = function(elem) {
    var retval = [];
    retval[MMTDrop.SecurityColumnId.FORMAT_ID]      = elem.format;
    retval[MMTDrop.SecurityColumnId.PROBE_ID]       = elem.probe;
    retval[MMTDrop.SecurityColumnId.SOURCE_ID]      = elem.source;
    retval[MMTDrop.SecurityColumnId.TIMESTAMP]      = elem.time;
    retval[MMTDrop.SecurityColumnId.PROPERTY]       = elem.property;
    retval[MMTDrop.SecurityColumnId.VERDICT]        = elem.verdict;
    retval[MMTDrop.SecurityColumnId.TYPE]           = elem.type;
    retval[MMTDrop.SecurityColumnId.DESCRIPTION]    = elem.description;
    if( elem.history )
        retval[MMTDrop.SecurityColumnId.HISTORY]        = JSON.parse( elem.history );
    retval[MMTDrop.SecurityColumnId.VERDICT_COUNT]        = elem.verdict_count;
    return retval;
}
MMTDrop.StatsTimePoint = function(entry) {
    var retval = {};
    retval.format           = entry[MMTDrop.StatsColumnId.FORMAT_ID];
    retval.probe            = entry[MMTDrop.StatsColumnId.PROBE_ID];
    retval.source           = entry[MMTDrop.StatsColumnId.SOURCE_ID];
    retval.time             = Math.floor(entry[MMTDrop.StatsColumnId.TIMESTAMP] * 1000);
    
    retval.app              = entry[MMTDrop.StatsColumnId.APP_ID];
    retval.path             = entry[MMTDrop.StatsColumnId.APP_PATH];

    retval.ul_data          = entry[MMTDrop.StatsColumnId.UL_DATA_VOLUME];
    retval.dl_data          = entry[MMTDrop.StatsColumnId.DL_DATA_VOLUME];
    retval.ul_packets       = entry[MMTDrop.StatsColumnId.UL_PACKET_COUNT];
    retval.dl_packets       = entry[MMTDrop.StatsColumnId.DL_PACKET_COUNT];
    
    retval.ul_payload       = entry[MMTDrop.StatsColumnId.UL_PAYLOAD_VOLUME];
    retval.dl_payload       = entry[MMTDrop.StatsColumnId.DL_PAYLOAD_VOLUME];
    
    retval.active_flowcount = entry[MMTDrop.StatsColumnId.ACTIVE_FLOWS];

    retval.bytecount        = entry[MMTDrop.StatsColumnId.DATA_VOLUME];
    retval.payloadcount     = entry[MMTDrop.StatsColumnId.PAYLOAD_VOLUME];
    retval.packetcount      = entry[MMTDrop.StatsColumnId.PACKET_COUNT];
    retval.start_time       = Math.floor(entry[MMTDrop.StatsColumnId.START_TIME] * 1000);
    retval.mac_src          = entry[MMTDrop.StatsColumnId.MAC_SRC];
    retval.mac_dest         = entry[MMTDrop.StatsColumnId.MAC_DEST];
    return retval;
}

MMTDrop.reverseStatsTimePoint = function(elem) {
    var retval = [];
    retval[MMTDrop.StatsColumnId.FORMAT_ID]         = elem.format;
    retval[MMTDrop.StatsColumnId.PROBE_ID]          = elem.probe;
    retval[MMTDrop.StatsColumnId.SOURCE_ID]         = elem.source;
    retval[MMTDrop.StatsColumnId.TIMESTAMP]         = elem.time;
    retval[MMTDrop.StatsColumnId.APP_ID]            = elem.app;
    retval[MMTDrop.StatsColumnId.APP_PATH]          = elem.path;
    retval[MMTDrop.StatsColumnId.ACTIVE_FLOWS]      = elem.active_flowcount;
    retval[MMTDrop.StatsColumnId.DATA_VOLUME]       = elem.bytecount;
    retval[MMTDrop.StatsColumnId.PAYLOAD_VOLUME]    = elem.payloadcount;
    retval[MMTDrop.StatsColumnId.PACKET_COUNT]      = elem.packetcount;
    retval[MMTDrop.StatsColumnId.UL_PAYLOAD_VOLUME] = elem.ul_payload;
    retval[MMTDrop.StatsColumnId.DL_PAYLOAD_VOLUME] = elem.dl_payload;
    
    retval[MMTDrop.StatsColumnId.UL_DATA_VOLUME]    = elem.ul_data;
    retval[MMTDrop.StatsColumnId.DL_DATA_VOLUME]    = elem.dl_data;
    
    retval[MMTDrop.StatsColumnId.UL_PACKET_COUNT]   = elem.ul_packets;
    retval[MMTDrop.StatsColumnId.DL_PACKET_COUNT]   = elem.dl_packets;
    
    retval[MMTDrop.StatsColumnId.START_TIME] = elem.start_time;
    retval[MMTDrop.StatsColumnId.MAC_SRC]    = elem.mac_src;
    retval[MMTDrop.StatsColumnId.MAC_DEST]   = elem.mac_dest;
    return retval;
};

/**
  * Flow statistics data entry
  */
MMTDrop.FlowStatsItem = function(entry) {
    var retval = {};
    retval.format           = entry[MMTDrop.FlowStatsColumnId.FORMAT_ID];
    retval.probe            = entry[MMTDrop.FlowStatsColumnId.PROBE_ID];
    retval.source           = entry[MMTDrop.FlowStatsColumnId.SOURCE_ID];
    retval.time             = Math.floor(entry[MMTDrop.FlowStatsColumnId.TIMESTAMP] * 1000);
    retval.fid              = entry[MMTDrop.FlowStatsColumnId.FLOW_ID];
    retval.start_time       = Math.floor(entry[MMTDrop.FlowStatsColumnId.START_TIME] * 1000);
    retval.ip_version       = entry[MMTDrop.FlowStatsColumnId.IP_VERSION];
    retval.server_addr      = entry[MMTDrop.FlowStatsColumnId.SERVER_ADDR];
    retval.client_addr      = entry[MMTDrop.FlowStatsColumnId.CLIENT_ADDR];
    retval.server_port      = entry[MMTDrop.FlowStatsColumnId.SERVER_PORT];
    retval.client_port      = entry[MMTDrop.FlowStatsColumnId.CLIENT_PORT];
    retval.is_local         = entry[MMTDrop.FlowStatsColumnId.IS_LOCAL];
    retval.transport_proto  = entry[MMTDrop.FlowStatsColumnId.TRANSPORT_PROTO];
    retval.ul_data          = entry[MMTDrop.FlowStatsColumnId.UL_DATA_VOLUME];
    retval.dl_data          = entry[MMTDrop.FlowStatsColumnId.DL_DATA_VOLUME];
    retval.ul_packets       = entry[MMTDrop.FlowStatsColumnId.UL_PACKET_COUNT];
    retval.dl_packets       = entry[MMTDrop.FlowStatsColumnId.DL_PACKET_COUNT];
    retval.tcp_rtt          = entry[MMTDrop.FlowStatsColumnId.TCP_RTT];
    retval.retransmission   = entry[MMTDrop.FlowStatsColumnId.RETRANSMISSION_COUNT];
    retval.family           = entry[MMTDrop.FlowStatsColumnId.APP_FAMILY];
    retval.content_class    = entry[MMTDrop.FlowStatsColumnId.CONTENT_CLASS];
    retval.path             = entry[MMTDrop.FlowStatsColumnId.PROTO_PATH];
    retval.app              = entry[MMTDrop.FlowStatsColumnId.APP_NAME];
    return retval;
};

MMTDrop.reverseFlowStatsItem = function(item) {
    var retval = [];
    retval[MMTDrop.FlowStatsColumnId.FORMAT_ID]             = item.format;
    retval[MMTDrop.FlowStatsColumnId.PROBE_ID]              = item.probe;
    retval[MMTDrop.FlowStatsColumnId.SOURCE_ID]             = item.source;
    retval[MMTDrop.FlowStatsColumnId.TIMESTAMP]             = item.time;
    retval[MMTDrop.FlowStatsColumnId.FLOW_ID]               = item.fid;
    retval[MMTDrop.FlowStatsColumnId.START_TIME]            = item.start_time;
    retval[MMTDrop.FlowStatsColumnId.IP_VERSION]            = item.ip_version;
    retval[MMTDrop.FlowStatsColumnId.SERVER_ADDR]           = item.server_addr;
    retval[MMTDrop.FlowStatsColumnId.CLIENT_ADDR]           = item.client_addr;
    retval[MMTDrop.FlowStatsColumnId.SERVER_PORT]           = item.server_port;
    retval[MMTDrop.FlowStatsColumnId.CLIENT_PORT]           = item.client_port;
    retval[MMTDrop.FlowStatsColumnId.IS_LOCAL]              = item.is_local;
    retval[MMTDrop.FlowStatsColumnId.TRANSPORT_PROTO]       = item.transport_proto;
    retval[MMTDrop.FlowStatsColumnId.UL_DATA_VOLUME]        = item.ul_data;
    retval[MMTDrop.FlowStatsColumnId.DL_DATA_VOLUME]        = item.dl_data;
    retval[MMTDrop.FlowStatsColumnId.UL_PACKET_COUNT]       = item.ul_packets;
    retval[MMTDrop.FlowStatsColumnId.DL_PACKET_COUNT]       = item.dl_packets;
    retval[MMTDrop.FlowStatsColumnId.TCP_RTT]               = item.tcp_rtt;
    retval[MMTDrop.FlowStatsColumnId.RETRANSMISSION_COUNT]  = item.retransmission;
    retval[MMTDrop.FlowStatsColumnId.APP_FAMILY]            = item.family;
    retval[MMTDrop.FlowStatsColumnId.CONTENT_CLASS]         = item.content_class;
    retval[MMTDrop.FlowStatsColumnId.PROTO_PATH]            = item.path;
    retval[MMTDrop.FlowStatsColumnId.APP_NAME]              = item.app;
    return retval;
};

MMTDrop.HttpFlowStatsItem = function(entry) {
    var retval = MMTDrop.FlowStatsItem(entry);

    retval.response_time        = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.RESPONSE_TIME];
    retval.transactions_count   = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.TRANSACTIONS_COUNT];
    retval.interaction_time     = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.INTERACTION_TIME];
    retval.hostname             = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.HOSTNAME];
    retval.mime                 = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.MIME_TYPE];
    retval.referer              = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.REFERER];
    retval.device_os_id         = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.DEVICE_OS_ID];
    retval.cdn                  = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.CDN_FLAG];
    return retval;
};

MMTDrop.reverseHttpFlowStatsItem = function(item) {
    var retval = MMTDrop.reverseFlowStatsItem(item);

    retval[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.RESPONSE_TIME]       = item.response_time;
    retval[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.TRANSACTIONS_COUNT]  = item.transactions_count;
    retval[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.INTERACTION_TIME]    = item.interaction_time;
    retval[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.HOSTNAME]            = item.hostname;
    retval[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.MIME_TYPE]           = item.mime;
    retval[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.REFERER]             = item.referer;
    retval[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.DEVICE_OS_ID]        = item.device_os_id;
    retval[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.HttpStatsColumnId.CDN_FLAG]            = item.cdn;
    return retval;
};

MMTDrop.TlsFlowStatsItem = function(entry) {
    var retval = MMTDrop.FlowStatsItem(entry);
    retval.server_name = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.TlsStatsColumnId.SERVER_NAME];
    retval.cdn = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.TlsStatsColumnId.CDN_FLAG];
    return retval;
};

MMTDrop.reverseTlsFlowStatsItem = function(item) {
    var retval = MMTDrop.reverseFlowStatsItem(item);
    retval[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.TlsStatsColumnId.SERVER_NAME] = item.server_name;
    retval[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.TlsStatsColumnId.CDN_FLAG] = item.cdn;
    return retval;
};

MMTDrop.RtpFlowStatsItem = function(entry) {
    var retval = MMTDrop.FlowStatsItem(entry);
    retval.packet_loss = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.RtpStatsColumnId.PACKET_LOSS_RATE];
    retval.packet_loss_burstiness = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.RtpStatsColumnId.PACKET_LOSS_BURSTINESS];
    retval.jitter = entry[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.RtpStatsColumnId.MAX_JITTER];
    return retval;
};

MMTDrop.reverseRtpFlowStatsItem = function(item) {
    var retval = MMTDrop.reverseFlowStatsItem(item);
    retval[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.RtpStatsColumnId.PACKET_LOSS_RATE] = item.packet_loss;
    retval[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.RtpStatsColumnId.PACKET_LOSS_BURSTINESS] = item.packet_loss_burstiness;
    retval[MMTDrop.FlowStatsColumnId.APP_FORMAT_ID + MMTDrop.RtpStatsColumnId.MAX_JITTER] = item.jitter;
    return retval;
};

MMTDrop.formatReportItem = function(entry) {
    switch( entry[0] ) {
        case MMTDrop.CsvFormat.DEFAULT_APP_FORMAT : 
            return MMTDrop.FlowStatsItem( entry );
        case MMTDrop.CsvFormat.WEB_APP_FORMAT : 
            return MMTDrop.HttpFlowStatsItem( entry );
        case MMTDrop.CsvFormat.SSL_APP_FORMAT : 
            return MMTDrop.TlsFlowStatsItem( entry );
        case MMTDrop.CsvFormat.RTP_APP_FORMAT : 
            return MMTDrop.RtpFlowStatsItem( entry );
        case MMTDrop.CsvFormat.STATS_FORMAT : 
            return MMTDrop.StatsTimePoint( entry );
        case MMTDrop.CsvFormat.SECURITY_FORMAT:
            return MMTDrop.SecurityPoint( entry );
        case MMTDrop.CsvFormat.MICROFLOWS_STATS_FORMAT : //TODO 
        case MMTDrop.CsvFormat.RADIUS_REPORT_FORMAT : //TODO
        default :
            return null;
    }
};

MMTDrop.reverseFormatReportItem = function(entry) {
    switch( entry.format ) {
        case MMTDrop.CsvFormat.DEFAULT_APP_FORMAT :
            return MMTDrop.reverseFlowStatsItem( entry );
        case MMTDrop.CsvFormat.WEB_APP_FORMAT :
            return MMTDrop.reverseHttpFlowStatsItem( entry );
        case MMTDrop.CsvFormat.SSL_APP_FORMAT :
            return MMTDrop.reverseTlsFlowStatsItem( entry );
        case MMTDrop.CsvFormat.RTP_APP_FORMAT :
            return MMTDrop.reverseRtpFlowStatsItem( entry );
        case MMTDrop.CsvFormat.STATS_FORMAT :
            return MMTDrop.reverseStatsTimePoint( entry );
        case MMTDrop.CsvFormat.SECURITY_FORMAT:
            return MMTDrop.reverseSecurityPoint( entry );
        case MMTDrop.CsvFormat.MICROFLOWS_STATS_FORMAT : //TODO 
        case MMTDrop.CsvFormat.RADIUS_REPORT_FORMAT : //TODO
        default :
            return null;
    }
};

module.exports = MMTDrop;
module.exports.CsvFormat = MMTDrop.CsvFormat;