var arr = [
	{
		id: "list-pcap-files",
		title: "Pcap Traffic",
		x: 0,
		y: 0,
		width: 12,
		height: 6,
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
		height: 4,
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
         <button disabled id="script-run-button" href="#" role="button" aria-haspopup="true" class="btn btn-default">
            <span aria-hidden="true" style="color:green" class="glyphicon glyphicon-ok"></span>
         </button>
         <button disabled id="script-run-button" href="#" role="button" aria-haspopup="true" class="btn btn-default">
            <span aria-hidden="true" style="color:red" class="glyphicon glyphicon-remove"></span>
         </button>
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

const replayParameters = {
	"target-ip": {
		label: "Destination IP",
		description: "Attack target IP",
		default: "192.168.0.101",
		type: "IPv4"
	},
	"target-port": {
		label: "Destination Port",
		default: "2222"
	},
	"source-ip": {
		label: "Source IP",
		default: "192.168.0.1"
	},
	"output-nic": {
		label: "Output NIC",
		default: "eth1",
		values: ["eth0", "eth1"]
	},
	"timeout": {
		label: "Timeout (seconds)",
		default: 60,
		attr: {
			required: true,
			number: true
		}
	}
};

const pcapLst = [
	/* separator */
	{ label: "separator" },
	{
		file: "10.http.port.pcap",
		label: "",
		description: ""
	}, {
		file: "1.ssh_brute.pcap",
		label: "",
		description: ""
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
		var form_config = {
			type: "<div>",
			attr: {
				class: "col-md-10 col-md-offset-1 form-horizontal",
				style: "margin-top: 20px",
			},
			children: [{
				type: "<select>",
				label: "Select a pcap file to be replayed",
				attr: {
					id: "script-list",
					class: "form-control",
					style: "height: 34px",
					onchange: "loadDetailScript(this, event)"
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
					class: ""
				}
			}]
		};
		contentEl.script().html(MMTDrop.tools.createForm(form_config));

		window.loadDetailScript = function(sel, event) {
			//prevent appearing resetGrid button
			event.stopImmediatePropagation();
			const selValue = sel.value;
			const detailForm = [];
			const script = pcapLst[selValue];

			if (script.label === "separator")
				$("#script-run-button").disable();
			else
				$("#script-run-button").enable();

			if (script.description)
				detailForm.push({
					type: "<div>",
					label: "Description",
					attr: {
						class: "text-justify",
						style: "padding-left: 20px;padding-right: 20px",
						html: script.description
					}
				})
			function _genParamInput(e, i) {
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
					return {
						type: "<select>",
						attr: {
							class: "form-control",
							id: "script-param-" + i,
						},
						children: options
					}
				} else {
					let ret = {
						type: "<input>",
						attr: e.attr ? e.attr : {} //if user provides additional attr
					}

					ret.attr.class = "form-control";
					ret.attr.id = "script-param-" + i;
					ret.attr.value = e.default !== undefined ? e.default : "";
					return ret;
				}
			}

			//form of elements in parameters of the selected script
			const paramForm = [];
			for (var i in replayParameters) {
				const e = replayParameters[i];

				paramForm.push({
					type: "<div>",
					attr: {
						class: "form-group has-success has-feedback"
					},
					children: [{
						type: "<div>",
						attr: {
							class: "input-group",
						},
						children: [{
							type: "<span>",
							attr: {
								class: "input-group-addon",
								html: e.label,
							}
						},
						_genParamInput(e, i),
						{
							type: "<span>",
							attr: {
								class: "input-group-addon glyphicon glyphicon-info-sign",
								"data-toggle": "tooltip",
								title: e.description
							}
						}]
					}]
				});
			};
			detailForm.push({
				type: "<form>",
				label: "Parameters",
				attr: {
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
			//enable tooltip
			$('[data-toggle="tooltip"]').tooltip();
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
			$("#script-run-button").disable();
			$("#script-stop-button").enable();
			//clear output
			contentEl.output().text("");

			var timerCounter = 10;
			window._outputTimer = setInterval(function() {
				timerCounter--;
				if (timerCounter <= 0) {
					clearInterval(window._outputTimer);
					$("#script-run-button").disable();
					$("#script-stop-button").disable();
					output("successfully terminated");
				}
				else
					output(randomText());

			}, 1000);
		});

		$("#script-stop-button").click(function() {
			$("#script-run-button").enable();
			$("#script-stop-button").disable();

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
