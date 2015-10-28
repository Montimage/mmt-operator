var arr = [
    {
        id: "traffic",
        title: "Traffic",
        x: 0,
        y: 0,
        width: 5,
        height: 5,
        type: "danger",
        userData: {
            fn: "createTrafficReport"
        }
    },
    {
        id: "protocol",
        title: "Protocols",
        x: 0,
        y: 6,
        width: 12,
        height: 6,
        type: "success",
        userData: {
            fn: "createProtocolReport"
        },
    },
    {
        id: "realtime",
        title: "Realtime",
        x: 0,
        y: 6,
        width: 12,
        height: 6,
        type: "success",
        userData: {
            fn: "createRealtimeTrafficReport"
        },
    },
    {
        id: "node",
        title: "Nodes",
        x: 6,
        y: 0,
        width: 7,
        height: 5,
        type: "info",
        userData: {
            fn: "createNodeReport"
        }
    }
];

var availableReports = {
    "createNodeReport":     "Nodes",
    "createProtocolReport": "Protocols",
    "createTrafficReport":  "Traffic"
}

$(function () {
    'use strict'

    MMTDrop.setOptions({
        serverURL: "http://localhost:8088",
    });

    for( var i in ReportFactory)
        MMTDrop.reportFactory[i] = ReportFactory[i];

    ReportFactory = MMTDrop.reportFactory;
    
    var fProbe = MMTDrop.filterFactory.createProbeFilter();
    var fPeriod = MMTDrop.filterFactory.createPeriodFilter();

    fProbe.renderTo("toolbar-box");
    $("#"+fProbe.getId() + "_container").hide();
    fProbe.onFilter(function (sel, db) {
        EVENTS.publish("probe-change", {
            select: sel,
            database: db
        });
    })

    fPeriod.renderTo("toolbar-box");

    var database = MMTDrop.databaseFactory.createStatDB();
    fProbe.attachTo(database);
    fPeriod.attachTo(database);
    fPeriod.onFilter(function (val, db) {
        fProbe.attachTo(db);
        fProbe.filter();
    });

    
    var renderReport = function( node ){
        try {
            var key = node.userData.fn;
            var cb = ReportFactory[key];
            if (MMTDrop.tools.isFunction(cb)) {
                var rep = ReportFactory[key](fProbe, database);
                if (rep){
                    rep.renderTo(node.id + "-content");
                }
            }
        } catch (ex) {
            console.error("Error when rending report [" + key + "] to the DOM [" + node.id + "]");
            console.error(ex.stack);
        }
    }

    var data = Grid.together(arr);

    for (var i in data) {
        var node = data[i];
        setTimeout( renderReport, 100, node );
    }

    fPeriod.filter();

    
    //update the modal
    var $modal = $("#modal");

    $modal.find( ".btn-group .btn" ).on("click", function(){
        var $el = $(this);
        $("#reportColor").val( $el.data("type") );
    })
    
    var $sel = $("#reportList");
    for( var i in availableReports ){
        var label = availableReports[i];
        $sel.append( $("<option>", {"value": i, "text": label + " Report"}) );
    }
    $modal.find("#doneBtn").on("click", function () {
        
        $modal.modal("hide");
        
        var id = $sel.val();
        var label = $("#reportTitle").val();
        
        if( label == undefined || label == "")
            label = availableReports[id] + " Report";
       
        var node = {
            id    : "custom-report-" + MMTDrop.tools.getUniqueNumber(),
            title : label,
            width : 12,
            height: 4,
            x     : 0,
            y     : 0,
            type  : $("#reportColor").val(),
            userData: {
                fn: id
            }
        };
        
        Grid.add_widget( node );
        Grid.save_grid();
        
        renderReport( node );
       
    });
});