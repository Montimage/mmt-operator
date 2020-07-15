var arr = [
	{
		id: "list-script",
		title: "Attack Execution",
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
		return $("#list-script-content")
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

const scriptLst = [
	/* separator */
	/*{ label: "separator" },*/
	{
		label: "Attemp to connect via SSH but reseted immediatly",
		description: "Attempted to connect via ssh but reseted immediately. Source address is spoofed, infected machine or attacker",
		script: "2.ssh-reset.py",
		parameters: {
			"--ipDest": {
				label: "Target IP",
				description: "IP of the machine to be attacked",
				type: "IPv4",
				default: "192.168.0.20"
			},
			"--ipSrc": {
				label: "Source IP",
				description: "Source address is spoofed, infected machine or attacker",
				type: "IPV4",
				default: "192.168.0.10"
			}
		}
	},
	{
		label: "Several attempts to connect via SSH",
		description: "Several attempts to connect via ssh (brute force attack).\
      <u>Source address</u> is either infected machine or attacker (no spoofing is possible).<br/>\
      <code>Pre-requires</code>: ssh_brute.py, pxssh.py, dict.txt (containing the passwords to be tested)<br/>\
      <code>Pre-condition</code>: dummy\
      ",
		script: "",
		parameters: {
			"target-ip": {
				label: "Destination IP",
				description: "Attack target IP",
				default: "192.168.0.101",
				type: "IPv4"
			},
			"target-port": {
				label: "Destination Port",
				default: "2222",
				type: "number"
			},
			"source-ip": {
				label: "Source IP",
				default: "192.168.0.1",
				type: "IPv4",
			},
			"output-nic": {
				label: "Output NIC",
				values: ["eth0", "enp0s8"],
				default: "eth0"
			},
			"timeout": {
				label: "Timeout (seconds)",
				default: 60,
				type: "number"
			}
		}
	},
	{
		label: "Detect NFS synchronization",
		description: "Detection of NFS synchronization then Upload (possible data leak)\
      by one probe or two probes with <a href='https://redis.io/'>REDIS</a>.<br/>\
      Replay the prepared pcap file: <code>30.31.nfs_upload.pcap</code>",
		script: "",
		parameters: {
			"out-nic": {
				label: "Output NIC",
				default: "eth0"
			},
			"debit": {
				label: "Debit (pps)",
				default: 10
			},
			"loop": {
				label: "Number of loops",
				default: 10
			},
			"target": {
				label: "Target IP",
				default: "192.168.0.10"
			}
		}
	},
	/* separator */
	{ label: "separator" },
	{
		label: "Scan all open UDP ports of a given IP target",
		description: "Lorem ipsum – These words tell the brain to focus all attention on the visual design and safely ignore the content. The purpose of lorem ipsum is to create a natural looking, though nonsensical, text that doesn’t distract from the layout. It is a placeholder, filler or dummy text used in the printing and typesetting industry that looks like readable text. With an even distribution of letters, Lorem ipsum is used to demonstrate what the layout of a document will look like without meaningful content. And this is for a reason.",
		script: "",
		parameters: {
			"--target": {
				label: "Destination IP:",
				default: "192.168.0.101",
			}
		}
	}, {
		label: "XMAS scan by nmap",
		description: "Scan all open UDP ports of a given IP target",
		script: "",
		parameters: {
			"--target": {
				label: "Destination IP:",
				default: "192.168.0.101",
			}
		}
	}, {
		label: "Ping of death attack detection"
	}, {
		label: "FTP bounce scan"
	},
	{ label: "separator" },
	{
		label: "TCP Maimon scan"
	}, {
		label: "TCP ACK/Window scan"
	}, {
		label: "TCP FIN scan"
	}, {
		label: "TCP INIT scan"
	}, {
		label: "TCP SYN/CONNECT scan"
	}, {
		label: "TCP NULL scan"
	}, {
		label: "TCP NULL scan"
	}, {
		label: "TCP NULL scan"
	},
	{ label: "separator" },
	{
		label: "Send IP packets containing unauthorised port number",
		description: "Attempted to create, then send an IP packet that has 2195 as source and destionation port numbers by default",
		script: "14.unauthorised-port-number.py",
		parameters: {
			"--ipDest": {
				label: "Target IP",
				description: "IP of the machine to be attacked",
				type: "IPv4",
				default: "10.0.3.4"
			},
			"--ipSrc": {
				label: "Source IP",
				description: "IP of the sender",
				type: "IPV4",
				default: "192.168.0.10"
			},
			"--portDest": {
				label: "Target Port",
				description: "Target port number",
				type: "number",
				default: 2195
			},
			"--portSrc": {
				label: "Source Port",
				description: "Source port number",
				type: "number",
				default: 2139
			}
		}
	},
];


//create reports
var ReportFactory = {

	createFormScripts: function() {
		setToolbarButtons();
		const markdown2HTML = new showdown.Converter();
		
		var form_config = {
			type: "<div>",
			attr: {
				class: "col-md-10 col-md-offset-1 form-horizontal",
				style: "margin-top: 20px",
			},
			children: [{
				type: "<select>",
				label: "Select an attack to be executed",
				attr: {
					id: "script-list",
					class: "form-control",
					style: "height: 34px"
				},
				children: scriptLst.map((el, i) => {
					return {
						type: "<option>",
						attr: {
							value: i,
							text: el.label === "separator" ? "-" : el.label,
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
		//id of input element
		const PARAM_INPUT_ID_PREFIX = "script-param-";

		$("#script-list").change(function(event) {
			//prevent appearing resetGrid button
			event.stopImmediatePropagation();
			const selValue = $(this).val();
			const detailForm = [];
			const script = scriptLst[selValue];

			if (script.label === "separator")
				$("#script-run-button").disable();
			else
				$("#script-run-button").enable();
			//clear the previous run's' status
			$("#toolbar-run-status").html('');
			
			if (script.description)
				detailForm.push({
					type: "<div>",
					label: "Description",
					attr: {
						class: "text-justify",
						style: "padding-left: 20px;padding-right: 20px",
						html: markdown2HTML.makeHtml( script.description )
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
			
			if (script.parameters) {
				//form of elements in parameters of the selected script
				const paramForm = [];
				for (var i in script.parameters) {
					if (i.indexOf('=') != -1) {
						MMTDrop.alert.warning(`Ignore parameter <code>${i}</code>.<br/>
						Parameters must not contain <code>=</code> character.`);
						continue;
					}
					const e = script.parameters[i];
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
										"data-content": markdown2HTML.makeHtml(e.description),
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
			}
			//whether having any elements to render
			$("#script-detail").html(MMTDrop.tools.createForm({
				type: "<div>",
				children: detailForm
			}));
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
			$('.param-input').each( function(i, el){
				el = $(el);
				const v = el.val();
				values[ el.data("param-name")] = v;
			});
			return values;
		}
		
		function setEnableParameterInput(isEnable) {
			$('#script-list').setEnable(isEnable);
			$('.param-input').setEnable(isEnable);
		}

		function setTerminateExecutionStatus(isSuccess) {
			$("#script-run-button").enable();
			$("#script-stop-button").disable();
			//enable editing parameters
			setEnableParameterInput(true);
			if (isSuccess) {
				$("#toolbar-run-status").html('<span aria-hidden="true" style="color:green" class="glyphicon glyphicon-ok"></span>');
			} else {
				$("#toolbar-run-status").html('<span aria-hidden="true" style="color:red" class="glyphicon glyphicon-remove"></span>');
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
			MMTDrop.tools.ajax("/auto/attack/script/status/" + filename, {}, "GET", {
				error: function( data ){
					setTerminateExecutionStatus(false);
					output( "Cannot get status" );
				},
				success: function( data ){
					output( data.stdout )
					output( data.stderr, true );
					if( data.isRunning )
						//continue to retrive execution logs 
						setTimeout( retriveExecutionLog, 1000, filename );
					else {
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
		//when click on run button
		if (window._outputTimer)
			clearInterval(window._outputTimer);

		$("#script-run-button").click(function() {
			$("#toolbar-run-status").html('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
			$("#script-run-button").disable();
			$("#script-stop-button").enable();
			//disable editing parameters
			setEnableParameterInput(false);

			const paramValues = getParameterValues();
			const script = scriptLst[ parseInt($("#script-list").val()) ];
			
			//start new output section
			output(`<u><b>Start executing  <code>${script.label}</code></b></u>`);
			output(`Parameters: ${JSON.stringify(paramValues)}`);

			MMTDrop.tools.ajax("/auto/attack/script/start/" + script.script, paramValues, "POST", {
				error: function() {
					const msg = `Cannot executed the script <code>${script.label}</code>`;
					MMTDrop.alert.error(msg);
					setTerminateExecutionStatus(false);
					output( msg, true );
				},
				success: function() {
					//MMTDrop.alert.success("Successfully add the Probe", 3 * 1000);
					//star timer to get execution log
					setTimeout( retriveExecutionLog, 1000, script.script );
				}
			});
		});

		$("#script-stop-button").click(function() {
			setTerminateExecutionStatus(false);
			const script = scriptLst[ parseInt($("#script-list").val()) ];
			
			MMTDrop.tools.ajax("/auto/attack/script/stop/" + script.script, {} , "POST", {
				error: function() {
					const msg = `Cannot stop the script <code>${script.label}</code>`;
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
