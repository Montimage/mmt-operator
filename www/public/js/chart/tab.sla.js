var arr = [
    {
        id: "sla",
        title: "Overview of Metrics",
        x: 0,
        y: 0,
        width: 12,
        height: 6,
        type: "success",
        userData: {
            fn: "createUploadForm"
        },
    }
];

var availableReports = {
}



//create reports

var ReportFactory = {
	createUploadForm: function( fPeriod ){

    //UPDATE VALUE OF METRIX AFTER REDERING
    var isFirstUpdate = true;
    var updateValue = function (){
      if( isFirstUpdate ){
        //update value of metrics when changing period => reload status_db
        status_db.afterReload( updateValue );
        isFirstUpdate = false;
      }
      /*
      $("#header").html(" (from "
                        +  moment(new Date( status_db.time.begin )).format("YYYY-MM-DD HH:mm:ss")
                        + " to "
                        + moment(new Date( status_db.time.end )).format("YYYY-MM-DD HH:mm:ss")
                        + ")"
                    );
      */
      $(".alerts").each( function( index, el ){
        $(el).html( '<i class = "fa fa-refresh fa-spin fa-fw"/>' );
        var metricName = this.dataset["metricname"];
        switch (metricName) {
          case "rtt":
            getRTT( this );
            break;
          case "availability":
            getAvailability( this );
            break;
          case "location":
            getLocation( this );
            break;
          default:
        }
      } );
    }

    var COL = MMTDrop.constants.StatsColumn;

    function getQuery( col_id, el ){
      var obj  = el.dataset;
      var expr = obj.value;
      expr = expr
          .replace(">=", '"$gte":').replace(">", '"$gt" :')
          .replace("<=", '"$lte":').replace("<", '"$lt" :')
          .replace("!=", '"$ne":')
          .replace("=",  '"$eq" :');
      expr = JSON.parse( "{" + expr + "}" );

      var $match = {};
      //timestamp
      $match[ COL.TIMESTAMP.id ] = {"$gte": status_db.time.begin, "$lt" : status_db.time.end };
      //probeid
      $match[1] = parseInt( obj.compid );

      $match[ col_id ] = expr;
      var $group = {"_id": null, "count": {"$sum":1}};

      return { query: [ {"$match" : $match}, {"$group": $group}], period_groupby: fPeriod.selectedOption().id };
    }

    var rtt_db = new MMTDrop.Database({collection: "data_session", action: "aggregate", raw: true});

    function getRTT( el ){
      //get number of alerts from database
      rtt_db.reload( getQuery( COL.RTT_AVG_CLIENT.id, el ), function( data ){
        var val = 0;
        if( data.length > 0 )
          val = data[0].count;

        $(el).html( '<span class="badge">' + val + '</span>' );
      });
    }

    //availability
    var avail_db = new MMTDrop.Database({collection: "availability", action: "aggregate", raw: true});

    function getAvailability( el ){
      //get number of alerts from database
      avail_db.reload( getQuery( 4, el ), function( data ){
        var val = 0;
        if( data.length > 0 )
          val = data[0].count;

        $(el).html( '<span class="badge">' + val + '</span>' );
      });
    }


    //location
    var loc_db = new MMTDrop.Database({collection: "data_session", action: "aggregate", raw: true});

    function getLocation( el ){
      //get number of alerts from database
      loc_db.reload( getQuery( COL.DST_LOCATION.id, el ), function( data ){
        var val = 0;
        if( data.length > 0 )
          val = data[0].count;

        $(el).html( '<span class="badge">' + val + '</span>' );
      });
    }
    //END UPDATING values


    //REDNER TABLE OF METRIX
    var app_id = MMTDrop.tools.getURLParameters().app_id;
    //reder table of components and their metrics
    var loadForm = function( obj ){
      var table_rows = [];

      //get either "metric" or "compoent" having the given id
      var getObject = function( label, id ){
        for( var i=0; i<obj[ label ].length; i++ )
          if( obj[label][i].id == id )
            return obj[label][i];
        return null;
      };

      //creat each row for each metric of a component
      for( var comp_id in obj.selectedMetric ){
        var selMetrics = obj.selectedMetric[ comp_id ];
        var comp       = getObject("components", comp_id)
        var $row = {
          type    : "<tr>",
          children: [{
            type :  "<td>",
            attr : {
              colspan : 5,
              style   : "font-weight: bold",
              text    : comp.title + " ("+ comp.url +")"
            }
          }]
        };

        //first row for component's title
        table_rows.push( $row );

        //each row for metric
        var j = 0;
        for( var me_id in selMetrics ){
          j++;
          var me = getObject("metrics", me_id );
          row = {
            type    : "<tr>",
            children: []
          };
          //first column
          if( j == 1 ){
            row.children.push({
              type : "<td>",
              attr : {
                rowspan : MMTDrop.tools.object2Array(selMetrics).length
              }
            })
          }
          //metric name
          row.children.push({
            type : "<td>",
            attr : {
              text : me.title,
              width: "30%",
            }
          })
          //alert
          row.children.push({
            type     : "<td>",
            attr     : {
              align : "center",
              width : "20%",
            },
            children : [{
              type : "<a>",
              attr : {
                id      : "alert-" + comp.id + "-" + me.id,
                class   : "text-danger",
                text    : "alerts "
              },
              children : [{
                type     : "<span>",
                attr     : {
                  "class"           : "alerts",
                  "data-compid"     : comp.id,
                  "data-metricid"   : me.id,
                  "data-metricname" : me.name,
                  "data-value"      : me.alert,
                  "html"            : '<i class = "fa fa-refresh fa-spin fa-fw"/>'
                }
              }]
            }]
          });
          //violation
          row.children.push({
            type     : "<td>",
            attr     : {
              align : "center",
              width : "20%",
            },
            children : [{
              type : "<a>",
              attr : {
                id      : "violation-" + comp.id + "-" + me.id,
                class   : "text-danger",
                text    : "violations "
              },
              children : [{
                type     : "<span>",
                attr     : {
                  "class"           : "alerts",
                  "data-compid"     : comp.id,
                  "data-metricid"   : me.id,
                  "data-metricname" : me.name,
                  "data-value"      : me.violation,
                  "html"            : '<i class = "fa fa-refresh fa-spin fa-fw"/>'
                }
              }]
            }]
          });

          //detail
          row.children.push({
            type     : "<td>",
            attr     : {
              align : "center",
              width : "20%",
            },
            children : [{
              type : "<a>",
              attr : {
                class   : "btn btn-info",
                type    : "button",
                text    : "Report",
                href    : '/chart/sla/'+ me.name + MMTDrop.tools.getQueryString( ["app_id"], "probe_id=" + comp.id )
              }
            }]
          });
          table_rows.push( row );
        }
      }

      var form_config = {
        type  : "<div>",
        attr  : {
          class  : "col-md-10 col-md-offset-1",
          style  : "margin-top: 20px"
        },
        children : [{
          type     : "<form>",
          children : [{
            type     : "<table>",
            attr     : {
              class : "table table-striped table-bordered table-condensed dataTable no-footer"
            },
            children : table_rows
          }]
        },{
          type: "<div>",
          children : [
            {
              type: "<a>",
              attr: {
                class   : "btn btn-danger pull-right",
                style   : "margin-left: 30px",
                text    : "Modify Metrics",
                href    : '/chart/sla/metric' + MMTDrop.tools.getQueryString(["app_id"])
              }
            }
          ]
        }]
      };

      $("#" + arr[0].id + "-content" ).append( MMTDrop.tools.createDOM( form_config ) ) ;
      //after redering the table, update their values (#alert, #violation)
      setTimeout( updateValue, 1000);
    }
    //END RENDERING

    //LOAD METRIX FROM DATABASE
    MMTDrop.tools.ajax("/api/metrics/find?raw", [{$match: {app_id : app_id}}], "POST", {
      error  : function(){},
      success: function( data ){
        var obj = data.data[0];
        //does not exist ?
        if( obj == undefined )
          MMTDrop.tools.gotoURL("/chart/sla/upload", {param:["app_id"]});
        else{
          loadForm( obj );
        }
      }
    } );
	}
}
