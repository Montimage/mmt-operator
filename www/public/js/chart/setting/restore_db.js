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
              class : "table table-striped table-bordered table-condensed nowrap dataTable",
              id    : "dataTable"
            },
          }]
        },{
          type: "<div>",
          children : [
            {
              type: "<input>",
              attr: {
                type    : "button",
                class   : "btn btn-warning pull-right",
                style   : "margin-left: 30px",
                value   : "Upload a Backup File",
                id      : "uploadBtn",
                disabled: true
              }
            }
          ]
        }]
      };

    var render = function( msg ){
      $("#system-content" ).html('<div style="text-align: center">'+ msg +'</div>');
    };
    var _glo = {
      backupLst : []
    }

    MMTDrop.tools.ajax("/info/db", null, "GET", {
      error  : function(){
        MMTDrop.alert.error("Cannot connect to server", 5*1000);
      },
      success: function( data ){
        var obj = data[0];
        if( obj == undefined || obj.backup == undefined || obj.backup.length == 0)
          return render("Ops! There are no backup!!!");

        //point to global variable
        _glo.backupLst = obj.backup;

        if( obj.isBackingUp === true || obj.isRestoring === true )
          return render("Database is being backup or restore ...");

        if( obj.restore == undefined ) obj.restore = [];

        //get informtion of restores concerning to this backup
        var get_restore_info = function( time ){
          var res = [];
          for( var i=0; i< obj.restore.length; i++ )
            if( obj.restore[i].time == time ){
              res.push(
                " - " +
                moment( new Date( obj.restore[i].time ) ).format("YYYY-MM-DD HH:mm:ss" )
                +
                ((obj.restore[i].error != null) ? " error: " + JSON.stringify( obj.restore[i].error ) : ' <i class="fa fa-check"></i>')
               );
            }

          if( res.length > 0 )
            return "<strong>Restore:</strong> <br/>" + res.join("<br/>");
          return "";
        }

        $("#system-content" ).html( MMTDrop.tools.createForm( form_config ) ) ;

        //create data array of Table
        var arr = [];
        for( var i=0; i<obj.backup.length; i++ ){
          var bak       = obj.backup[i];
          var disable   = bak.file == undefined || bak.name == undefined || obj.isBackingUp || obj.isRestoring != undefined;
          var timestamp = moment( new Date( bak.time ) ).format("YYYY-MM-DD HH:mm:ss" );

          arr.push([
            timestamp,
            bak.file != undefined && bak.name != undefined ?
              '<div class="pull-right"><a title="Download backup file" href="/db_backup/'+ bak.name +'">' + MMTDrop.tools.formatDataVolume( bak.size ) + ' <i class = "fa fa-cloud-download"/></a></div>' : ""
            ,
            //Note
            '<div class="need-to-fix-width" style="width: 500px; text-overflow: ellipsis;overflow: hidden">'
            +
            (bak.error ? JSON.stringify( bak.error ) : "") + get_restore_info( bak.time )
            +
            '</div>',
            //restore button
            disable ?
            '<div class="center-block" style="text-align: center"><span disabled class="btn btn-success">Restore</span></div>'
            :
            '<div class="center-block" style="text-align: center"><a class="btn btn-success btn-restore" data-file="'+ timestamp +'" data-time='+ bak.time +'>Restore</a></div>',
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
            {title: "Backup Time", width: "120px"},
            {title: "Size (Bytes)", className:"dt-body-right", width: "100px"},
            {title: "Note"},
            {title: "", width: "100px"}
          ]
        });

        if( obj.isBackingUp || obj.isRestoring != undefined ){
          $("#uploadBtn").disable();

          $("#dataTable_filter").parent().prev().html("<div class='pull-right'>Database is being " + (obj.isBackingUp? "backed up" : "restored" + ' <i class="fa fa-refresh fa-spin fa-fw"></i></div>'));
        }

        //resize dataData when user resizes window/div
        var $widget = $("#system-content").getWidgetParent();
        //resize when changing window size
        $widget.on("widget-resized", null, table, function (event, widget) {
          var h = $("#system-content").getWidgetContentOfParent().height() - 150;
          $(".dataTables_scrollBody").css('max-height', h+"px").css('height', h+"px")

          var w = $("#system-content").getWidgetContentOfParent().width() - 120 - 100 - 100 - 150;
          $(".need-to-fix-width").width(w + "px");
          $(".dataTables_scrollBody").addClass("table-bordered");
        });
        $widget.trigger("widget-resized", [$widget]);

        //when user click on Delete button
        $(".btn-restore").on("click", function(){
          var file = this.dataset["file"];
          if( !confirm("Restore this backup ["+ file +"]\nDo you want to continue?") )
            return;
          $(this).disable();

          var id = this.dataset["time"];

          MMTDrop.tools.ajax("/info/db?action=restore&id=" + id, {}, "POST", {
            error: function(){
              MMTDrop.alert.error("Internal Error 601", 5*1000);
            },
            //reload the page when success
            success: function(){
              MMTDrop.alert.success("Starting to restore database", 3*1000);
            }
          })
        });
      }
    });

	},//end createBackupFormReport
}



//show hierarchy URL parameters on toolbar
$( function(){
  breadcrumbs.setData( [
    'Restore Database'
  ] );
});
