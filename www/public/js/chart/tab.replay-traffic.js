var arr = [
	{
		id: "list-pcap-files",
		title: "Pcap Traffic",
		x: 0,
		y: 0,
		width: 12,
		height: 9,
		type: "info",
		userData: {
			fn: "createFormScripts"
		},
	}, {
		id: "output",
		title: "Output",
		x: 0,
		y: 9,
		width: 12,
		height: 3,
		type: "danger",
		userData: {
			fn: "createFormOutput"
		},
	}
];

var availableReports = {
}

/* get div content of each report */
const contentEl = {
	script: function() {
		return $("#list-pcap-files-content")
	},
	output: function() {
		return $("#output-content")
	}
}

function setToolbarButtons() {
	fPeriod.hide();
	fProbe.hide();
	fAutoReload.hide();

	const toolbar = $("#toolbar");
	toolbar.append($(`
      <div class="pull-right">
         <span id="toolbar-run-status"></span>

         <button disabled id="script-run-button" href="#" role="button" aria-haspopup="true" class="btn btn-default">
            <span aria-hidden="true" class="glyphicon glyphicon-play"></span>
         </button>
         <button disabled id="script-stop-button" href="#" role="button" aria-haspopup="true" class="btn btn-default">
            <span aria-hidden="true" class="glyphicon glyphicon-stop"></span>
         </button>
      </div>
   `))
}


const _replayParameters = {
	"target-ip": {
		label: "Destination IP",
		description: "Attack target IP",
		default: "192.168.0.101",
		attr: {
			//https://jqueryvalidation.org/documentation/
			type: "IPv4"
		}
	}
};

const replayParameters = {
	//https://tcpreplay.appneta.com/wiki/tcpreplay-man.html
"--intf1" : {
	label: "Traffic output NIC",
	default: "eth0",
	values: ["eth0"],
	description: "\
Client to server/RX/primary traffic output interface.\
\n\
Required network interface used to send either all traffic or traffic which is marked as `primary` via tcpprep. \
Primary traffic is usually client-to-server or inbound (RX) on khial virtual interfaces.\
"
},

/*
	"--timer": {
		label: "Timer",
		values: ["nano", "select", "ioport", "gtod"],
		default: "gtod",
		description: "\
Select packet timing mode: select, ioport, gtod, nano. \
This option may appear up to 1 times. The default string for this option is: `gtod`\
\n\n\
Allows you to select the packet timing method to use:\
\n\n\
- `nano` - Use nanosleep() API\n\n\
- `select` - Use select() API\n\n\
- `ioport` - Write to the i386 IO Port 0x80\n\n\
- `gtod` [default] - Use a `gettimeofday()` loop\n\n\
\
"
	},
*/

	"--maxsleep": {
		label: "Max sleep (ms)",
		description: "\
Sleep for no more then X milliseconds between packets. \
This option takes an integer number as its argument. \
The default number for this option is: 0\
\
Set a limit for the maximum number of milliseconds that tcpreplay will sleep between packets. \
Effectively prevents long delays between packets without effecting the majority of packets. \
Default is disabled.\
	",
		attr: {
			type: "number"
		}
	},
/*
	"--verbose": {
		label: "Verbose",

		default: true,
		description: "Print decoded packets via tcpdump to STDOUT."
	},
*/
	/*
	-A string, --decode=string
	
	Arguments passed to tcpdump decoder. This option may appear up to 1 times. This option must appear in combination with the following options: verbose.
	
	When enabling verbose mode (-v) you may also specify one or more additional arguments to pass to tcpdump to modify the way packets are decoded. By default, -n and -l are used. Be sure to quote the arguments like: -A "-axxx" so that they are not interpreted by tcpreplay. Please see the tcpdump(1) man page for a complete list of options.
	*/


	"--preload-pcap": {
		label: "Preloads packets",

		default: true,
		description: "\
This option loads the specified pcap(s) into RAM before starting to send \
in order to improve replay performance while introducing a startup performance hit.\
\n\n\
Preloading can be used with or without `loop`. \
\n\n\
This option also suppresses flow statistics collection for every iteration, \
which can significantly reduce memory usage.\
Flow statistics are predicted based on options supplied \
and statistics collected from the first loop iteration.\
"
	},
	/*
	-c string, --cachefile=string
	
	Split traffic via a tcpprep cache file. This option may appear up to 1 times. This option must appear in combination with the following options: intf2. This option must not appear in combination with any of the following options: dualfile.
	
	If you have a pcap file you would like to use to send bi-directional traffic through a device (firewall, router, IDS, etc) then using tcpprep you can create a cachefile which tcpreplay will use to split the traffic across two network interfaces.
	
	-2, --dualfile
	
	Replay two files at a time from a network tap. This option may appear up to 1 times. This option must appear in combination with the following options: intf2. This option must not appear in combination with any of the following options: cachefile.
	
	If you captured network traffic using a network tap, then you can end up with two pcap files- one for each direction. This option will replay these two files at the same time, one on each interface and inter-mix them using the timestamps in each.
*/

/*
	-I string, --intf2=string
	
	Server to client/TX/secondary traffic output interface. This option may appear up to 1 times.
	
	Optional network interface used to send traffic which is marked as ’secondary’ via tcpprep. Secondary traffic is usually server-to-client or outbound (TX) on khial virtual interfaces. Generally, it only makes sense to use this option with --cachefile.
	
	--listnics
	
	List available network interfaces and exit.
	*/


	"--loop": {
		label: "Loop",
		default: 1,
		type: "number",
		description: "\
Loop through the capture file X times. \
This option takes an integer number as its argument. The value of number is constrained to being: \
\
greater than or equal to 0. \
\n\n\
If the value is 0, loop foverver.\
\n\n\
The default number for this option is: 1\
"
	},
	"--loopdelay-ms": {
		label: "Delay between loops (ms)",
		default: 0,
		type: "number",
		description: "\
This option must appear in combination with the following options: loop. \
This option takes an integer number as its argument. \
The value of number is constrained to being: greater than or equal to 0\
\n\n\
The default number for this option is: 0\
"},

	"--pktlen": {
		label: "Packet length",
		type: "number",
		description: "\
Override the snaplen and use the actual packet len. \
\n\n\
By default, tcpreplay will send packets based on the size of the `snaplen` stored in the pcap file\
which is usually the correct thing to do. \
However, occasionally, tools will store more bytes then told to. \
By specifying this option, tcpreplay will ignore the snaplen field and instead \
try to send packets based on the original packet length. \
Bad things may happen if you specify this option.\
"},

	"--limit": {
		label: "Number of packets to send",
		type: "number",
		description: "\
Limit the number of packets to send. This option takes an integer number as its argument. \
The value of number is constrained to being: greater than or equal to 1 \
\n\n\
The default number for this option is: -1\
\n\n\
By default, all the packets will be sent. Alternatively, you can specify a maximum number of packets to send.\
"},

	"--duration": {
		label: "Timeout (second)",
		type: "number",
		description: "\
Limit the number of seconds to send. This option takes an integer number as its argument. \
The value of number is constrained to being: greater than or equal to 1\
\n\n\
The default number for this option is: -1\
\n\n\
By default, all the packets will be sent. Alternatively, you can specify a maximum number of seconds to transmit.\
"},

	"--multiplier": {
		label: "Multiplier",
		type: "number",
		description: "\
Modify replay speed to a given multiple. \
This option must *not* appear in combination with any of the following options: pps, mbps, oneatatime, topspeed.\
\n\n\
Specify a value to modify the packet replay speed. Examples:\
\n\
- 2.0 will replay traffic at twice the speed captured\
\n\
- 0.7 will replay traffic at 70% the speed captured\
"},

	"--pps": {
		label: "Debit (pps)",
		type: "number",
		default: 500,
		description: "\
Replay packets at a given packets/sec. \
This option *must not* appear in combination with any of the following options: multiplier, mbps, oneatatime, topspeed.\
\n\n\
Specify a value to regulate the packet replay to a specific packet-per-second rate. Examples:\
\n\n\
- 200 will replay traffic at 200 packets per second\
\n\
- 0.25 will replay traffic at 15 packets per minute\
"},

	"--mbps": {
		label: "Bandwidth (Mbps)",
		type: "number",
		description: "\
Replay packets at a given Mbps. \
This option *must not* appear in combination with any of the following options: multiplier, pps, oneatatime, topspeed.\
\n\n\
Specify a floating point value for the Mbps rate that tcpreplay should send packets at.\
"},

	"--topspeed": {
		label: "Top speed",
		values: [false, true],
		description: "\
Replay packets as fast as possible. \
This option *must not* appear in combination with any of the following options: mbps, multiplier, pps, oneatatime.\
"},
	/*
	-o, --oneatatime
	
	Replay one packet at a time for each user input. This option must not appear in combination with any of the following options: mbps, pps, multiplier, topspeed.
	
	Allows you to step through one or more packets at a time.
	
	--pps-multi=number
	
	Number of packets to send for each time interval. This option must appear in combination with the following options: pps. This option takes an integer number as its argument. The value of number is constrained to being:
	
	greater than or equal to 1
	
	The default number for this option is:
	1
	
	When trying to send packets at very high rates, the time between each packet can be so short that it is impossible to accurately sleep for the required period of time. This option allows you to send multiple packets at a time, thus allowing for longer sleep times which can be more accurately implemented.
	*/

	"--unique-ip": {
		label: "Unique IP",
		default: true,
		description: "\
Modify IP addresses each loop iteration to generate unique flows. \
This option *must* appear in combination with the following options: loop.\
\n\n\
Ensure IPv4 and IPv6 packets will be unique for each --loop iteration. \
This is done in a way that will not alter packet CRC, \
and therefore will genrally not affect performance. \
\n\n\
This option will significantly increase the flows/sec over generated over multiple loop iterations.\
"},

	"--unique-ip-loops": {
		label: "Unique IP in loops",
		type: "number",
		description: "\
Number of times to loop before assigning new unique ip. \
This option *must* appear in combination with the following options: `unique-ip`.\
\n\n\
Number of --loop iterations before a new unique IP is assigned. \
\n\n\
Default is 1. \
\n\n\
Assumes both --loop and --unique-ip.\
"},
	/*
	--netmap
	
	Write packets directly to netmap enabled network adapter.
	
	This feature will detect netmap capable network drivers on Linux and BSD systems. If detected, the network driver is bypassed for the execution duration, and network buffers will be written to directly. This will allow you to achieve full line rates on commodity network adapters, similar to rates achieved by commercial network traffic generators. Note that bypassing the network driver will disrupt other applications connected through the test interface. See INSTALL for more information.
	
	This feature can also be enabled by specifying an interface as ’netmap:<intf>’ or ’vale:<intf>. For example ’netmap:eth0’ specifies netmap over interface eth0.
	
	--nm-delay=number
	
	Netmap startup delay. This option takes an integer number as its argument. The default number for this option is:
	10
	
	Number of seconds to delay after netmap is loaded. Required to ensure interfaces are fully up before netmap transmit. Requires netmap option. Default is 10 seconds.
	*/

	"--no-flow-stats": {
		label: "Suppress flows statistics",
		default: false,
		description: "\
Suppress printing and tracking flow count, rates and expirations.\
\n\n\
Suppress the collection and printing of flow statistics. \
This option may improve performance when not using --preload-pcap option, \
otherwise its only function is to suppress printing.\
\n\n\
The flow feature will track and print statistics of the flows being sent. \
A flow is loosely defined as a unique combination of a 5-tuple, \
i.e. source IP, destination IP, source port, destination port and protocol.\
\n\n\
If --loop is specified, the flows from one iteration to the next will not be unique, \
unless the packets are altered. \
Use --unique-ip or tcpreplay-edit to alter packets between iterations.\
"},

	"--flow-expiry": {
		label: "Flow expiry (second)",
		type: "number",
		default: 0,
		description: "\
Number of inactive seconds before a flow is considered expired. \
This option must not appear in combination with any of the following options: no-flow-stats. \
This option takes an integer number as its argument. \
\n\n\
The value of number is constrained to being: greater than or equal to 0\
\n\n\
The default number for this option is: 0\
\n\n\
This option will track and report flow expirations based on the flow idle times. \
The timestamps within the pcap file are used to determine the expiry, \
not the actual timestamp of the packets are replayed. \
For example, a value of 30 suggests that if no traffic is seen on a flow for 30 seconds, \
any subsequent traffic would be considered a new flow, \
and thereby will increment the flows and flows per second (fps) statistics.\
\n\n\
This option can be used to optimize flow timeout settings for flow products. \
Setting the timeout low may lead to flows being dropped when in fact the flow is simply slow to respond. \
Configuring your flow timeouts too high may increase resources required by your flow product.\
\n\n\
Note that using this option while replaying at higher than original speeds can lead to inflated flows and fps counts.\
\n\n\
Default is 0 (no expiry) and a typical value is 30-120 seconds.\
"},

	/*
	-P, --pid
	
	Print the PID of tcpreplay at startup.
	*/

	"--stats": {
		label: "Statistics",
		type: "number",
		default: 0,
		description: "\
Print statistics every X seconds, or every loop if 0. \
This option takes an integer number as its argument. \
The value of number is constrained to being: greater than or equal to 0\
\n\n\
Note that timed delays are a **best effort** and long delays between sending packets \
may cause equally long delays between printing statistics.\
"}

}

const pcapLst = [
	{
		category: "* Divers",
		file: "proto-371.pcap",
		label: "Several protocols/applications",
		description: "This pcap file contains 371 different protocols and applications",
		parameters: {
			"--unique-ip": true,
			"--mbps": "",
			"--pps" : 1500,
			"--loop": 1,
			"--stats": 1,
			"--intf1":"eth0"
		}
	},
	/*
	{
		file: "10.http.port.pcap",
		label: "",
		description: "This pcap file contains HTTP packets that **do not** use normal HTTP ports such as, 80, 8080.",
		parameters: {
			"--unique-ip": true,
			"--mbps": 0.1,
			"--loop": 10,
			"--stats": 1,
			"--intf1":"eth0"
		}
	},
	*/ 
	{
		category: "Identity theft",
		file: "1.ssh_brute.pcap",
		label: "SSH brute force attack",
		description: "Several attempts to connect via ssh (brute force attack). Source address is either infected machine or attacker (no spoofing is possible).",
		alerts: [1], //rule ids detected
	},
	/* 
	{
		file: "2.ssh.pcap",
		label: "",
		description: ""
	}, {
		file: "3.SYNwithoutACK.pcap",
		label: "",
		description: ""
	},
	*/ 
	{
		category: "Identity theft",
		file: "4.5.arp_spoof.pcap",
		label: "ARP spoofing",
		description: "IPv4 address conflict detection (RFC5227). Possible ARP poisoning.",
		alerts: [4,5]
	},
	{
		category: "Network scan",
		file: "6.SYNFUL.pcap",
		label: "SYNFUL attack",
		description: "SYN and ACK packets with a 0xC123D delta between TCP sequence numbers (scan done by SYNFUL attack).",
		alerts: [6]
	}, /*{
		file: "7.invalid_tcp_rst.pcap",
		label: "",
		description: ""
	}, */
	{
		category: "DoS/DDoS",
		file: "8.ip.options.pcap",
		label: "IP options field non-homogeneous in all IP fragments",
		description: "IP options field non-homogeneous in all IP fragments: The IP options field must be homogeneous in all IP fragments.",
		alerts: [8, 9, 22, 24, 60]
	}, {
		category: "DoS/DDoS",
		file: "9.ip_frag_min_size.pcap",
		label: "Too small IP fragment",
		description: "Too small IP fragment: The minimum size of an IP fragment is 28 bytes and for an IP fragment with offset 0 it is 40.",
		alerts: [9, 22, 24]
	},/* {
		category: "DoS/DDoS",
		file: "11.ip_size.pcap",
		label: "Too small packet size ",
		description: "Too small packet size (less than 34 bytes)",
		note: "Some network card do padding => cannot detect those packets",
		alerts: [11]
	}, */{
		category: "Web attack/ Phishing mail attack",
		file: "12.uri_invalid.pcap",
		label: "HTTP URI with unauthorized characters/Traversal attack ",
		description: "HTTP packet URI contains non authorized characters according to RFC2396 and RFC2234 or possibly directory traversal attack.",
		note: "The rule to detect is expensive and generates many alerts in real-world traffic",
		alerts: [12]
	}, /*{
		file: "13.data_in_SYN.pcap",
		label: "",
		description: ""
	},*/ {
		category: "Evasion",
		file: "14.illegal_port.pcap",
		label: "Illegal port",
		description: "Unauthorized port number according to [Wikipedia](https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers)",
		note: "The rule to detect is potentially generating too many alerts with real-world traffic but can be kept in this demo if needed",
		alerts: [13, 14]
	}, {
		category: "Network scan",
		file: "15.nikto.pcap",
		label: "Nikto scan",
		description: "Nikto scan for the discovery of vulnerabilities",
		alerts: [15, 16]
	},/* {
		file: "16.two_successive_SYN.pcap",
		label: "",
		description: ""
	}, {
		file: "17.smtp.pcap",
		label: "",
		description: ""
	},*/ {
		category: "Evasion",
		file: "18.gre.pcap",
		label: "Invalid GRE version",
		description: "Invalid GRE version",
		alerts: [18]
	}, /*{
		file: "19.SQLI.pcap",
		label: "",
		description: ""
	}, */{
		category: "DoS/DDoS",
		file: "20.icmp_redirect_flood.pcap",
		label: "ICMP redirect flood",
		description: "ICMP redirect flooding attack ",
		alerts: [20]
	}, {
		category: "Evasion",
		file: "21.ip_frag_off.pcap",
		label: "IP fragments with offset always = 0 (allowed but could be an evasion)",
		description: "IP fragmentation : fragments with offset always = 0 (allowed but could be an evasion).",
		alerts: [21]
	}, {
		category: "Evasion",
		file: "22.ip_frag_size.pcap",
		label: "IP fragment with the size less than 9 bytes (allowed but could be an evasion)",
		description: "IP fragmentation : a fragment with a size less than 9 bytes (allowed but could be an evasion).",
		alerts: [22, 9, 24],
	}, {
		category: "Evasion",
		file: "23.ip_frag_overlapping.pcap",
		label: "Out of order IP fragmentation",
		description: "IP fragmentation : Out of order fragments (allowed but could be an evasion).",
		alerts: [23, 9, 22, 24, 25],
	}, {
		category: "Evasion",
		file: "24.ip_frag_overlapping.pcap",
		label: "Overlapping IP fragmentation",
		description: "Overlapping IP fragmentation : difference in offset of concomitant fragments less than fragment length (allowed but could be an evasion).",
		alerts: [24, 9, 22],
	}, {
		category: "Evasion",
		file: "25.ip_frag_overlapping_unordered.pcap",
		label: "Overlapping unordered IP fragmentation",
		description: "Overlapping unordered IP fragmentation : difference in offset of concomitant fragments less than fragment length (allowed but could be an evasion).",
		alerts: [25, 9, 22, 23, 24],
	}, {
		category: "Network scan",
		file: "26.protocal_scan.pcap",
		label: "IP scan",
		description: "Probable IP protocol scan (4 different attempts in a row on different protocols).",
		alerts: [26, 62],
	}, {
		category: "Network scan",
		file: "27.udp_scan.pcap",
		label: "UDP scan",
		description: "Probable UDP protocol scan (4 different attempts in a row on different ports).",
		alerts: [27],
	}, {
		category: "Network scan",
		file: "28.xmas_can.pcap",
		label: "XMAS scan",
		description: "XMAS scan : TCP with all flags FIN, URG, PSH active.",
		alerts: [28, 66],
	}, /*{
		file: "29.http_0.9.pcap",
		label: "",
		description: ""
	}, {
		file: "30.31.nfs_upload.pcap",
		label: "",
		description: ""
	}, */{
		category: "Ransomware/ Identity theft",
		file: "32.botcc.pcap",
		label: "Botnet Command and Control detection based on blacklisted IP addresses",
		description: "Botnet Command and Control detection based on blacklisted IP addresses.",
		alerts: [32, 69, 70],
		
	}, {
		category: "Ransomware/ Phishing mail attack",
		file: "33.trojan.pcap",
		label: "Trojan detection based on blacklisted HTTP URI",
		description: "TROJAN detection based on the hash table of 426 blacklisted http_uri",
		alerts: [33],
	}, {
		category: "DoS/DDoS/ Web attack",
		file: "34.35.36.37.user_agent.pcap",
		label: "Detection of DoS attack based on HTTP User-Agent field",
		description: "Detection of DoS attack based on HTTP User-Agent field. Detection of robot, crawler, spider, spam and bad bot based on blacklisted User-Agent strings (hash-table)",
		alerts: [34, 36],
	}, {
		category: "Ransomware",
		file: "38.WannaCry.pcap",
		label: "WannaCry ransomware",
		description: "This pcap file contain packets being captured from a machine that has been infected WannaCry virus.",
		parameters: {
			"--unique-ip": false,
			"--pps" : 400,
			"--loop": 1,
			"--stats": 1,
			"--intf1":"eth0"
		},
		alerts: [38, 70],
	}, {
		category: "Ransomware/ Phishing mail attack",
		file: "39.tor.ip.pcap",
		label: "TOR nodes detection based on blacklisted IP addresses",
		description: "TOR nodes detection based on blacklisted IP addresses.",
		alerts: [39],
	}, {
		category: "Network scan",
		file: "40.TCP_SYN_scan.pcap",
		label: "TCP SYN scan",
		description: "Probable TCP SYN scan (4 different attempts in a row on different ports).",
		alerts: [40, 14],
	}, {
		category: "Network scan",
		file: "41.SCTP_INIT_scan.pcap",
		label: "SCTP INIT scan",
		description: "Probable SCTP INIT scan (4 different attempts in a row on different ports).",
		alerts: [41],
	}, /*{
		category: "Network scan",
		file: "42.TCP_NULL_scan.pcap",
		label: "",
		description: ""
	}, */{
		category: "Network scan",
		file: "43.TCP_FIN_scan.pcap",
		label: "TCP FIN scan",
		description: "Probable TCP FIN scan (4 different attempts in a row on different ports).",
		alerts: [43, 14],
	}, {
		category: "Network scan",
		file: "44.TCP_ACK_scan.pcap",
		label: "TCP ACK scan",
		description: "Probable TCP ACK/Window scan (4 different attempts in a row on different ports).",
		alerts: [44, 14],
	}, {
		category: "Network scan",
		file: "45.TCP_Maimon_scan.pcap",
		label: "TCP Maimon scan",
		description: "Probable TCP Maimon scan (4 different attempts in a row on different ports).",
		alerts: [45, 14],
	}, {
		category: "Network scan",
		file: "46.SCTP_COOKIE_ECHO_scan.pcap",
		label: "SCTP COOKIE ECHO scan",
		description: "Probable SCTP COOKIE ECHO scan ",
		alerts: [46],
	}, /*{
		category: "Network scan",
		file: "47.TCP_idle_scan.pcap",
		label: "",
		description: ""
	},*/ {
		category: "Network scan",
		file: "48.FTP_BOUNCE_SCAN.pcap",
		label: "FTP bounce scan",
		description: "Probable FTP bounce scan.",
		alerts: [48],
	},/* {
		file: "49.unknown_proto.pcap",
		label: "",
		description: ""
	}, {
		file: "50.outside_ip.pcap",
		label: "",
		description: ""
	}, */{
		category: "DoS/DDoS",
		file: "51.ping_of_death.pcap",
		label: "Ping of death attack",
		description: "Ping of death attack: Too big ICMP packet",
		alerts: [51, 24, 53]
	}, {
		category: "DoS/DDoS",
		file: "52.nestea.pcap",
		label: "Nestea DoS attack",
		description: "Malformed IP fragments. Possibly Nestea DoS attack.",
		alerts: [52, 9],
	}]



//create reports
var ReportFactory = {

	createFormScripts: function() {
		setToolbarButtons();
		const markdown2HTML = new showdown.Converter();

		const categoryPcap = {};
		
		
		pcapLst.forEach( e => {
			let cat = e.category || "";
			cat = cat.trim();
			
			if( categoryPcap[cat] == undefined )
				categoryPcap[cat] = [];
			categoryPcap[cat].push( e );
		})
		
		
		
		const newPcapLst = [];
		const keysArr = Object.keys(categoryPcap);
		keysArr.sort();
		
		keysArr.forEach( cat => {
			//first item is cateogry
			if( cat != "" )
				newPcapLst.push({label: cat, disable: true});
			const arr = categoryPcap[cat];
			arr.sort( (a,b) => { 
				return a.label - b.label; 
			});
			arr.forEach( e => {
				if( e.label )
					e.label = "&nbsp;&nbsp;&nbsp;&nbsp;" + e.label;
				newPcapLst.push( e );
			});
		})
		
		var form_config = {
			type: "<div>",
			attr: {
				class: "col-md-10 col-md-offset-1 form-horizontal",
				style: "margin-top: 10px",
			},
			children: [{
				type: "<select>",
				label: "Select a pcap file to be replayed",
				attr: {
					id: "list-pcap-file",
					class: "form-control",
					style: "height: 34px"
				},
				children: newPcapLst.map((el, i) => {
					let ret = {
						type: "<option>",
						attr: {
							value: el.file,
							html: el.label === "separator" ? "-" : (el.label === "" ? el.file : el.label)
						}
					};
					if( el.disable )
						ret.attr.disabled = "disabled";
					return ret;
				})
			}, {
				type: "<div>",
				attr: {
					id: "script-detail",
					class: "",
					//style: "position: fixed; bottom: 10px; overflow: auto"
				}
			}]
		};

		function forEachReplayParameter(fn) {
			for (var i in replayParameters) {
				const e = replayParameters[i];
				fn(e, i);
			}
		}

		contentEl.script().html(MMTDrop.tools.createForm(form_config));
		//id of input element
		const PARAM_INPUT_ID_PREFIX = "script-param-";

		$("#list-pcap-file").change(function(event) {
			//prevent appearing resetGrid button
			event.stopImmediatePropagation();
			const selValue = $(this).val();
			const detailForm = [];
			const pcapFile = pcapLst.find( (e) => e.file == selValue );
			if( pcapFile == undefined )
				return;
				
			if (pcapFile.label === "separator")
				$("#script-run-button").disable();
			else
				$("#script-run-button").enable();
			//clear the previous run's' status
			$("#toolbar-run-status").html('');
			
			let des = pcapFile.description;
			if( pcapFile.alerts && pcapFile.alerts.length )
				des += '<br/>This attack traffic can be detected by rule' + (pcapFile.alerts.length>1?'s':'')  +  ' ' + pcapFile.alerts.join(", ") + ' ...';
			if( pcapFile.note )
				des += "<br/><br/><u>Note</u>:" + pcapFile.note;
			
			if (des && des.length > 0 )
				detailForm.push({
					type: "<div>",
					label: "Description",
					attr: {
						class: "text-justify",
						style: "padding-left: 20px;padding-right: 20px",
						html: markdown2HTML.makeHtml( des )
					}
				})

			/**
			Generate input element for a parameter.
			It can be a textbox, or a combobox
			*/
			function _genParamInput(e, i) {
				//	//boolean => checkbox
				if (typeof (e.default) === "boolean" && e.values == undefined) {
					e.values = [{ label: "yes", value: true }, { label: "no", value: false }]
				}
				let ret = null;
				//enum => return a <select>, each element in the enum will be an <option>
				if (e.values) {
					//list of <option>
					const options = e.values.map((v, i) => {
						let label = value = v;
						if (typeof (v) === "object") {
							label = v.label;
							value = v.value;
						}
						const ret = {
							type: "<option>",
							attr: {
								value: value,
								text: label
							}
						};
						if (value == e.default)
							ret.attr.selected = true;
						return ret;
					});
					//create a combobox
					ret = {
						type: "<select>",
						attr: e.attr ? e.attr : {}, //if user provides additional attr
						children: options
					}
				} else {
					//textbox
					ret = {
						type: "<input>",
						attr: e.attr ? e.attr : {} //if user provides additional attr
					}

					if (e.type)
						ret.attr.type = e.type;

					//default value
					ret.attr.value = e.default !== undefined ? e.default : "";
				}
				
				ret.attr.class = "form-control param-input";
				ret.attr.id = PARAM_INPUT_ID_PREFIX + i;
				
				//remember default value: this helps to know whether the element's value has been changed 
				if (e.default !== undefined)
					ret.attr["data-default-value"] = e.default
				//remember parameter name
				ret.attr["data-param-name"] = i;
				return ret;
			};


			//form of elements in parameters of the selected script
			const paramForm = [];
			forEachReplayParameter(function(e, i) {
				//parameter must not contain some special characters
				if (i.indexOf('=') != -1) {
					MMTDrop.alert.warning(`Ignore parameter <code>${i}</code>.<br/>
					Parameters must not contain <code>=</code> character.`);
					return;
				}

				paramForm.push({
					type: "<div>",
					attr: {
						class: "form-group has-success col-lg-6",
						style: "margin-left: 0px; margin-right: 0px"
					},
					children: [{
						type: "<div>",
						attr: {
							class: "input-group  input-group-sm",
						},
						children: [
							{
								type: "<span>",
								attr: {
									class: "input-group-addon",
									html: e.label + " ",
								}
							},
							_genParamInput(e, i),
							//info button
							{
								type: "<span>",
								attr: {
									tabindex: 9999,
									role: "button",
									class: "input-group-addon glyphicon glyphicon-info-sign",
									"data-toggle": "popover",
									"data-html": true,
									"data-placement": "left",
									"data-content": markdown2HTML.makeHtml( e.description ),
									title: e.label
								}
							}
						]
					}]
				});
			});

			detailForm.push({
				type: "<form>",
				label: "Parameters",
				attr: {
					id: "form-pcap-parameters",
					class: ""
				},
				children: [{
					type: "<div>",
					attr: {
						class: "col-md-10 col-md-offset-1"
					},
					children: paramForm
				}]
			});

			//whether having any elements to render
			$("#script-detail").html(MMTDrop.tools.createForm({
				type: "<div>",
				children: detailForm
			}));

			//enable validator
			$("#form-pcap-parameters").validate({
				errorClass: "text-danger",
				errorElement: "span"
			});
			
			//set default values coressponding to the selected pcap file
			if (pcapFile.parameters) {
				for (let i in pcapFile.parameters) {
					//need to convert value to string
					//because values of options of a selectbox are string, e.g., "true" (not true)
					//=> el.val(true) will not select the right option
					//but el.val("true") does its job
					const v = pcapFile.parameters[i] + "";

					const el = $("#" + PARAM_INPUT_ID_PREFIX + i);
					if (el)
						el.val(v) //set new value
							.flash(1000) //animate the modifcation
							;
				}
			}

			//enable tooltip
			$('[data-toggle="popover"]').popover({
				container: "body",
				trigger: "focus"
			})
		})
			//fire change for the first time
			.trigger('change')
			;

		function getParameterValues() {
			const values = {};
			forEachReplayParameter(function(e, i) {
				//get DOM element using jQuery
				const el = $('#' + PARAM_INPUT_ID_PREFIX + i);
				if (!el)
					return;
				const v = el.val();
				//retain only the new value
				if (v && v.length > 0)
					values[i] = v;
			});
			return values;
		}

		function setEnableParameterInput(isEnable) {
			$('#list-pcap-file').setEnable(isEnable);
			$('.param-input').setEnable(isEnable);
		}

		function setTerminateExecutionStatus(isSuccess) {
			$("#script-run-button").enable();
			$("#script-stop-button").disable();
			//enable editing parameters
			setEnableParameterInput(true);
			
			if (isSuccess) {
				$("#toolbar-run-status").html('<span aria-hidden="true" style="color:green" class="glyphicon glyphicon-ok" title="Successfully replaying"></span>');
			} else {
				$("#toolbar-run-status").html('<span aria-hidden="true" style="color:red" class="glyphicon glyphicon-remove" title="Error when replaying. See execution log for further information."></span>');
			}
		}

		function output(txt, isErrorMessage ) {
			if( Array.isArray( txt )){
				if( txt.length == 0 )
					return;
				txt = txt.join(" ");
			}
			contentEl.output().append($("<p>", {
				class: isErrorMessage? "text-danger": ""
			}).html('<b>' + MMTDrop.tools.formatDateTime(new Date(), true) + '</b><pre>' + txt + '</pre>'));
			//scroll to bottom
			contentEl.output().animate({ scrollTop: 9999999 }, 500);
		}

		function retriveExecutionLog( filename ){
			MMTDrop.tools.ajax("/auto/attack/pcap/status/" + filename, {}, "GET", {
				error: function( data ){
					setTerminateExecutionStatus(false);
					output( "Cannot get status" );
				},
				success: function( data ){
					output( data.stdout )
					output( data.stderr, true );
					if( data.isRunning ){
						setEnableParameterInput(false);
						$("#script-run-button").disable();
						$("#script-stop-button").enable();
						//continue to retrive execution logs
						setTimeout( retriveExecutionLog, 1000, filename );
					}else {
						setTerminateExecutionStatus( data.exitCode == 0 );
						//error
						if( data.exitCode != 0){
							const msg = "Failure with code " + data.exitCode;
							output( msg, true );
							MMTDrop.alert.error( msg );
						}
					}
				}
			});
		}
		
		//check for the firstime: when a pcap is playing
		MMTDrop.tools.ajax("/auto/attack/pcap/status/_check", {}, "GET", {
			error: function(){
				output( "Cannot get status" );
			},
			success: function( data ){
				if( data.stdout )
					output( data.stdout )
				if( data.stderr)
					output( data.stderr, true );

				if( data.isRunning ){
					setEnableParameterInput(false);
					$("#toolbar-run-status").html('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
					$("#script-run-button").disable();
					$("#script-stop-button").enable();
					//continue to retrive execution logs
					setTimeout( retriveExecutionLog, 1, "_filename" );
				}else {
					setEnableParameterInput(true);
					$("#script-run-button").enable();
					$("#script-stop-button").disable();
				}
			}
		});
		
		

		$("#script-run-button").click(function() {
			$("#toolbar-run-status").html('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
			$("#script-run-button").disable();
			$("#script-stop-button").enable();
			//disable editing parameters
			setEnableParameterInput(false);

			const paramValues = getParameterValues();
			const selValue = $("#list-pcap-file").val();
			const pcapFile = pcapLst.find( (e) => e.file == selValue );
			
			if( pcapFile == undefined )
				return;
			const pcapFilename = pcapFile.file;
			//start new output section
			output(`<u><b>Replay pcap file <code>${pcapFilename}</code></b></u>`);
			output(`Replay parameters: ${JSON.stringify(paramValues)}`);

			MMTDrop.tools.ajax("/auto/attack/pcap/replay/" + pcapFilename, paramValues, "POST", {
				error: function() {
					const msg = `Cannot replay the pcap file <code>${pcapFilename}</code>`;
					MMTDrop.alert.error(msg);
					setTerminateExecutionStatus(false);
					output( msg, true );
				},
				success: function() {
					//MMTDrop.alert.success("Successfully add the Probe", 3 * 1000);
					//star timer to get execution log
					setTimeout( retriveExecutionLog, 1000, pcapFilename );
				}
			});
		});

		$("#script-stop-button").click(function() {
			setTerminateExecutionStatus(false);
			const selValue = $("#list-pcap-file").val();
			const pcapFile = pcapLst.find( (e) => e.file == selValue );
			if( pcapFile == undefined )
				return;
			const pcapFilename = pcapFile.file;
			
			
			MMTDrop.tools.ajax("/auto/attack/pcap/stop/" + pcapFilename, {} , "POST", {
				error: function() {
					const msg = `Cannot stop the pcap file <code>${pcapFilename}</code>`;
					MMTDrop.alert.error(msg);
					setTerminateExecutionStatus(false);
					output( msg, true );
				},
				success: function() {
					output("Requested to stop", true);
				}
			});
		});
	},

	createFormOutput: function() {
	},
}
