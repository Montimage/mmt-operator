var arr = [
    {
        id: "security",
        title: "NDN Alerts",
        x: 0,
        y: 7,
        width: 12,
        height: 8,
        type: "danger",
        userData: {
            fn: "createSecurityRealtimeReport"
        }
    }
];


var availableReports = {
    "createNodeReport":     "Security",
}

MMTDrop.callback = {
    chart : {
        afterRender : loading.onChartLoad
    }
};

var ReportFactory = {};

ReportFactory.createSecurityRealtimeReport = function (fPeriod) {

    var COL = MMTDrop.constants.SecurityColumn;
    var NDN = MMTDrop.constants.NdnColumn;

    var database = new MMTDrop.Database({ collection: "ndn_alerts", action: "aggregate",
                no_group : true}, null, false);
    var filter_db = new MMTDrop.Database({ collection: "ndn_threshold", action: "find",
                no_group : true, query: [{$match : {_id : 1}}], raw: true}, null, false);

    //override reload function
    database._old_reload = database.reload;
    database.reload = function( new_param, callback, user_data ){
      filter_db.reload({}, function( data){
        database.ifa_threshold = "";
        if( data.length > 0 ){
          database.ifa_threshold = data[0].ifa_threshold;

          var expr = database.ifa_threshold ;
          expr = expr
              .replace(">=", '"$gte":').replace(">", '"$gt" :')
              .replace("<=", '"$lte":').replace("<", '"$lt" :')
              .replace("!=", '"$ne":')
              .replace("=",  '"$eq" :');
          try{
            expr = JSON.parse( "{" + expr + "}" );
          }catch( err ){
            alert( "Incorrect filter expression ["+ expr +"]");
            return;
          }
          var $match = {};
          $match[ NDN.IFA.id ] = expr;

          if( !Array.isArray( new_param.query ))
            new_param.query = [];
          new_param.query.push( {$match : $match} );
        }

        database._old_reload( new_param, callback, user_data);
      })
    };


    var DATA    = [];
    var VERDICT = {};

    var reset = function(){
        DATA    = [];
        VERDICT = {
        "IFA"      : 0,
        "unknown"  : 0
    };
    };

    reset();
    fPeriod.onChange( reset );

    var appendData = function( msg ){
        var key   = msg[ COL.PROBE_ID.id ] + "-" + msg[ NDN.MAC_SRC.id ];
        var vdict = "IFA";
        var ts    = msg[ COL.TIMESTAMP.id ];
        var num_verdict = 1;

        if( msg[ COL.VERDICT_COUNT.id ] > 0 )
            num_verdict = msg[ COL.VERDICT_COUNT.id ];

        VERDICT[ vdict ] += num_verdict;

        for( var i=0; i<DATA.length; i++ ){
            var obj = DATA[ i ];
            if( obj.key == key ){
                obj.verdict[ vdict ] += num_verdict;

                obj.detail.push( msg ) ;

                //update time
                obj.data[ COL.TIMESTAMP.id ] = msg[ COL.TIMESTAMP.id ];

                return i;
            }
        }

        var obj = {};
        obj.key              = key;
        obj.index            = DATA.length;
        obj.verdict          = {
            "IFA"  : 0,
        };
        obj.verdict[ vdict ] += num_verdict ;
        obj.detail           = [ msg ];
        obj.data             = MMTDrop.tools.cloneData( msg );    //data to show to the table

        //description of IFA
        obj.data[ NDN.IFA.id + 1 ] = "IFA Algorithm";

        DATA.push( obj );

        return -1;
    };

    var columnsToShow = [
        {
            id: COL.TIMESTAMP.id,
            label: "Last updated"
        },
        {
            id: COL.PROBE_ID.id,
            label: "Probe ID"
        },{
            id: NDN.MAC_SRC.id,
            label: "MAC Source"
        },
        {
            id: NDN.IFA.id,
            label: "Alerts"
        },
        {
            id: NDN.IFA.id + 1,
            label: "Description" //(will be hidden)"
        }
        ];

    var getVerdictHTML = function( verdict ){
        var bootstrap_class_name = {
            "IFA" : "label-danger",
        };
        var html = "";
        for( var v in verdict ){
            if( verdict[v] == 0 ) continue;
            if( html != "") html += ", ";
            html += '<span class="label '+ bootstrap_class_name[v] +' mmt-verdict-label"> ' + v + '</span><span class="badge">' + verdict[v] + '</span> ';
        }
        return html;
    };

    //detail of each property
    var detailOfPopupProperty = null;
    var openingRow = null;
    var popupTable = MMTDrop.chartFactory.createTable({
        getData: {
            getDataFn: function (db) {

                var cols = [{id: "index", label:""}, COL.TIMESTAMP,  NDN.IFA];

                var data = db.data();
                var arr = [];
                for( var index=0; index<data.length; index++ ){
                    var msg = data[index];
                    var o  = {};

                    o[ "index" ] = index+1;
                    var time = msg.time;
                    if( time === undefined ){
                        time = MMTDrop.tools.formatDateTime( new Date( msg[COL.TIMESTAMP.id] ));
                        msg.time = time;
                    }

                    o[ COL.TIMESTAMP.id ] = time;
                    o[ NDN.IFA.id   ] = msg[ NDN.IFA.id ];
                    var history = msg[ COL.HISTORY.id ];

                    var concernt = msg[ COL.VERDICT_COUNT.id ];

                    arr.push( o );
                }
                return {
                    columns: cols,
                    data   : arr
                };
            }
        },
        chart: {
            "order": [[0, "asc"]],
            dom: "<'row'<'col-sm-5'l><'col-sm-7'f>><t><'row'<'col-sm-3'i><'col-sm-9'p>>",
            "deferRender": true
        },
        afterEachRender: function( _chart ){
        }
    });

    var updateTotalVerdictDisplay = function(){
        $("#mmt-verdict-total").html( "<strong>Total:</strong> " + getVerdictHTML( VERDICT ) );
    };


    //this is applied for each element of data
    var getDataToShow = function( obj ){
        var msg = obj.data;
        var arr = [];
        for( var i in columnsToShow ){
            var col = columnsToShow[ i ].id;
            var val = msg[ col ];
            if( col == NDN.IFA.id )
                val = getVerdictHTML( obj.verdict ) ;
            else if( col == COL.TIMESTAMP.id )
                val = MMTDrop.tools.formatDateTime( new Date( val ) ) ;

            if( arr.length == 0 )
                val = '<span data-index="' + obj.index + '">' + val + '</span>';
            arr.push( val );
        }
        return arr;
    };

    var cTable = MMTDrop.chartFactory.createTable({
        getData: {
            getDataFn: function (db) {
                //reset data cache
                reset();
                var arr = db.data();
                for (var i in arr)
                    appendData( arr[i] );

                arr = [];
                for( var i in DATA ){
                    arr.push( getDataToShow( DATA[i] ) );
                }

                var cols = [];
                for( var i=0; i<columnsToShow.length; i++)
                    cols.push( {id: i, label: columnsToShow[i].label, align: "left" } );
                return {
                    columns: cols,
                    data   : arr
                };
            }
        },
        chart: {
            "order": [[0, "asc"]],
            dom: "<'row' <'col-sm-9'<'#mmt-verdict-total'>><'col-sm-3'<'#filters'>>><'dataTables_scrollBody overflow-auto-xy row-cursor-pointer't><'row'<'col-sm-3'l><'col-sm-9'p>>",
        },
        afterEachRender: function (_chart) {
            ///configuration of interface: arrange components
            //hide the filers of report (not the one of Datatable)
            $("#report_filters").hide();

            var table = _chart.chart;
            if( table == undefined )
                return;

            updateTotalVerdictDisplay();
            if( $("#modalWindow").length === 0 ){
                var modal = '<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true" id="modalWindow">'
                            +'<div class="modal-dialog">'
                            +'<div class="modal-content" style="width: 800px">'
                            +'<div class="modal-header">'
                            +'<button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>'
                            +'<h4 class="modal-title">Detail</h4>'
                            +'</div>'
                            +'<div class="modal-body code-json" id="detailItem"></div>'
                            +'</div></div></div>';

                $("body").append( $(modal) );
            }

            table.on("draw.dt", function () {
                var $div = $('.dataTables_scrollBody');
                var h = $div.parents().filter(".grid-stack-item-content").height() - 120;
                $div.css('height', h);
                $div.css('margin-top', 10);
                $div.css('margin-bottom', 10);
                $div.children().filter("table").css( "border-top", "thin solid #ddd" );
            });

            //jump to the last page of table
            table.api().page('last');

            //show 10 items/page
            table.DataTable().page.len(10).draw(false); //either 5, 10, 25, 50, 100

            //resize when changing window size
            $(window).resize(function () {
                if (table)
                    table.api().draw(false);
            });


            var $currentRow;
            // Add event listener for opening and closing details
            table.on('click', 'tr[role=row]', function () {
                //clear the last selected row
                //if ($currentRow)
                    //$currentRow.removeClass('active');

                //popup a modal when user clicks on an item of the table
                var showModal = function (data) {
                    detailOfPopupProperty = data;
                    var prop = 0;
                    var des  = "";
                    for( var i in data )
                        if( prop !== 0 && des != "")
                            break;
                        else{
                            prop = data[i][ NDN.MAC_SRC.id ];
                            des  = data[i][7]
                        }

                    $("#detailItem").html("<strong>MAC Source: " + prop + '</strong><br/><div id="popupTable"/>');

                    var db = new MMTDrop.Database( {}, null, false );
                    db.data( data );
                    popupTable.attachTo( db, false );

                    popupTable.renderTo( "popupTable" );

                    if( loading )
                        loading.onHide();

                    $("#modalWindow").modal();
                };

                    //set the current selected row
                $currentRow = $(this);
                //$currentRow.addClass('active');

                //get value of the first column == index
                var index = $currentRow.find('td:first').find("span").data("index");
                var item = DATA[index].detail;
                if ( item ){
                    if( loading && item.length > 200)
                        loading.onShowing();

                    setTimeout(showModal, 100, item );
                }
                return false;
            });



            //filters
            $("#filters").append( MMTDrop.tools.createForm( {
              type: "<form>",
              attr : {
                class : "row",
                id    : "filter-form"
              },
              children : [{
                label: "Threshold",
                type : "<input>",
                attr : {
                  id      : "filter-txt",
                  required: true,
                  value   : database.ifa_threshold
                }
              },{
                type : "<button>",
                attr : {
                  text : "Apply",
                  type : "submit",
                  class: "btn btn-success",
                }
              }]
            } ) );

            //when user submit form
            $("#filter-form").validate({
              errorClass  : "text-danger",
              errorElement: "span",
              //when the form was valided
              submitHandler : function( form ){
                if( !confirm("Do you want to update the threshold?") )
                  return;
                var data = {
                  $match : {_id : 1},
                  $data  : {
                    ifa_threshold : $("#filter-txt").val()
                  },
                  $options : {
                    upsert : true
                  }
                };

                MMTDrop.tools.ajax("/api/ndn_threshold/update", data, "POST", {
                  error  : function(){
                    MMTDrop.alert.error("Cannot update the threshold", 10*1000);
                  },
                  success: function(){
                    MMTDrop.alert.success("Successfully updated the threshold", 10*1000);
                    //reload
                    setTimeout( function(){
                      document.location.href = document.location.href;
                    }, 1000 );
                  }
                })
                return false;
              }
            });

        }
    });

    var indexOfNewRow = [];
    var indexToUpdate = [];
    var lastUpdateTime = (new Date()).getTime();
    //when a new message is comming, append it to the table
    function addAlerts( data ) {
        if( data === undefined || data.length === 0 )
            return;

        for( var i in data ){
            var msg = data[i];
            var index = appendData( msg );
            if( index >= 0 ){
                //the row is not yet in the list to update
                if( indexToUpdate.indexOf( index ) === -1 && indexOfNewRow.indexOf( index ) === -1 )
                    indexToUpdate.push( index );
            }else
                indexOfNewRow.push( DATA.length - 1 );
        }


        var now = (new Date()).getTime();
        if( now - lastUpdateTime <= 500 )
            return;


        lastUpdateTime = now;

        updateTotalVerdictDisplay();


        var table = cTable.chart;


        for( var i in indexToUpdate  ){
            var index = indexToUpdate[ i ];

            var row_data = getDataToShow( DATA[ index ] );
            var row      = table.api().row( index );

            row.data( row_data );

            //flash the updated row
            $( row.node() ).stop().flash();;
        }
        indexToUpdate = [];

        //there are no new rows to add
        if( indexOfNewRow.length == 0 ){
            table.DataTable().columns.adjust();
            return;
        }

        for( var i in indexOfNewRow ){
            var index = indexOfNewRow[ i ];
            //need to append to the table a new row
            var new_row = getDataToShow( DATA[ index ] );

            //show msg to the table
            table.api().row.add( new_row );
        }
        indexOfNewRow = [];

        var inLastPage = false;
        var o = table.api().page.info();
        var currentPage = o.page;

        if (currentPage == (o.pages - 1))
            inLastPage = true;

        table.DataTable().columns.adjust();
        table.api().draw(false);

        //console.log(" in the last page:" + inLastPage);
        if (inLastPage) {
            //scroll to bottom --> last item being added
            $('.dataTables_scrollBody').scrollTop(10000000);

            table.api().page("last");
            table.api().draw(false);
        }

        //console.log(new Date() + "  Add a new Row");
    };


    var report = new MMTDrop.Report(
        // title
        null,

        // database
        database,

        // filers
					[],

        // charts
					[
            {
                charts: [cTable],
                width: 12
                },
					 ],

        //order of data flux
        [ {object: cTable}]
    );

    return report;
}
