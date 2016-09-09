var arr = [
    {
        id: "system",
        title: "System Usage",
        x: 0,
        y: 0,
        width: 6,
        height: 3,
        type: "info",
        userData: {
            fn: "createSystemInformationReport"
        },
    },{
        id: "config",
        title: "Configuration",
        x: 6,
        y: 0,
        width: 6,
        height: 4,
        type: "success",
        userData: {
            fn: "createConfigReport"
        },
    },{
        id: "probe",
        title: "MMT-Probes",
        x: 0,
        y: 5,
        width: 6,
        height: 5,
        type: "warning",
        userData: {
            fn: "createProbesReport"
        },
    },{
        id: "database",
        title: "Database",
        x: 6,
        y: 5,
        width: 6,
        height: 4,
        type: "danger",
        userData: {
            fn: "createDatabaseInformationReport"
        },
    }
];

var availableReports = {
}

var REFRESH_INFO_INTERVAL = 5000; //5seconds

//create reports
var ReportFactory = {
	createSystemInformationReport: function( fPeriod ){
    fPeriod.hide();
    fProbe.hide();
    fAutoReload.hide();
    var form_config = {
      type : "<div>",
      attr : {
        style : "margin: 20px 10px 10px 0px"
      },
      children: [{
        type : "<form>",
        attr : {
          class        : "form-horizontal",
        },
        children : [{
          type  : "<div>",
          attr  : {
            class : "col-sm-12 text-right",
            id    : "sys-timestamp",
            text  : "waiting"
          }
        },{
          label : "CPU",
          type  : "<div>",
          attr  : {
            class : "progress",
          },
          children : [
            {
              type : "<div>",
              attr :{
                class : "progress-bar",
                role  : "progressbar",
                style : "width: 0%",
                id    : "sys-cpu-bar"
              }
            },
          ]
        },{
          label : "Memory",
          type  : "<div>",
          attr  : {
            class : "progress",
          },
          children : [
            {
              type : "<div>",
              attr :{
                class : "progress-bar",
                role  : "progressbar",
                style : "width: 0%",
                id    : "sys-memory-bar"
              }
            }
          ]
        },{
          label : "Hard Driver",
          type  : "<div>",
          attr  : {
            class : "progress",
          },
          children : [
            {
              type : "<div>",
              attr :{
                class : "progress-bar",
                role  : "progressbar",
                style : "width: 0%",
                id    : "sys-disk-bar"
              }
            }
          ]
        }]
      }]
    };

    $("#system-content" ).append( MMTDrop.tools.createForm( form_config ) ) ;
    var load_data = function(){
      MMTDrop.tools.ajax("/info/os", null, "GET", {
        error  : function(){
          MMTDrop.alert.error("Cannot connect to server", 5*1000);
        },
        success: function( data ){
          var set_value = function( elem, val, text ){
            if( val < 1 ) val = 1;
            var type = "success";
            if( val <= 50 )
              type = "success";
            else if (val <= 70)
              type = "warning";
            else
              type = "danger";
            if( text == undefined )
              text = val + "%";
            else
              text = val + "% ("+ text +")"
            $(elem).attr("class", "progress-bar progress-bar-"+ type).width( val + "%" ).text( text );
          }
          var obj = data.data, text;
          if( window._lastUsageCPU == undefined )
            window._lastUsageCPU = {
              used: 0,
              total: 0
            };

          set_value("#sys-cpu-bar",    Math.round((obj.cpu.used - window._lastUsageCPU.used)/(obj.cpu.total-window._lastUsageCPU.total)*100) );
          window._lastUsageCPU.used  = obj.cpu.used;
          window._lastUsageCPU.total = obj.cpu.total;

          text = (obj.memory.used/1000/1000/1000).toFixed(2) + " / " +
                 (obj.memory.total/1000/1000/1000).toFixed(2)  + " GB";
          set_value("#sys-memory-bar", Math.round(obj.memory.used/obj.memory.total*100), text );
          text = (obj.hardDrive.used/1000/1000).toFixed(2) + " / " +
                 (obj.hardDrive.total/1000/1000).toFixed(2)  + " GB";
          set_value("#sys-disk-bar",   Math.round(obj.hardDrive.used/obj.hardDrive.total*100), text );

          $("#sys-timestamp").text( MMTDrop.tools.formatDateTime( obj.timestamp ) );
        }
      })
    }

    setTimeout( load_data, 1000);
    //auto update each 5seconds
    setInterval( load_data, REFRESH_INFO_INTERVAL);
	},

  createDatabaseInformationReport: function(){
    fPeriod.hide();
    fProbe.hide();
    fAutoReload.hide();
    var form_config = {
      type : "<div>",
      attr : {
        style : "margin: 40px 10px 10px 0px"
      },
      children: [{
        type : "<form>",
        attr : {
          class  : "form-horizontal",
          id     : "conf-db-form"
        },
        children : [{
          label : "Last backup",
          type  : "<p>",
          attr  : {
            class : "form-control-static",
            html  : '<span id="conf-db-last-backup"></span>'
          }
        },{
          label : "Auto backup",
          type  : "<select>",
          attr  : {
            onchange : "",
            id       : "conf-db-auto",
            disabled : true
          },
          children:[{
            type : "<option>",
            attr : {
              value : "none",
              text  : "None"
            }
          },{
            type : "<option>",
            attr : {
              value : "daily",
              text  : "Daily"
            }
          },{
            type : "<option>",
            attr : {
              value : "weekly",
              text  : "Weekly"
            }
          },{
            type : "<option>",
            attr : {
              value : "monthly",
              text  : "Monthly"
            }
          }]
        },{
          label : "FTP Server",
          type  : "<div>",
          attr  : {
            class: "row"
          },
          children : [{
            type : "<div>",
            attr : {
              class : "col-sm-5 checkbox"
            },
            children:[{
              type  : "<label>",
              attr  : {
                html  : '<input type="checkbox" id="conf-db-ftp-enable" title="Automatically upload backup file to FTP server"> upload file to FTP server'
              }
            }]
          },{
            type : "<div>",
            attr : {
              class : "col-sm-7"
            },
            children:[{
              type  : "<input>",
              attr  : {
                required    : true,
                class       : "form-control",
                type        : "text",
                placeholder : "ip address",
                id          : "conf-db-ftp-server"
              }
            }]
          }]
        },
        {
          label    : "",
          type     : "<div>",
          attr     : {
            class : "row"
          },
          children : [{
            type : "<div>",
            attr : {
              class : "col-sm-5"
            },
            children : [{
              type : "<input>",
              attr : {
                required    : true,
                class       : "form-control",
                placeholder : "ftp username",
                id          : "conf-db-ftp-username"
              }
            }]
          },{
            type : "<div>",
            attr : {
              class : "col-sm-5"
            },
            children : [{
              type : "<input>",
              attr : {
                required    : true,
                class       : "form-control",
                placeholder : "ftp password",
                type        : "password",
                //style+readonly are add to avoid browser load default username+password
                readonly    : true,
                style       : "background-color: white !important",
                onfocus     : "this.removeAttribute('readonly');this.removeAttribute('style');",
                id          : "conf-db-ftp-password",
              }
            }]
          },{
            type : "<div>",
            attr : {
              class: "col-sm-2 checkbox"
            },
            children :[{
              type : "<label>",
              attr : {
                html  : '<input type="checkbox" id="conf-db-ftp-secure" title="Secure FTP"> SFTP'
              },
            }]
          }]
        },
        //buttons
        {
          type  : "<div>",
          label : "",
          attr  : {
            class : ""
          },
          children : [{
            type: "<input>",
            attr: {
              type : "submit",
              id   : "conf-db-btnSave",
              class: "btn btn-primary",
              value: 'Save'
            }
          },{
            type: "<a>",
            attr: {
              "href" : "/chart/setting/restore_db",
              type : "button",
              id   : "conf-db-btnRestore",
              class: "btn btn-success pull-right",
              text : 'Restore'
            }
          },{
            //Backup Now button
            type : "<span>",
            attr: {
              style: "margin-right: 10px",
              class: "pull-right",
              id   : "parentBackupNowBtn"
            }
          },{
            type: "<input>",
            attr: {
              type : "button",
              id   : "conf-db-btnEmpty",
              style: "margin-right: 10px",
              class: "btn btn-danger pull-right",
              value: 'Empty DB'
            }
          }]
        }//end buttons
      ]
      }]
    };

    $("#database-content" ).append( MMTDrop.tools.createForm( form_config ) ) ;

    //style+readonly was add to avoid browser load default username+password
    setTimeout( function(){
      $("#conf-db-ftp-password").removeAttr("style").removeAttr("readonly");
    }, 500);


    //when click on Empty
    $("#conf-db-btnEmpty").on("click", function(){
      if( !confirm("Are you sure you want to empty the Database?\n\n\n") )
        return;

      MMTDrop.tools.ajax("/info/db?action=empty-db", {}, "POST", {
        error  : function(){
          MMTDrop.alert.error("Cannot empty the database", 10*1000);
        },
        success: function(){
          MMTDrop.alert.success("Successfully emptyed the database", 10*1000);
        }
      })
    });

    $("#conf-db-ftp-enable").change( function(){
      var is_on = $(this).is(":checked");
      $("#conf-db-ftp-server").setEnable( is_on );
      $("#conf-db-ftp-username").setEnable( is_on );
      $("#conf-db-ftp-password").setEnable( is_on );
      $("#conf-db-ftp-secure").setEnable( is_on );
    });
    $("#conf-db-ftp-enable").trigger("change");

    //when click on Save or submit form
    //when user submit form
    $("#conf-db-form").validate({
      errorClass  : "text-danger",
      errorElement: "span",
      rules:{
      },
      //when the form was valided
      submitHandler : function( form ){
        var data = {
          autobackup : $("#conf-db-auto").val(),
          ftp : {
            server   : $("#conf-db-ftp-server").val(),
            username : $("#conf-db-ftp-username").val(),
            password : $("#conf-db-ftp-password").val(),
            isSecure : $("#conf-db-ftp-secure").is(":checked"),
            isEnable : $("#conf-db-ftp-enable").is(":checked"),
          }
        }
        MMTDrop.tools.ajax("/info/db?action=save", {$set: data}, "POST", {
          error  : function(){
            MMTDrop.alert.error("Internal Error 201", 10*1000);
          },
          success: function(){
            MMTDrop.alert.success("Successfully saved information", 5*1000);
          }
        })
      }//end submitHandler
    });

    //load data from db
    window._loadData = function(){
      MMTDrop.tools.ajax("/info/db", null, "GET", {
        error  : function(){},
        success: function( data ){
          if( data.length > 0 ){
            data = data[0] || {};
            if( data.ftp ){
              $("#conf-db-auto").val(         data.autobackup );
              $("#conf-db-ftp-server").val(   data.ftp.server );
              $("#conf-db-ftp-username").val( data.ftp.username );
              $("#conf-db-ftp-password").val( data.ftp.password );
              $("#conf-db-ftp-secure").prop( "checked", data.ftp.isSecure );
              $("#conf-db-ftp-enable").prop( "checked", data.ftp.isEnable ).trigger("change");
            }

            if( data.lastBackup == undefined || data.lastBackup.name == undefined )
              $("#conf-db-download-backupBtn").hide();
            else
              $("#conf-db-download-backupBtn").show();

            //show last backup file
            var text = "none";
            if( data.lastBackup ){
              if( data.lastBackup.name != undefined )
                text = '<a title="Download the backup file" href="/db_backup/'+ data.lastBackup.name +'">'
                  + MMTDrop.tools.formatDateTime( new Date( data.lastBackup.time ))
                  + " ("+  MMTDrop.tools.formatDataVolume( data.lastBackup.size ) +"B)"
                  + ' <i class = "fa fa-cloud-download"/></a>';
              else if( data.lastBackup.error )
                text = MMTDrop.tools.formatDateTime( new Date( data.lastBackup.time )) + ' (<a onclick="alert(\'Error: '+ JSON.stringify(data.lastBackup.error).replace(/"/g, "") +'\')">error</a>)';
            }
            $("#conf-db-last-backup").html( text );

            //if database is being backedup or restored
            if( data.isBackingUp === true || data.isRestoring != undefined ){
              if( data.isBackingUp )
                $("#parentBackupNowBtn").html( '<span class="btn btn-default"><i class = "fa fa-refresh fa-spin fa-fw"/> Backing up ...</span>') ;
              else{
                $("#conf-db-btnRestore").replaceWith(  '<span disabled class="btn btn-default pull-right"><i class = "fa fa-refresh fa-spin fa-fw"/> Restoring ...</span>' );
                $("#parentBackupNowBtn").html(  '<span disabled class="btn btn-info"> Back up</span>' );
              }

              $("#conf-db-btnEmpty").disable();
              $("#conf-db-btnRestore").disable();

              //check whenether the backingup/restoring finished
              window._backupTimer = setInterval(window._loadData, 10000) ;
            }else{
              //database is being backed up
              if( window._backupTimer ){
                clearInterval( window._backupTimer );

                if( data.lastBackup == undefined )
                  MMTDrop.alert.error( "Error while backing up database: 101", 5*1000);
                else if( data.lastBackup.error ){
                  MMTDrop.alert.error( "Error while backing up database: " + JSON.stringify(data.lastBackup.error), 10*1000 );
                }else
                  MMTDrop.alert.success( "Successfully backed up database", 5*1000 );

                $("#conf-db-btnEmpty").enable();
                $("#conf-db-btnRestore").enable();
              }

              $("#parentBackupNowBtn").html(  $('<a class="btn btn-info" title="Backup Now" id="backupNowBtn">Backup now</a>') );


              //when click on "backup now"
              $("#backupNowBtn").on("click", function(){
                if( !confirm("Backup database now.\nAre you sure?\n\n") )
                  return;
                //change button ==> backing up
                $("#parentBackupNowBtn").html(  $('<span class="btn btn-default" disabled><i class = "fa fa-refresh fa-spin fa-fw"/> Backing up ...</span>') );
                $("#conf-db-btnEmpty").disable();
                $("#conf-db-btnRestore").disable();

                //check whenether the backingup finished
                window._backupTimer = setInterval(window._loadData, 10000) ;

                MMTDrop.tools.ajax("/info/db?action=save", {
                  "$set" : {isBackingUp: true}
                }, "POST", {
                  error  : function(){
                    MMTDrop.alert.error("Internal Error 201", 10*1000);
                  },
                  success: function(){
                    MMTDrop.alert.success("Starting to backup database", 3*1000);
                  }
                })
              });

            }//end else
          }
        }
      });
    }

    //load data
    window._loadData();
  },

  createProbesReport: function(){
    fPeriod.hide();
    fProbe.hide();
    fAutoReload.hide();

    var form_config = {
      type : "<div>",
      attr : {
        style : "margin: 20px 10px 0px 10px",
      },
      children: [{
        type : "<table>",
        attr : {
          id    : "listProbesTable",
          class : "table table-striped table-bordered table-condensed dataTable",
          style : "max-height: 240px; overflow: hidden",
        }
      },
      //buttons
      {
        type: "<a>",
        attr: {
          class  : "btn btn-warning pull-right",
          text   : 'Add new Probe',
          href   : "setting/add_probe"
          //disabled: true
        }
      }//end buttons
      ]
    }

    $("#probe-content" ).append( MMTDrop.tools.createForm( form_config ) ) ;


    //load list of probes from server, then show them in a table
    MMTDrop.tools.ajax("/info/probe", {}, "GET", {
      error  : function(){
        MMTDrop.alert.error("Cannot get list of Probes", 5*1000);
      },
      success: function( obj ){

        //create data array of Table
        var probeLst = obj.data;
        var arr = [];

        for( var i=0; i<probeLst.length; i++ ){
          var probe = probeLst[i];
          var p_id  = probe.probe_id;
          if( p_id == undefined ) p_id = "undefined";
          var same  = 'style="margin-left: 20px;" data-id="'+ p_id +'"'

          arr.push([
            p_id,
            MMTDrop.tools.formatDateTime( new Date(probe.timestamp)),
            probe.address,
            '<span id="update-'+ p_id +'"></span>',
            '<div class="center-block" style="text-align: center; text-decoration: none">'
            +
            '<a id="btn-action-'+ p_id +'" '+same+' class="btn-action fa fa-stop" title="Start/Stop"></a>'
            +
            '<a '+same+' class="btn-config fa fa-sliders" title="Configure" ></a>'
            +
            '<a '+same+' class="btn-delete fa fa-trash"" title="Install/Uninstall" ></a>'
            +
            '</div>',
          ]);
        }
        //create DataTable
        var table = $("#listProbesTable").dataTable({
          "scrollY"        : "300px",
          "scrollCollapse" : true,
          "paging"         : false,
          "searching"      : false,
          "info"           : false,
          order            : [0, "asc"],
          data             : arr,
          columns: [
            {title: "ID"},
            {title: "Created Time"},
            {title: "Host Address"},
            {title: "Last Reported"},
            {title: "Actions"},
          ]
        });

        //resize dataData when user resizes window/div
        var $widget = $("#probe-content").getWidgetParent();
        //resize when changing window size
        $widget.on("widget-resized", null, table, function (event, widget) {
          var h = $("#probe-content").getWidgetContentOfParent().height() - 115;
          $(".dataTables_scrollBody").css('max-height', h+"px").css('height', h+"px")
        });
        $widget.trigger("widget-resized", [$widget]);

        //when user click on Delete button
        $(".btn-delete").on("click", function(){
          var p_id = this.getAttribute("data-id");

          if( !confirm("Delete and Uninstall MMT-Probe ["+ p_id +"]\n\nAre you sure?"))
            return;

          MMTDrop.tools.ajax("/info/probe/remove/" + p_id , {}, "POST", {
            error  : function(){
              MMTDrop.alert.error("Cannot remove the MMT-Probe " + p_id, 3*1000);
            },
            success: function( obj ){
              MMTDrop.alert.success("Successfully remove the MMT-Probe " + p_id, 1*1000);
              setTimeout( function(){
                MMTDrop.tools.reloadPage();
              }, 1200 );
            }
          });//end ajax
        });

        //when user click on Stop/Start button
        $(".btn-action").on("click", function(){
          var p_id   = this.getAttribute("data-id");
          var action = this.getAttribute("data-action");
          var title  = this.getAttribute("title");

          if( !confirm( title +  " MMT-Probe ["+ p_id +"]\n\nAre you sure?"))
            return;

          $("#btn-action-" + p_id).disable();

          MMTDrop.tools.ajax("/info/probe/action/" + p_id + "/" + action , {}, "GET", {
            error  : function(){
              $("#btn-action-" + p_id).enable();
              MMTDrop.alert.error("Cannot "+ title.toLowerCase() +" the MMT-Probe " + p_id, 3*1000);
            },
            success: function( obj ){
              $("#btn-action-" + p_id).enable();
              MMTDrop.alert.success("Successfully send "+ title.toLowerCase() +" signal to the MMT-Probe " + p_id, 3*1000);
            }
          });//end ajax
        });

        //when user click on Stop/Start button
        $(".btn-config").on("click", function(){
          var p_id = this.getAttribute("data-id");

          MMTDrop.tools.ajax("/info/probe/config/" + p_id , {}, "GET", {
            error  : function(){
              MMTDrop.alert.error("Cannot get configuration of Probe " + p_id, 3*1000);
            },
            success: function( obj ){
              var probe_config = obj.data;
              var form_cfg = {
                type : "<div>",
                attr : {
                  class: "col-md-12",
                },
                children:[{
                  type : "<textarea>",
                  attr : {
                    rows  : 25,
                    class : "form-control textarea-config",
                    text  : probe_config,
                    id    : "probe-cfg-text"
                  }
                },{
                  type : "<input>",
                  attr : {
                    value : "Save",
                    id    : "probe-cfg-save-btn",
                    type  : "submit",
                    class : "btn btn-primary pull-right",
                    style : "width: 100px; margin-top: 20px",
                  }
                }]
              }
              var modal = MMTDrop.tools.getModalWindow("probe-cfg");
              modal.$title.html("Configuration of MMT-Probe " + p_id );
              modal.$content.html( MMTDrop.tools.createDOM( form_cfg ) );
              modal.modal();

              $("#probe-cfg-save-btn").click( function(){
                var config = $("#probe-cfg-text").val();
                if( config == probe_config ){
                  return MMTDrop.alert.success("The configuration does not change", 3*1000);
                }

                MMTDrop.tools.ajax("/info/probe/config/" + p_id, {config: config}, "POST", {
                  error  : function(){
                    MMTDrop.alert.error("Cannot modify the configuration of MMT-Probe " + p_id, 5*1000);
                  },
                  success: function(){
                    MMTDrop.alert.success("Successfully update the configuration of MMT-Probe " + p_id, 3*1000);
                    modal.modal("hide");
                  }
                })
              });
            }
          });//end ajax
        });

        var timeout_handle = undefined;
        function load_probe_time(){
          //avoid 2 consecutif calls
          if( timeout_handle !== undefined )
            clearTimeout( timeout_handle );
          timeout_handle = undefined;


          MMTDrop.tools.ajax("/api/status/5000", {}, "GET", {
            error  : function(){
              //MMTDrop.alert.error("Cannot get status of Probes", 3*1000);
            },
            success: function( obj ){
              var current_time = obj.time.now;
              var probeStatus  = obj.probeStatus;
              //for each probe
              for( var p_id in probeStatus ){

                var probe_ts = probeStatus[p_id], last_ts = 0;
                //find last timestamp
                //for each running period of a probe
                for( var j in probe_ts )
                  if( probe_ts[j].last_update > last_ts )
                    last_ts = probe_ts[j].last_update;

                $("#update-" + p_id).html( MMTDrop.tools.formatDateTime( new Date( last_ts ) ));
                //check whenether the probe is running or not
                var is_running = (last_ts > (current_time - 10*1000));
                var attr = is_running ? {
                  title        : "Stop",
                  "data-action": "stop",
                  class        : "btn-action fa fa-stop"
                } : {
                  title        : "Start",
                  "data-action": "start",
                  class        : "btn-action fa fa-play"
                }
                $("#btn-action-"+ p_id).attr( attr );
              }
            }
          });
          //regularly update timestamp of probes
          timeout_handle = setTimeout( load_probe_time, REFRESH_INFO_INTERVAL );
        };
        load_probe_time();

      }
    })//end MMTDrop.tools.ajax
  },

  createConfigReport: function(){
    fPeriod.hide();
    fProbe.hide();
    fAutoReload.hide();

    var form_config = {
      type : "<div>",
      attr : {
        style : "margin: 20px",
        class : "row",
      },
      children: [{
        type : "<div>",
        attr : {
          class : "col-md-12 text-right",
          html  : 'MMT-Operator log files <input id="log-datepicker" type="hidden"><span class="glyphicon glyphicon-calendar datepicker-icon"/>'
        }
      },{
        type : "<div>",
        attr : {
          class: "col-sm-6",
        },
        children: [{
          type : "<form>",
          attr : {
            id: "conf-operator-form"
          },
          children: [{
            label : "MMT-Operator",
            type  : "<textarea>",
            attr  : {
              rows: 3,
              id      : "conf-operator-content",
              class   : "form-control textarea-config",
              required: true
            }
          },{
            type : "<input>",
            attr : {
              type : "submit",
              class: "btn btn-primary",
              value: 'Save',
              id   : "conf-btnSave"
            }
          }]
        }]
      },{
        type : "<div>",
        attr : {
          class: "col-sm-6",
        },
        children: [{
          type : "<form>",
          attr : {
            id: "conf-probe-form"
          },
          children: [{
            label : "Network Interfaces",
            type  : "<textarea>",
            attr  : {
              rows: 3,
              id      : "conf-probe-content",
              class   : "form-control textarea-config",
              required: true
            }
          },{
            type : "<input>",
            attr : {
              type : "submit",
              class: "btn btn-primary",
              value: 'Save',
              id   : "conf-btnSave"
            }
          }]
        }]
      }]
    }
    //generate form
    $("#config-content" ).append( MMTDrop.tools.createForm( form_config, true ) ) ;

    //log files
    var $datepicker = null;

    var minDate = (new Date()).getTime();
    if( status_db.probeStatus )
      for( var i=0; i<status_db.probeStatus.length; i++)
        if( status_db.probeStatus[i].start < minDate )
          minDate = status_db.probeStatus[i].start;
    minDate = new Date( minDate );

    $("#log-datepicker").datepicker({
      showButtonPanel: false,
      minDate        : "-7d",
      maxDate        : "-0d",
  		defaultDate    : "-0d",
  		closeText      : "Close",
      beforeShow: function(input, inst){
        inst.dpDiv.css({marginTop: '20px', marginLeft: '-55px'});
      },
      onSelect: function ( dateText, inst ) {
  			window.location.href = "/info/conf/log/" + inst.selectedYear + "/" + (inst.selectedMonth + 1) + "/" + inst.selectedDay;
  			$(this).hide();
  		},
    });//end log-datepicker.datepicker
    $("#log-datepicker").next().click( function(){
      $("#log-datepicker").datepicker("show");
    });


    //load data
    MMTDrop.tools.ajax("/info/conf", null, "GET", {
      error : function(){
        MMTDrop.alert.error("Internal error", 10*1000);
      },
      success : function( data ){
        $("#conf-probe-content").val( data.data.probe )
        $("#conf-operator-content").val( data.data.operator )
      }
    });

    //save operator-conf
    //when user submit form
    $("#conf-operator-form").validate({
      errorClass  : "text-danger",
      errorElement: "span",
      //when the form was valided
      submitHandler : function( form ){

        var value = $("#conf-operator-content").val();
        try{
          var o = JSON.parse( value );
        }catch( err ){
          MMTDrop.alert.error( "<strong>Syntax error:</strong>" + err, 10*1000 );
          return;
        }

        if( !confirm("Update and Restart MMT-Operator\nAre you sure?\n\n") )
          return;

        var data = {
          operator: value,
        };

        MMTDrop.tools.ajax("/info/conf", data, "POST", {
          error  : function(){
            MMTDrop.alert.error("Cannot update the configure of MMT-Operator", 10*1000);
          },
          success: function(){
            MMTDrop.alert.success("Successfully updated the configure of MMT-Operator", 5*1000);
            obj.interfaces[ data.admin.iface ] = data.admin;
          }
        })
        return false;
      }
    });

    //save probe-conf
    //when user submit form
    $("#conf-probe-form").validate({
      errorClass  : "text-danger",
      errorElement: "span",
      //when the form was valided
      submitHandler : function( form ){

        var value = $("#conf-probe-content").val();

        if( !confirm("Update Network Interfaces and Restart Machine \n\nAre you sure?") )
          return;

        if( !confirm("Update Network Interfaces and Restart Machine \n\nIs network interfaces description correct?") )
          return;

        var data = {
          probe: value,
        };

        MMTDrop.tools.ajax("/info/conf", data, "POST", {
          error  : function(){
            MMTDrop.alert.error("Cannot update the configure of Network Interfaces", 10*1000);
          },
          success: function(){
            MMTDrop.alert.success("Successfully updated the configure of Network Interfaces", 10*1000);
            obj.interfaces[ data.admin.iface ] = data.admin;
          }
        })
        return false;
      }
    });

    //when user resize
    $("#conf-probe-form").getWidgetParent().on("widget-resized", function(){
      var h = $("#conf-probe-form").getWidgetContentOfParent().height() - 145;
      $(".textarea-config").css( "height", h + "px" );
    }).trigger("widget-resized");
  },
}
