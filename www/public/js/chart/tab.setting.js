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


//create reports
var ReportFactory = {
	createSystemInformationReport: function( fPeriod ){
    fPeriod.hide();
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

          $("#sys-timestamp").text( moment( new Date( obj.timestamp )).format("YYYY-MM-DD HH:mm:ss" ) )
        }
      })
    }

    setTimeout( load_data, 1000);
    //auto update each 5seconds
    setInterval( load_data, 5000);
	},

  createDatabaseInformationReport: function(){
    fPeriod.hide();
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
            id       : "conf-db-auto"
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
                text = '<a title="Download the backup file" href="/db_backup/'+ data.lastBackup.name +'">' + MMTDrop.tools.formatDateTime( new Date( data.lastBackup.time )) + ' <i class = "fa fa-cloud-download"/></a>';
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
      },{
      type : "<div>",
      attr : {
        class: "panel panel-default",
        style: "margin-top: 10px"
      },
      children : [{
        type : "<div>",
        attr : {
          class : "panel-heading",
          text  : "Add new Probe",
          style : "padding: 5px"
        }
      },{
        type : "<div>",
        attr : {
          class : "panel-body",
          style : "padding-bottom: 0px"
        },
        children : [{
          type : "<form>",
          attr : {
            //style : "margin: 40px 10px 10px 0px",
            id    : "ssh-form",
            class : "form-horizontal"
          },
          children: [{
            type : "<div>",
            attr : {
              class: "row form-group"
            },
            children:[
              {
                type     : "<label>",
                attr     : {
                  class : "col-md-2 control-label",
                  text  : "SSH"
                }
              },
              {
                type : "<div>",
                attr : {
                  class : "col-sm-3"
                },
                children : [{
                  type : "<input>",
                  attr : {
                    id          : "ssh-address",
                    name        : "ssh-address",
                    class       : "form-control",
                    placeholder : "ip addresss",
                    required    : true,
                  }
                }]
              },
              {
                type : "<div>",
                attr : {
                  class : "col-sm-3"
                },
                children : [{
                  type : "<input>",
                  attr : {
                    id          : "ssh-username",
                    name        : "ssh-username",
                    class       : "form-control",
                    placeholder : "ssh username",
                    required    : true,
                  }
                }]
              },
              {
                type : "<div>",
                attr : {
                  class : "col-sm-3"
                },
                children : [{
                  type : "<input>",
                  attr : {
                    id          : "ssh-password",
                    name        : "ssh-password",
                    type        : "password",
                    class       : "form-control",
                    placeholder : "ssh password",
                    required    : true,
                    readonly    : true,
                    //style+readonly are add to avoid browser load default username+password
                    readonly    : true,
                    style       : "background-color: white !important",
                    onfocus     : "this.removeAttribute('readonly');this.removeAttribute('style');",
                  }
                }]
              },
              //buttons
              {
                type: "<input>",
                attr: {
                  type : "submit",
                  class: "btn btn-primary",
                  value: 'Add',
                  id   : "nic-btnSave"
                }
              }//end buttons
              ]
          }]//end form
        }]
      }]
    }]
    }

    $("#probe-content" ).append( MMTDrop.tools.createForm( form_config ) ) ;
    //style+readonly was add to avoid browser load default username+password
    setTimeout( function(){
      $("#ssh-password").removeAttr("style").removeAttr("readonly");
    }, 500);

    //load list of probes from server, then show them in a table
    var load_data = function(){
      MMTDrop.tools.ajax("/info/probe", {}, "GET", {
        error  : function(){
          MMTDrop.alert.error("Cannot get list of Probes", 5*1000);
        },
        success: function( obj ){

          //create data array of Table
          var probeLst = obj.data;
          var arr = [];

          for( var i=0; i<probeLst.length; i++ ){
            var probe   = probeLst[i];
            var same  = 'style="margin-left: 10px;" data-id="'+ probe._id +'"'
            var id      = probe._id;
            arr.push([
              i+1,
              MMTDrop.tools.formatDateTime( new Date(probe.timestamp)),
              probe.address,
              "",
              '<div class="center-block" style="text-align: center; text-decoration: none">'
              +
              '<a '+same+' id="btnStop"        title="Stop"> <i class="fa fa-stop"></i> </a>'
              +
              '<a '+same+' id="btnRestart"     title="Restart" > <i class="fa fa-refresh"></i> </a>'
              +
              '<a '+same+' id="btnConfig"      title="Configure" > <i class="fa fa-sliders"></i> </a>'
              +
              '<a '+same+' id="btnInstall"     title="Install" > <i class="fa fa-gear"></i> </a>'
              +
              '<a '+same+' id="btnDelete"      title="Uninstall" > <i class="fa fa-trash"></i> </a>'
              +
              '</div>',
            ])
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
              {title: ""},
              {title: "Timestamp"},
              {title: "IP Address"},
              {title: "Last Report"},
              {title: "Actions"},
            ]
          });

          //resize dataData when user resizes window/div
          var $widget = $("#probe-content").getWidgetParent();
          //resize when changing window size
          $widget.on("widget-resized", null, table, function (event, widget) {
            var h = $("#probe-content").getWidgetContentOfParent().height() - 185;
            $(".dataTables_scrollBody").css('max-height', h+"px").css('height', h+"px")
          });
          $widget.trigger("widget-resized", [$widget]);

          //when user click on Delete button
          $(".btn-delete").on("click", function(){
            var file = this.dataset["file"];
            if( !confirm("Delete this backup ["+ file +"]\nAre you sure?\n\n") )
              return;
            $(this).disable();

            MMTDrop.tools.ajax("/info/db?action=del", {time: this.dataset["time"]}, "POST", {
              error: function(){
                MMTDrop.alert.error("Internal Error 601", 5*1000);
              },
              success: function(){

              }
            })
          });
        }
      })//end MMTDrop.tools.ajax
    };//end load_data
    load_data();


    //when user submit form
    $("#ssh-form").validate({
      errorClass  : "text-danger",
      errorElement: "span",
      rules: {
        "ssh-address"         : {ipv4: true},
      },
      //when the form was valided
      submitHandler : function( form ){
        var data = {
            address : $("#ssh-address").val(),
            username: $("#ssh-username").val(),
            password: $("#ssh-password").val(),
        };

        MMTDrop.tools.ajax("/info/probe", data, "POST", {
          error  : function(){
            MMTDrop.alert.error("Cannot add new Probe", 5*1000);
          },
          success: function(){
            MMTDrop.alert.success("Successfully add the Probe", 5*1000);
            load_data();
          }
        })
        return false;
      }
    });
  },

  createConfigReport: function(){
    fPeriod.hide();
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
  			window.location.href = "/info/conf/log/" + inst.selectedYear + "/" + inst.selectedMonth + "/" + inst.selectedDay;
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
