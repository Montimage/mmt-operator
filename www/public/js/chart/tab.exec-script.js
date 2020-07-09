var arr = [
   {
      id: "list-script",
      title: "Execution Scripts",
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

function setToolbarButtons(){
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

function randomText(){
   var words =["The sky", "above", "the port","was", "the color of television", "tuned", "to", "a dead channel", ".", "All", "this happened", "more or less","." ,"I", "had", "the story", "bit by bit", "from various people", "and", "as generally", "happens", "in such cases", "each time", "it", "was", "a different story","." ,"It", "was", "a pleasure", "to", "burn"];
   var text = [];
   //random between 10 20+10
   var x = Math.floor(Math.random() * 20) + 10;
   while(--x) 
      text.push(words[Math.floor(Math.random() * words.length)]);
   return text.join(" ");
}

const scriptLst = [
   /* separator */
{ label: "separator" },
{
   label: "Several attempts to connect via SSH",
   description: "Several attempts to connect via ssh (brute force attack).\
      <u>Source address</u> is either infected machine or attacker (no spoofing is possible).<br/>\
      <code>Pre-requires</code>: ssh_brute.py, pxssh.py, dict.txt (containing the passwords to be tested)<br/>\
      <code>Pre-condition</code>: dummy\
      ",
   script: "",
   parameters: {
      "target-ip" : {
         label: "Destination IP",
         description: "Attack target IP",
         default: "192.168.0.101",
      },
      "target-port": {
         label: "Destination Port",
         default: "2222"
      },
      "source-ip" : {
         label: "Source IP",
         default: "192.168.0.1"
      },
      "output-nic" : {
         label: "Output NIC",
         default: "eth0"
      },
      "timeout": {
         label: "Timeout (seconds)",
         default: 60
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
      "--target" : {
         label: "Destination IP:",
         default: "192.168.0.101",
      }
   }
},{
   label: "XMAS scan by nmap",
   description: "Scan all open UDP ports of a given IP target",
   script: "",
   parameters: {
      "--target" : {
         label: "Destination IP:",
         default: "192.168.0.101",
      }
   }
},{
   label: "Ping of death attack detection"
},{
   label: "FTP bounce scan"
},
{label: "separator"},
{
   label: "TCP Maimon scan"
},{
   label: "TCP ACK/Window scan"
},{
   label: "TCP FIN scan"
},{
   label: "TCP INIT scan"
},{
   label: "TCP SYN/CONNECT scan"
},{
   label: "TCP NULL scan"
},{
   label: "TCP NULL scan"
},{
   label: "TCP NULL scan"
},
{label: "separator"},
{
   label: "Detect Tor nodes"
}
];


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
            label: "Select an attack to be executed",
            attr: {
               id: "script-list",
               class: "form-control",
               style: "height: 34px",
               onchange: "loadDetailScript(this, event)"
            },
            children: scriptLst.map( (el, i) => {
               return {
                  type: "<option>",
                  attr: {
                     value: i,
                     text: el.label==="separator"?"-":el.label,
                  }
               }
            })
         },{
            type: "<div>",
            attr: {
               id: "script-detail",
               class: ""
            }
         }]
      };
      contentEl.script().html(MMTDrop.tools.createForm(form_config));

      window.loadDetailScript = function (sel, event){
         //prevent appearing resetGrid button
         event.stopImmediatePropagation();
         const selValue = sel.value;
         const detailForm = [];
         const script = scriptLst[selValue];

         if( script.label === "separator" )
            $("#script-run-button").disable();
         else
            $("#script-run-button").enable();

         if( script.description )
            detailForm.push({
               type : "<div>",
               label: "Description",
               attr : {
                  class: "text-justify",
                  style: "padding-left: 20px;padding-right: 20px",
                  html : script.description
               } 
            })
         if( script.parameters ){
            //form of elements in parameters of the selected script
            const paramForm = [];
            for( var i in script.parameters) {
               const e = script.parameters[i];
               
               paramForm.push({
                  type : "<div>",
                  attr : {
                     class: "form-group has-success has-feedback"
                  },
                  children: [{
                     type  : "<div>",
                     attr  : {
                        class : "input-group",
                     },
                     children: [{
                        type : "<span>",
                        attr : {
                           class: "input-group-addon",
                           html : e.label,
                        }
                     },{
                        type : "<input>",
                        attr : {
                           class : "form-control",
                           id    : "script-param-" + i,
                           value : e.default !== undefined? e.default:"",
                        }
                     },{
                        type: "<span>",
                        attr:{
                           class: "input-group-addon glyphicon glyphicon-info-sign",
                           "data-toggle":"tooltip",
                           title: e.description
                        }
                     }]
                  }]
               });
            };
            detailForm.push({
               type : "<form>",
               label: "Parameters",
               attr : {
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
         $("#script-detail").html( MMTDrop.tools.createForm({
            type: "<div>",
            children: detailForm
         }));
         //enable tooltip
         $('[data-toggle="tooltip"]').tooltip();
      }
      
      function output( txt ){
         contentEl.output().append($("<p>").html('<b>' + MMTDrop.tools.formatDateTime(new Date(), true) + '</b> ' + txt ));
         //scroll to bottom
         contentEl.output().animate({ scrollTop: 9999999}, 500);
      }
      
      //when click on run button
      if( window._outputTimer )
         clearInterval( window._outputTimer );
         
      $("#script-run-button").click( function(){
         $("#script-run-button").disable();
         $("#script-stop-button").enable();
         //clear output
         contentEl.output().text("");
         
         var timerCounter = 10;
         window._outputTimer = setInterval(function(){
            timerCounter --;
            if( timerCounter <= 0 ){
               clearInterval( window._outputTimer );
               $("#script-run-button").disable();
               $("#script-stop-button").disable();
               output("successfully terminated");
            } 
            else 
               output( randomText() );

         }, 1000);
      });
      
      $("#script-stop-button").click( function(){
         $("#script-run-button").enable();
         $("#script-stop-button").disable();
         
         clearInterval( window._outputTimer );
         output( "interrupted" );
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
