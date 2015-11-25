var arr = [
    {
        id: "security",
        title: "Security Alert",
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

var fPeriod = MMTDrop.filterFactory.createPeriodFilter();
var fProbe  = MMTDrop.filterFactory.createProbeFilter();

var database = new MMTDrop.Database({
        format: MMTDrop.constants.CsvFormat.SECURITY_FORMAT, //0
        period: MMTDrop.constants.period.MINUTE //get data stored in DB from the last minute
    }, null, false);
var filters = [ fPeriod, fProbe];

MMTDrop.callback = {
    chart : {
        afterRender : loading.onChartLoad
    }
};

fPeriod.onChange( loading.onShowing );

var ReportFactory = {};

ReportFactory.createSecurityRealtimeReport = function (fProbe, database) {

    var COL = MMTDrop.constants.SecurityColumn;
    
    var DATA    = [];
    var VERDICT = {};
    
    var reset = function(){
        DATA    = [];
        VERDICT = {
        "detected"      : 0,
        "not_detected"  : 0, 
        "respected"     : 0, 
        "not_respected" : 0, 
        "unknown"       : 0
    };
    };
    
    reset();
    fPeriod.onChange( reset );
    
    var appendData = function( msg ){
        var key   = msg[ COL.PROBE_ID.id ] + "-" + msg[ COL.PROPERTY.id ];
        var vdict = msg[ COL.VERDICT.id ];
        var ts    = msg[ COL.TIMESTAMP.id ];
        var num_verdict = 1;
        
        if( msg[ COL.VERDICT_COUNT.id ] > 0 ) 
            num_verdict = msg[ COL.VERDICT_COUNT.id ];
        
        VERDICT[ vdict ] += num_verdict;
        
        for( var i in DATA ){
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
            "detected"      : 0,
            "not_detected"  : 0, 
            "respected"     : 0, 
            "not_respected" : 0, 
            "unknown"       : 0
        };
        obj.verdict[ vdict ] += num_verdict ;
        obj.detail           = [ msg ];
        obj.data             = MMTDrop.tools.cloneData( msg );    //data to show to the table
        
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
        },
        {
            id: COL.PROPERTY.id,
            label: "Property"
        },
        {
            id: COL.TYPE.id,
            label: "Type"
        },
        {
            id: COL.VERDICT.id,
            label: "Verdict"
        },
        {
            id: COL.DESCRIPTION.id,
            label: "Description"
        }
        ];
    
    var getVerdictHTML = function( verdict ){
        var bootstrap_class_name = {
            "detected"      : "label-danger",
            "not_detected"  : "label-info", 
            "respected"     : "label-success", 
            "not_respected" : "label-warning", 
            "unknown"       : "label-default"
        };
        var html = "";
        for( var v in verdict ){
            if( verdict[v] == 0 ) continue;
            html += '<span class="label '+ bootstrap_class_name[v] +' mmt-verdict-label"> ' + v + '</span><span class="badge">' + verdict[v] + '</span> ';
        }
        return html;
    };
    
    var updateTotalVerdictDisplay = function(){
        $("#mmt-verdict-total").html( getVerdictHTML( VERDICT ) );
    };
    //this is applied for each element of data
    var getDataToShow = function( obj ){
        var msg = obj.data;
        var arr = [];
        for( var i in columnsToShow ){
            var col = columnsToShow[ i ].id;
            var val = msg[ col ];
            if( col == COL.VERDICT.id )
                val = getVerdictHTML( obj.verdict ) ;
            else if( col == COL.TIMESTAMP.id )
                val = MMTDrop.tools.formatDateTime( new Date( val ) ) ;
            
            if( arr.length == 0 )
                val = '<span data-index="' + obj.index + '">' + val + '</span>';
            arr.push( val );
        }
        return arr;
    }
    
    var cTable = MMTDrop.chartFactory.createTable({
        getData: {
            getDataFn: function (db) {
                var arr = db.data();
                for (var i in arr)
                    appendData( arr[i] );

                arr = [];
                for( var i in DATA ){
                    arr.push( getDataToShow( DATA[i] ) );
                }
                
                var cols = [];
                for( var i=0; i<columnsToShow.length; i++)
                    cols.push( {id: i, label: columnsToShow[i].label } );
                return {
                    columns: cols,
                    data   : arr
                };
            }
        },
        chart: {
            "order": [[0, "asc"]],
            dom: "<'row'<'#mmt-verdict-total'>f><'dataTables_scrollBody overflow-auto-xy't><'row'<'col-sm-3'l><'col-sm-9'p>>",
        },
        afterRender: function (_chart) {
            updateTotalVerdictDisplay();
            var modal = '<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true" id="modalWindow">'
                        +'<div class="modal-dialog">'
                        +'<div class="modal-content">'
                        +'<div class="modal-header">'
                        +'<button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>'
                        +'<h4 class="modal-title">Detail</h4>'
                        +'</div>'
                        +'<div class="modal-body code-json" id="detailItem"></div>'
                        +'</div></div></div>';
            
            $("body").append( $(modal) );
            
            var table = _chart.chart;

            ///configuration of interface: arrange components
            //hide the filers of report (not the one of Datatable)
            $("#report_filters").hide();

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
                if ($currentRow)
                    $currentRow.removeClass('active');

                //popup a modal when user clicks on an item of the table
                var showModal = function (data) {
                        data = JSON.stringify(data, function (key, val) {
                            if (typeof val === "string")
                                return "<string>" + val + "</string>";
                            if (typeof val === "number")
                                return "<number>" + val + "</number>";
                            return val;
                        }, "  ");
                        data = data.replace(/(\"<string>)/g, '<string>"').replace(/<\/string>\"/g, '"</string>');
                        data = data.replace(/\"<number/g, "<number").replace(/number>\"/g, "number>");
                        data = data.replace(/\"(.+)\":/g, "<label>$1</label> :");

                        $("#detailItem").html(data);
                        $("#modalWindow").modal();
                };
                
                    //set the current selected row 
                $currentRow = $(this);
                $currentRow.addClass('active');

                //get value of the first column == index
                var index = $currentRow.find('td:first').find("span").data("index");
                var item = DATA[index].detail;
                if (item){
                    if( item.length > 20 )
                        item ="BigData";
                    showModal(item);
                }
                return false;
            });


        }
    });
    var lastUpdateTime = (new Date()).getTime();
    //when a new message is comming, append it to the table
    database.onMessage( "security.report",  function (msg) {
        var index = -1;
        if( msg )
            index = appendData( msg );
        
        var now = (new Date()).getTime();
        if( now - lastUpdateTime <= 500 )
            return;
        lastUpdateTime = now;
        
        
        updateTotalVerdictDisplay();
        
        var table = cTable.chart;
        table.DataTable().columns.adjust();
        
        if( index >= 0 ){
            var row = getDataToShow( DATA[ index ] );
            table.api().row( index ).data( row );
            
            //flash the updated row
            $(table.api().row( index ).node()).stop().fadeOut(100).fadeIn(100);
            
            return;
        }
        
        //need to append to the table a new row
        var new_row = getDataToShow( DATA[ DATA.length - 1 ] );
        

        var inLastPage = false;
        var o = table.api().page.info();
        var currentPage = o.page;

        if (currentPage == (o.pages - 1))
            inLastPage = true;

        //show msg to the table
        table.api().row.add( new_row );
        table.api().draw(false);

        //console.log(" in the last page:" + inLastPage);
        if (inLastPage) {
            //scroll to bottom --> last item being added
            $('.dataTables_scrollBody').scrollTop(10000000);

            table.api().page("last");
            table.api().draw(false);
        }

        //console.log(new Date() + "  Add a new Row");
    });


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
        [{object: fProbe, effect:[ {object: cTable}]}]
    );
    
    return report;
}