var arr = [
	{
		id: "list-pcap-files",
		title: "Pcap Traffic",
		x: 0,
		y: 0,
		width: 12,
		height: 8,
		type: "info",
		userData: {
			fn: "createFormScripts"
		},
	}, {
		id: "output",
		title: "Output",
		x: 0,
		y: 8,
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

function randomText() {
	var words = ["The sky", "above", "the port", "was", "the color of television", "tuned", "to", "a dead channel", ".", "All", "this happened", "more or less", ".",  "I", "had", "the story", "bit by bit", "from various people", "and", "as generally", "happens", "in such cases", "each time", "it", "was", "a different story", ".", "It", "was", "a pleasure", "to", "burn"];
	var text = [];
	//random between 10 20+10
	var x = Math.floor(Math.random() * 20) + 10;
	while (--x)
		text.push(words[Math.floor(Math.random() * words.length)]);
	return text.join(" ");
}


const _replayParameters = {
	"target-ip": {
		label: "Destination IP",
		description: "Attack target IP",
		default: "192.168.0.101",
		attr:{
			//https://jqueryvalidation.org/documentation/
			type: "IPv4"
		}
	}
};

const replayParameters = {
//https://tcpreplay.appneta.com/wiki/tcpreplay-man.html

"--timer" :{
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

"--maxsleep": {
	label: "Max sleep (ms)",
	default: 0,
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

"--verbose": {
	label: "Verbose",
	
	default: true,
	description: "Print decoded packets via tcpdump to STDOUT."
},
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

-i string, --intf1=string

Client to server/RX/primary traffic output interface. This option may appear up to 1 times.

Required network interface used to send either all traffic or traffic which is marked as ’primary’ via tcpprep. Primary traffic is usually client-to-server or inbound (RX) on khial virtual interfaces.

-I string, --intf2=string

Server to client/TX/secondary traffic output interface. This option may appear up to 1 times.

Optional network interface used to send traffic which is marked as ’secondary’ via tcpprep. Secondary traffic is usually server-to-client or outbound (TX) on khial virtual interfaces. Generally, it only makes sense to use this option with --cachefile.

--listnics

List available network interfaces and exit.
*/


"--loop":{
	label:"Loop",
	default: 1,
	type: "number",
	description: "\
Loop through the capture file X times. \
This option takes an integer number as its argument. The value of number is constrained to being:\
\
greater than or equal to 0. If the value is 0, loop foverver.\
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
	default: 0,
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
	default: -1,
	description:"\
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
	default: -1,
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
	default: 1,
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
	default: 0,
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
	default: 0,
	description: "\
Replay packets at a given Mbps. \
This option *must not* appear in combination with any of the following options: multiplier, pps, oneatatime, topspeed.\
\n\n\
Specify a floating point value for the Mbps rate that tcpreplay should send packets at.\
"},

"--topspeed": {
	label: "Top speed",
	default: false,
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
	default: 1,
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

"--no-flow-stats" : {
	label: "No statistics",
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

"--flow-expiry" : {
	label: "Flow Expiry (second)",
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
	/* separator */
	//{ label: "separator" },
	{
		file: "10.http.port.pcap",
		label: "",
		description: "This pcap file contains HTTP packets that **do not** use normal HTTP ports such as, 80, 8080.",
		parameters: {
			"--unique-ip": true,
			"--mbps": 1,
			"--loop": 5
		}
	}, {
		file: "1.ssh_brute.pcap",
		label: "",
		description: "This pcap file stored packets being captured during a SSH brute-force attack."
	}, {
		file: "2.ssh.pcap",
		label: "",
		description: ""
	}, {
		file: "3.SYNwithoutACK.pcap",
		label: "",
		description: ""
	}, {
		file: "4.5.arp_spoof.pcap",
		label: "",
		description: ""
	}, {
		file: "6.SYNFUL.pcap",
		label: "",
		description: ""
	}, {
		file: "7.invalid_tcp_rst.pcap",
		label: "",
		description: ""
	}, {
		file: "8.ip.options.pcap",
		label: "",
		description: ""
	}, {
		file: "9.ip_frag_min_size.pcap",
		label: "",
		description: ""
	}, {
		file: "11.ip_size.pcap",
		label: "",
		description: ""
	}, {
		file: "12.uri_invalid.pcap",
		label: "",
		description: ""
	}, {
		file: "13.data_in_SYN.pcap",
		label: "",
		description: ""
	}, {
		file: "14.illegal_port.pcap",
		label: "",
		description: ""
	}, {
		file: "15.nikto.pcap",
		label: "",
		description: ""
	}, {
		file: "16.two_successive_SYN.pcap",
		label: "",
		description: ""
	}, {
		file: "17.smtp.pcap",
		label: "",
		description: ""
	}, {
		file: "18.gre.pcap",
		label: "",
		description: ""
	}, {
		file: "19.SQLI.pcap",
		label: "",
		description: ""
	}, {
		file: "20.icmp_redirect_flood.pcap",
		label: "",
		description: ""
	}, {
		file: "21.ip_frag_off.pcap",
		label: "",
		description: ""
	}, {
		file: "22.ip_frag_size.pcap",
		label: "",
		description: ""
	}, {
		file: "23.ip_frag_overlapping.pcap",
		label: "",
		description: ""
	}, {
		file: "24.ip_frag_overlapping.pcap",
		label: "",
		description: ""
	}, {
		file: "25.ip_frag_overlapping_unordered.pcap",
		label: "",
		description: ""
	}, {
		file: "26.protocal_scan.pcap",
		label: "",
		description: ""
	}, {
		file: "27.udp_scan.pcap",
		label: "",
		description: ""
	}, {
		file: "28.xmas_can.pcap",
		label: "",
		description: ""
	}, {
		file: "29.http_0.9.pcap",
		label: "",
		description: ""
	}, {
		file: "30.31.nfs_upload.pcap",
		label: "",
		description: ""
	}, {
		file: "32.botcc.pcap",
		label: "",
		description: ""
	}, {
		file: "33.trojan.pcap",
		label: "",
		description: ""
	}, {
		file: "34.35.36.37.user_agent.pcap",
		label: "",
		description: ""
	}, {
		file: "38.WannaCry.pcap",
		label: "",
		description: ""
	}, {
		file: "39.tor.ip.pcap",
		label: "",
		description: ""
	}, {
		file: "40.TCP_SYN_scan.pcap",
		label: "",
		description: ""
	}, {
		file: "41.SCTP_INIT_scan.pcap",
		label: "",
		description: ""
	}, {
		file: "41.TCP_INIT_scan.pcap",
		label: "",
		description: ""
	}, {
		file: "42.TCP_NULL_scan.pcap",
		label: "",
		description: ""
	}, {
		file: "43.TCP_FIN_scan.pcap",
		label: "",
		description: ""
	}, {
		file: "44.TCP_ACK_scan.pcap",
		label: "",
		description: ""
	}, {
		file: "45.TCP_Maimon_scan.pcap",
		label: "",
		description: ""
	}, {
		file: "46.SCTP_COOKIE_ECHO_scan.pcap",
		label: "",
		description: ""
	}, {
		file: "47.TCP_idle_scan.pcap",
		label: "",
		description: ""
	}, {
		file: "48.FTP_BOUNCE_SCAN.pcap",
		label: "",
		description: ""
	}, {
		file: "49.unknown_proto.pcap",
		label: "",
		description: ""
	}, {
		file: "50.outside_ip.pcap",
		label: "",
		description: ""
	}, {
		file: "51.ping_of_death.pcap",
		label: "",
		description: ""
	}, {
		file: "52.nestea.pcap",
		label: "",
		description: ""
	}, {
		file: "56.syn_flooding.pcap",
		label: "",
		description: ""
	}]



//create reports
var ReportFactory = {

	createFormScripts: function() {
		setToolbarButtons();
		const markdown2HTML = new showdown.Converter();
		
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
				children: pcapLst.map((el, i) => {
					return {
						type: "<option>",
						attr: {
							value: i,
							text: el.label === "separator" ? "-" : (el.label === "" ? el.file : el.label),
						}
					}
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
		
		contentEl.script().html(MMTDrop.tools.createForm(form_config));
		//id of input element
		const PARAM_INPUT_ID_PREFIX = "script-param-";
			
		$("#list-pcap-file").change( function(event) {
			//prevent appearing resetGrid button
			event.stopImmediatePropagation();
			const selValue = $(this).val();
			const detailForm = [];
			const pcapFile = pcapLst[selValue];

			if (pcapFile.label === "separator")
				$("#script-run-button").disable();
			else
				$("#script-run-button").enable();
			//clear the previous run's' status
			$("#toolbar-run-status").html('');

			if (pcapFile.description)
				detailForm.push({
					type: "<div>",
					label: "Description",
					attr: {
						class: "text-justify",
						style: "padding-left: 20px;padding-right: 20px",
						html: markdown2HTML.makeHtml( pcapFile.description )
					}
				})
			
			/**
			Generate input element for a parameter.
			It can be a textbox, or a combobox
			*/
			function _genParamInput(e, i) {
				//	//boolean => checkbox
				if ( typeof(e.default) === "boolean" && e.values == undefined){
					e.values = [{label: "yes", value: true}, {label: "no", value: false}]
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
						attr: {
							class: "form-control",
							//id of the combobox
							id: PARAM_INPUT_ID_PREFIX + i,
						},
						children: options
					}
				} else {
					//textbox
					ret = {
						type: "<input>",
						attr: e.attr ? e.attr : {} //if user provides additional attr
					}

					if( e.type )
						ret.attr.type = e.type;
					
					ret.attr.class = "form-control";
					ret.attr.id = PARAM_INPUT_ID_PREFIX + i;
					//default value
					ret.attr.value = e.default !== undefined ? e.default : "";
				}
				//remember default value: this helps to know whether the element's value has been changed 
				if( e.default !== undefined )
					ret.attr["data-default-value"] = e.default
				//remember parameter name
				ret.attr["data-param-name"] = i;
				return ret;
			};
			

			//form of elements in parameters of the selected script
			const paramForm = [];
			for (var i in replayParameters) {
				//parameter must not contain some special characters
				if( i.indexOf('=') != -1 ){
					MMTDrop.alert.warning(`Ignore parameter <code>${i}</code>.<br/>
					Parameters must not contain <code>=</code> character.`);
					continue;
				}
				const e = replayParameters[i];

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
									role:"button",
									class: "input-group-addon glyphicon glyphicon-info-sign",
									"data-toggle": "popover",
									"data-html"  : true,
									"data-placement": "left",
									"data-content": markdown2HTML.makeHtml( e.description ),
									title: e.label
								}
							}
						]
					}]
				});
			};
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
			if( pcapFile.parameters ){
				for( let i in pcapFile.parameters ){
					//need to convert value to string
					//because values of options of a selectbox are string, e.g., "true" (not true)
					//=> el.val(true) will not select the right option
					//but el.val("true") does its job
					const v = pcapFile.parameters[i] + "";
					
					const el = $("#" + PARAM_INPUT_ID_PREFIX + i);
					if( el )
						el.val( v ) //set new value
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

		function getParameterValues(){
			const values = {};
			for (var i in replayParameters) {
				const e = replayParameters[i];
				const defaultValue = e.default + "";
				//get DOM element using jQuery
				const el = $('#' + PARAM_INPUT_ID_PREFIX + i);
				if( ! el )
					continue;
				const v = el.val();
				//retain only the new value
				if( v != defaultValue )
					values[i] = v;
			}
			return values;
		}

		function output(txt) {
			contentEl.output().append($("<p>").html('<b>' + MMTDrop.tools.formatDateTime(new Date(), true) + '</b> ' + txt));
			//scroll to bottom
			contentEl.output().animate({ scrollTop: 9999999 }, 500);
		}

		//when click on run button
		if (window._outputTimer)
			clearInterval(window._outputTimer);

		$("#script-run-button").click(function() {
			$("#toolbar-run-status").html('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
			$("#script-run-button").disable();
			$("#script-stop-button").enable();
			//clear output
			contentEl.output().text("");
			
			const paramValues = getParameterValues();
			console.log( paramValues );

			var timerCounter = 10;
			window._outputTimer = setInterval(function() {
				timerCounter--;
				if (timerCounter <= 0) {
					clearInterval(window._outputTimer);
					$("#script-run-button").disable();
					$("#script-stop-button").disable();
					$("#toolbar-run-status").html('<span aria-hidden="true" style="color:green" class="glyphicon glyphicon-ok"></span>');
					output("successfully terminated");
				}
				else
					output(randomText());

			}, 1000);
		});

		$("#script-stop-button").click(function() {
			$("#script-run-button").enable();
			$("#script-stop-button").disable();
			$("#toolbar-run-status").html('<span aria-hidden="true" style="color:red" class="glyphicon glyphicon-remove"></span>');

			clearInterval(window._outputTimer);
			output("interrupted");
		});
	},

	createFormOutput: function() {
		contentEl.output().css({
			"background-color": "#333",
			"color": "white",
			"padding-top": "30px",
			"padding-left": "20px",
			"padding-right": "20px",
			"padding-bottom": "10px",
			"font-family": "Courier, Lucida Sans Typewriter, Lucida Typewriter, monospace",
			"font-size": "13px",
			"font-style": "normal",
			"font-variant": "normal",
			"font-weight": 400,
			"line-height": "20px"
		});
		contentEl.output().html("");
	},
}
