var arr = [
	{
		id: "upload-pcap",
		title: "Upload Pcap File",
		x: 0,
		y: 0,
		width: 12,
		height: 6,
		type: "success",
		userData: {
			fn: "createReport"
		}
	}
];


var availableReports = {}
var ReportFactory = {};

ReportFactory.createReport = function() {
	fPeriod.hide();
	fProbe.hide();
	fAutoReload.hide();
	var form = {
		type: "<form>",
		attr: {
			class: "col-md-8 col-md-offset-2 form-horizontal",
			style: "margin-top: 60px",
			id: "upload-form"
		},
		children: [
			{
				type: "<input>",
				label: "Pcap file",
				attr: {
					id: "pcap-file-input",
					type: "file",
					required: true,
					accept: ".pcap,.cap,.pcapng"
				}
			}, {
				type: "<div>",
				attr: {
					class: "row"
				},
				children: [{
					type: "<pre>",
					attr: {
						class: "col-md-10",
						id: "status",
						style: "height: 100px; visibility: hidden"
					}
				}, {
					type: "<div>",
					attr: {
						class: "col-md-2"
					},
					children: [{
						type: "<input>",
						attr: {
							type: "submit",
							class: "btn btn-primary",
							style: "width: 100px",
							value: "Upload",
							id: "submit-button"
						}
					}]
				}]
			}
		]
	};
	$("#upload-pcap-content").html(MMTDrop.tools.createForm(form));
	$("#upload-form").validate({
		errorClass: "text-danger",
		errorElement: "span",
		//upload file to server
		submitHandler: function() {
			$("#status").show();
			$("#submit-button").disable();

			try{
				let pcap = document.getElementById("pcap-file-input").files[0];  // file from input
				let formData = new FormData();
				formData.append("pcap-file", pcap);
				fetch('/auto/pcap/upload/new', {method: "POST", body: formData})
					.then( () => setTimeout( checkStatus, 1000))
					.catch(() => {
						MMTDrop.alert.error("An internal error occurs when uploading pcap file.<br/>Please contact Admin");
					});
			}catch(e){
				console.log(e);
			}
			return false;
		}
	})
	
	function checkStatus(){
		//get upload status
		MMTDrop.tools.ajax('/auto/pcap/upload/status', {}, "GET", {
			success: function(data){
				console.log( data );

				if( data.stdout )
					$("#status").text( data.stdout );

				//next round
				if( data.isRunning )
					setTimeout( checkStatus, 1000 );
				else if( data.exitCode == 0 ){
					setTimeout( function(){
						alert('Successfully analyzed pcap file. Goto link tab now');
						MMTDrop.tools.gotoURL( "/chart/link" );
					}, 5000);
				} else
					MMTDrop.alert.error("An internal error occurs when analyzing pcap file.<br/>Please contact Admin"); 
			}
		});
	}
}
