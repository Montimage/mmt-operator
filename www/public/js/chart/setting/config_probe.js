var arr = [{
      id: "system",
      title: "Configure a Probe",
      x: 0,
      y: 0,
      width: 12,
      height: 8,
      type: "info",
      userData: {
         fn: "createFormReport"
      },
   }
   ];

var availableReports = {
}

const DOM = {
      createSelect: function( label, name, required, labelArr, valueArr, description ){
         var ret = [];

         for( var i = 0; i<valueArr.length; i++ ){
            var opt = {
                  type : "<option>",
                  attr : {
                     value: valueArr[i],
                     html : labelArr[i]
                  } 
            };
            ret.push( opt );
         }

         obj = {
               type  : "<select>",
               label : label,
               attr : {
                  id          : name,
                  name        : name,
                  class       : "form-control",
                  required    : required,
               },
               children : ret
         };
         
         if( description !== undefined )
            obj.attr.title = description

         return obj;
      },
      createInput: function( label, name, required, data_type, defaultValue, description ){
         var obj = {
               type : "<input>",
               label: label,
               attr : {
                  id       : name,
                  name     : name,
                  class    : "form-control",
                  required : required,
               }
         };
         
         if( defaultValue !== undefined )
            obj.attr.value = defaultValue;
         
         if( data_type !== undefined )
            obj[ data_type ] = true;
         
         if( description !== undefined )
            obj.attr.title = description
         return obj
      },

      createCheck: function( label, id, defaultValue, description){
         if( this._checkBoxCount == undefined )
            this._checkBoxCount = 0;
         //unique id of this check box
         const newId = id + "-" + (++ this._checkBoxCount);
         
         const obj = {
            type : "<div>",
            label: label,
            attr : {
               class   : "onoffswitch",
            },
            children : [{
               type    : "<input>",
               attr    : {
                  id        : newId,
                  name      : newId,
                  "data-id" : id,
                  class     : "onoffswitch-checkbox",
                  type      : "checkbox",
               }
            },{
               type    : "<label>",
               attr    : {
                  class   : "onoffswitch-label",
                  for     : newId,
               },
               children  : [{
                  type  : "<span>",
                  attr  : {
                     class : "onoffswitch-inner"
                  }
               },{
                  type  : "<span>",
                  attr  : {
                     class : "onoffswitch-switch"
                  }
               }]
            }]
         };
         if( defaultValue )
            obj.children[0].attr.checked = true;
         
         if( description !== undefined )
            obj.attr.title = description;
         return obj;
      },
      
      createBlock: function( label, id, otherChildren ){
         const obj = {
               type : "<div>",
               attr: {
                  id   : id,
                  class: "col-md-12",
                  style: "border: solid thin #ccc; border-radius: 10px; margin-bottom: 15px; width: 100%",
               },
               children: [{
                  type: "<div>",
                  attr: {
                     class:  "col-md-12",
                     html : '<span style="text-transform: uppercase">' + label + '</span>'
                  },
                  children: [{
                     type: "<div>",
                     attr: {

                     },
                     children: otherChildren
                  }]
               }]
         };
         
         
         if( !this._bgColor )
            obj.attr.style += "; background-color: #efefef";
         
         this._bgColor = !!!(this._bgColor);
         
         
         return obj;
      }

}

// create reports
var ReportFactory = {

      createFormReport: function( fPeriod ){
         fPeriod.hide();
         fProbe.hide();
         fAutoReload.hide();

         const form_content_config = [
            DOM.createInput("Probe ID",          "probe-id",          true, "number", 1, 
                  "the unique identifier given to the probe"),
            DOM.createSelect("Input mode",       "input-mode",        true, ["Offline", "Online"], ["offline", "online"] ),
            DOM.createInput("License file path", "license_file_path", true, "file", "/opt/mmt/probe/bin/license.key"),
            DOM.createInput("Log file",          "logfile",           true, "file", "/opt/mmt/probe/log/offline/log.data", "indicates the file name where the log messages will be written to"),
            DOM.createInput("Input source",      "input-source",      true, "file", "", "input source for PCAP online mode (interface name) and for offline mode (pcap name), however for DPDK its interface port number" ),
            DOM.createInput("Thread nb",         "thread-nb",         true, "number", 1, "this is the number of threads MMT will use for processing packets. Must be positive" ),
            DOM.createInput("Thread queue",      "thread-queue",      true, "number", 3000, 
                  "this is the maximum number of packets queued for processing that a single thread accepts (only for PCAP)."
                  +"\n 0 means MMT decides how many packets to queue (default =1000)"
                  +"\n If a packet is dispatched for a thread with a full queue the packet will be dropped and reported in MMT statistics" ),
            DOM.createInput("Thread data",       "thread-data",       true, "number", 0, 
                  "this is the maximum amount of data queued for processing that a single thread accepts (only for PCAP)." 
                  + "\n 0 means unlimited (will always be limited by the system memory)"
                  + "\n If a packet is dispatched for a thread with full data the packet will be dropped and reported in MMT statistics" ),
            DOM.createInput("Snap len",          "snap-len",          true, "number", 0, "0 means default value 65535, apparently what tcpdump uses for -s 0 (only for PCAP)"),
            
            DOM.createInput("Cache size for reporting",       "cache-size-for-reporting", true, "number", 30000,
                  "a value of 0 means that MMT will decide how many packets to cache ( default = 300000)"),
            DOM.createCheck("Stats of non-session protocols", "enable-proto-without-session-stat", 0, 
                  "Enable/disable statistic of no session protocols"),
            DOM.createCheck("Fragmentation IP",               "enable-IP-fragementation-report",   0, 
                  "Enable/disable IP fragementation"),
            DOM.createInput("Statistic period (s)",     "stats-period",             true, "number", 5, 
                  "indicates the periodicity for reports"),
            DOM.createInput("File output period (s)",   "file-output-period",       true, "number", 5, 
                  "indicates the periodicity for reporting output file" ),
            DOM.createInput("#Report per message",      "num-of-report-per-msg",    true, "number", 1, 
                  "indicates the number of report per message. This option is only available for MMT-Security using sockets." ),
            
            DOM.createBlock("File output", "file-output", [
               DOM.createCheck("Enable",         "enable",   1, "Enable/disable"),
               DOM.createInput("Data file",      "data-file",   true, "file",   "dataoutput.csv" ),
               DOM.createInput("Location",       "location",    true, "folder", "/opt/mmt/probe/result/report/offline/"),
               DOM.createInput("Retain files",   "retain-file", true, "number", 10 ),
               DOM.createSelect("Sampled report", "sampled_report", true, ["Yes", "No"], [1, 0] ),
            ]),
            DOM.createBlock("Redis output", "redis-output", [
               DOM.createCheck("Enable",     "enable",   0, "Enable/disable"),
               DOM.createInput("Host name", "redis-host",  true, "hostname", "localhost" ),
               DOM.createInput("Port",      "redis-port",  true, "number", 6379 ),
            ]),
            DOM.createBlock("Kafka output", "kafka-output", [
               DOM.createCheck("Enable",    "enable",   0, "Enable/disable"),
               DOM.createInput("Host name", "kafka-host",  true, "hostname", "localhost" ),
               DOM.createInput("Port",      "kafka-port",  true, "number", 9092 ),
            ]),
            DOM.createBlock("Security report", "security-report", [
               DOM.createCheck("Enable",         "enable",   0, "Enable/disable"),
               DOM.createInput("Thread nb",      "thread-nb",    true, "number", 1, "the number of security threads per one probe thread , e .g . , if we have 16 probe threads and thread - nb = x ,"
                                 + "then x *16 security threads will be used."
                                 + "\nIf set to zero this means that the security analysis will be done in the same threads used by the probe ."),
               DOM.createInput("Exclude rules",  "exclude-rule", false, "range", "", "Range of rules to be excluded from the verification" ),
               DOM.createInput("Rules mask",     "rule-mask",    false, "range", "",  "Mapping of rules to the security threads:"
                 + "\n  Format: rules-mask = (thread-index:rule-range);"
                 + "\n     thread-index = a number greater than 0"
                 + "\n      rule-range = number greater than 0, or a range of numbers greater than 0."
                 + '\n  Example : If we have thread-nb = 3 and "(1:1 ,2 ,4 -6)(2:3)". This means that :'
                 + "\n    thread 1 verifies rules 1 ,2 ,4 ,5 ,6;"
                 + "\n    thread 2 verifies only rule 3; and"
                 + "\n    thread 3 verifies the rest"),
               DOM.createSelect("Output channel","security-output-channel", true, ["File", "Redis", "Kafak"], ["file", "redis", "kafak"] ),
            ]),
            DOM.createBlock("CPU Memory report", "cpu-mem-report", [
               DOM.createCheck("Enable",         "enable",   0, "Enable/disable"),
               DOM.createInput("Frequency (s)",  "frequency",    true, "number", 5, "time interval in second for reporting"),
               DOM.createSelect("Output channel","cpu-mem-usage-output-channel", true, ["File", "Redis", "Kafak"], ["file", "redis", "kafak"] ),
            ]),
            DOM.createBlock("Radius report", "radius-report", [
               DOM.createCheck("Enable",            "enable",   0, "Enable/disable"),
               DOM.createSelect("Include message",  "readius-include-msg",   true, ["Report all messages", "??", "??"], [0, 1, 2] ),
               DOM.createSelect("Include condition","readius-include-cond",  true, ["No", "Yes iff the IP to MSISDN mapping is present"], [0, 1] ),
               DOM.createSelect("Output channel",   "radius-output-channel", true, ["File", "Redis", "Kafak"], ["file", "redis", "kafak"] ),
            ]),
            
            DOM.createBlock("Micro flows report", "micro-flows", [
               DOM.createCheck("Enable",                   "enable",   0, "Enable/disable"),
               DOM.createInput("Include packet count",     "include-packet-count",   true, "number", 20, "packets count threshold to consider a flow as a micro flow"),
               DOM.createInput("Include byte count (KB)",   "include-byte-count",    true, "number", 20, "data volume threshold in KB to consider a flow as a micro flow"),
               DOM.createInput("Report packet count",       "report-packet-count",   true, "number", 10, "packets count threshold to report micro flows aggregated statistics"),
               DOM.createInput("Report byte count (KB)",    "report-byte-count",     true, "number", 10, "data volume threshold in KB to report micro flows aggregated statistics"),
               DOM.createInput("Report flow count",         "report-flow-count",     true, "number", 5,  "flows count threshold to report micro flows aggregated statistics"),
               DOM.createSelect("Output channel",           "radius-output-channel", true, ["File", "Redis", "Kafak"], ["file", "redis", "kafak"] ),
            ]),
            
            DOM.createBlock("Reconstruct FTP", "reconstruct-ftp", [
               DOM.createCheck("Enable",           "enable",   0, "Enable/disable"),
               DOM.createInput("Location",         "location",      true, "folder", "/opt/mmt", "indicates the folder where the output file is created"),
               //DOM.createSelect("Output channel",  "output-channel", true, ["File", "Redis", "Kafak"], ["file", "redis", "kafak"] ),
            ]),
            
            DOM.createBlock("Reconstruct HTTP", "reconstruct_http", [
               DOM.createCheck("Enable",           "enable",   0, "Enable/disable"),
               DOM.createInput("Location",         "location",      true, "folder", "/opt/mmt", "indicates the folder where the output file is created"),
            ]),
            
            DOM.createBlock("Behaviour", "behaviour", [
               DOM.createCheck("Enable",   "enable",    0, "Enable/disable"),
               DOM.createInput("Location", "location",  true, "folder", "/opt/mmt/probe/result/behaviour/offline/", "Folder to write the output"),
            ]),
            
            DOM.createBlock("Event report", "event_report", [
               DOM.createCheck("Enable",     "enable",    0, "Enable/disable"),
               DOM.createInput("Event",      "event",     true, "protoAttribute", "ip.src", "indicates the event"),
               DOM.createInput("Attributes", "event",     true, "protoAttributeList", '{"arp.ar_hln", "ip.src"}', "Indicates the list of attributes that are reported when a event is triggered"),
               DOM.createSelect("Output channel", "output-channel", true, ["File", "Redis", "Kafak"], ["file", "redis", "kafak"] ),
            ]),
            
            DOM.createBlock("Session report", "report_session", [
               DOM.createCheck("Enable",     "enable",    0, "Enable/disable"),
               DOM.createCheck("HTTP",    "web-enable",    1, "Enable/disable"),
               DOM.createCheck("FTP",     "ftp-enable",    0, "Enable/disable"),
               DOM.createCheck("RTP",     "rtp-enable",    0, "Enable/disable"),
               DOM.createCheck("SSL",     "ssl-enable",    0, "Enable/disable"),
               DOM.createSelect("Output channel", "output-channel", true, ["File", "Redis", "Kafak"], ["file", "redis", "kafak"] ),
            ]),
            
            DOM.createBlock("Session timeout", "sesstion-timeout", [
               DOM.createInput("Default session timeout (s)", "default-session-timeout", true, "number", 40, "0 means default value = 60 seconds"),
               DOM.createInput("Long session timeout (s)",    "long-session-timeout",    true, "number",  0, "0 means default value = 600 seconds. This is reasonable for Web and SSL connections especially when long polling is used . Usually applications have a long polling period of about 3~5 minutes "),
               DOM.createInput("Short session timeout (s)",   "short-session-timeout",   true, "number",  0, "0 means default value = 15 seconds"),
               DOM.createInput("Live session timeout (s)",    "live-session-timeout",    true, "number",  0, "0 means default value = 1500 seconds. For persistent connections like messaging applications and so on "),
            ]),

            DOM.createBlock("Data output", "data-output", [
               DOM.createInput("Include user agent (KB)", "include-user-agent", true, "number", 32, 
                  "Indicates the threshold in terms of data volume for parsing the user agent in Web traffic."
                  + "\nThe value is in kiloBytes ( KB ) . If the value is zero , this indicates that the parsing of the user agent should be done ."
                  + "\nTo disable the user agent parsing, set the threshold to a negative value (-1)."),
            ]),
         ];

         const form_config = {
               type : "<form>",
               attr : {
                  class : "form-horizontal",
                  style : "position: absolute; top: 30px; bottom: 15px; left: 15px; right: 15px",
                  id    : "ssh-form"
               },
               children: [
                  {
                     type  : "<div>",
                     attr  : {
                        style : "position: absolute; bottom: 50px; top: 0px; left: 0px; right: 0px; overflow: auto",
                     },
                     children : form_content_config
                  },
                  {
                     type : "<div>",
                     attr : {
                        style : "position: absolute; bottom: 0px; left: 0px; right: 0px; overflow: auto",
                     },
                     children : [
                        {
                           type: "<input>",
                           attr: {
                              type    : "submit",
                              class   : "btn btn-danger pull-right",
                              style   : "width: 100px;",
                              value   : "Save",
                              id      : "saveBtn",
                           }
                        },
                        {
                           type: "<input>",
                           attr: {
                              type    : "button",
                              class   : "btn btn-success pull-right",
                              style   : "width: 100px; margin-right: 50px",
                              value   : "Reset",
                              id      : "resetBtn",
                           }
                        },
                        {
                           type: "<input>",
                           attr: {
                              type    : "reset",
                              class   : "btn btn-primary pull-right",
                              style   : "width: 100px; margin-right: 50px",
                              value   : "Default",
                              id      : "defaultBtn",
                           }
                        },
                        {
                           type: "<a>",
                           attr: {
                              href    : "/chart/setting",
                              class   : "btn btn-warning pull-right",
                              style   : "width: 100px; margin-right: 50px",
                              text    : "Cancel",
                              id      : "cancelBtn",
                           }
                        }
                        ]
                  }
                  ]
         }


         $("#system-content" ).html( MMTDrop.tools.createForm( form_config, true ) ) ;

         // when user submit form
         $("#ssh-form").validate({
            errorClass  : "text-danger",
            errorElement: "span",
            rules: {
               "ssh-address" : {ipv4: true},
               "ssh-port"    : {number: true},
               "ssh-username": {
                  required: {
                     depends: function( el ){
                        return $("#ssh-address").val() != "localhost";
                     }
                  }
               },
               "ssh-key": {
                  required: {
                     depends: function( el ){
                        return $("#ssh-address").val() != "localhost";
                     }
                  }
               }
            },
            // when the form was valided
            submitHandler : function( form ){
               var data = {
                     probe_id : $("#probe-id").val(),
                     address  : $("#ssh-address").val(),
                     port     : $("#ssh-port").val(),
                     username : $("#ssh-username").val(),
                     password : $("#ssh-key").val(),
               };

               MMTDrop.tools.ajax("/info/probe/add", data, "POST", {
                  error  : function(){
                     MMTDrop.alert.error("Cannot add new Probe", 5*1000);
                  },
                  success: function(){
                     MMTDrop.alert.success("Successfully add the Probe", 3*1000);
                     setTimeout( function(){
                        MMTDrop.tools.gotoURL( "/chart/" + page.id );
                     }, 5000 )
                  }
               })
               return false;
            }
         });
      },// end createBackupFormReport
}



// show hierarchy URL parameters on toolbar
$( function(){
   breadcrumbs.setData( [
      'Configure a Probe'
      ] );
});
