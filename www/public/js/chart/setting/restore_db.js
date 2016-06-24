var arr = [
    {
        id: "system",
        title: "Restore Database",
        x: 0,
        y: 0,
        width: 12,
        height: 6,
        type: "info",
        userData: {
            fn: "createBackupFormReport"
        },
    }
];

var availableReports = {
}


//create reports
var ReportFactory = {
	createBackupFormReport: function( fPeriod ){
    fPeriod.hide();
    fAutoReload.hide();
    var form_config = {
        type  : "<div>",
        attr  : {
          class  : "col-sm-12",
        },
        children : [{
          type     : "<form>",
          children : [{
            type     : "<table>",
            attr     : {
              class : "table table-striped table-bordered table-condensed dataTable",
              id    : "dataTable"
            },
          }]
        },{
          type: "<div>",
          children : [
            {
              type: "<a>",
              attr: {
                class   : "btn btn-warning pull-right",
                style   : "margin-left: 30px",
                text    : "Upload",
                href    : '/chart/sla/metric' + MMTDrop.tools.getQueryString(["app_id"])
              }
            }
          ]
        }]
      };

    var render = function( msg ){
      $("#system-content" ).html('<div style="text-align: center">'+ msg +'</div>');
    }
    MMTDrop.tools.ajax("/info/db", null, "GET", {
      error  : function(){
        MMTDrop.alert.error("Cannot connect to server", 5*1000);
      },
      success: function( data ){
        var obj = data[0];
        if( obj == undefined || obj.backup == undefined || obj.backup.length == 0)
          return render("Ops! There are no backup!!!");
        if( obj.isBackingUp === true || obj.isRestoring === true )
          return render("Database is being backup or restore ...");

        $("#system-content" ).html( MMTDrop.tools.createForm( form_config ) ) ;

        //create data array of Table
        var arr = [];
        for( var i=0; i<obj.backup.length; i++ ){
          var bak     = obj.backup[i];
          var disable = bak.file != undefined ? "" : 'style="pointer-events: none" disabled';
          arr.push([
            moment( new Date( bak.time ) ).format("YYYY-MM-DD HH:mm:ss" ),
            bak.file != undefined ?
              '<a title="Download backup file" href="/'+ bak.file +'">' + bak.file.substr( "db_backup/".length ) + '</a>' : ""
            ,
            bak.error ? JSON.stringify( bak.error ) : "",

            '<div class="center-block" style="text-align: center"><a '+disable+' id="btnDelete" class="btn btn-danger btn-delete" data-file="'+ bak.file +'" data-time='+ bak.time +'>Delete</a></div>',

            '<div class="center-block" style="text-align: center"><a '+disable+' id="btnRestore" class="btn btn-success btn-restore" data-file="'+ bak.file +'" data-time='+ bak.time +'>Restore</a></div>',
          ])
        }
        //create DataTable
        var table = $("#dataTable").dataTable({
          "scrollY":        "200px",
          "scrollCollapse": true,
          "paging":         false,
          order : [0, "desc"],
          data: arr,
          columns: [
            {title: "Backup Time"},
            {title: "File"},
            {title: "Note"},
            {title: ""},
            {title: ""}
          ]
        });

        //resize dataData when user resizes window/div
        var $widget = $("#system-content").getWidgetParent();
        //resize when changing window size
        $widget.on("widget-resized", null, table, function (event, widget) {
          var h = $("#system-content").getWidgetContentOfParent().height() - 150;
          $(".dataTables_scrollBody").css('max-height', h+"px").css('height', h+"px")
        });
        $widget.trigger("widget-resized", [$widget]);

        //when user click on Delete button
        $(".btn-delete").on("click", function(){
          var file = this.dataset["file"];
          if( confirm("Delete this backup ["+ file +"]\nDo you want to cancel?") )
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
    });

	},//end createBackupFormReport
}
