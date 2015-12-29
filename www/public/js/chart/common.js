/*
//
//These 2 variables are defined in each tab.js (eg: link.js, network.js)
var arr = [
    {
        id: "realtime",
        title: "Traffic in Realtime",
        x: 0,
        y: 0,
        width: 6,
        height: 6,
        type: "success",
        userData: {
            fn: "createRealtimeTrafficReport"
        },
    },
];

var availableReports = {
    "createNodeReport":     "Nodes",
}

var database = 
var filters = [];
*/

'use strict'

MMTDrop.setOptions({
    //serverURL: "http://localhost:8088",
});


if( ReportFactory === undefined )
    var ReportFactory = {};
    
for (var i in ReportFactory)
        MMTDrop.reportFactory[i] = ReportFactory[i];

ReportFactory = MMTDrop.reportFactory;



$(function () {
    
    $("#waiting").on("click", function(){
            $("#waiting").hide();
    });
    
    if (filters == undefined || filters.length == 0) {
        throw new Error("Need to defined a list of filters")
    }
    if (database == undefined) {
        throw new Error("Need to defined a database")
    }


    var filter;
    for (var i = filters.length - 1; i >= 0; i--) {
        filter = filters[i];
        filter.renderTo("toolbar-box");
        filter.attachTo(database);
    }

    //register the chain of filters
    for (var i = 0; i < filters.length - 1; i++)
        filters[i].onFilter(function (val, db, index) {
            filters[index].attachTo(db);
            filters[index].filter();
        }, i + 1);

    //the last filter will effect the reports
    filter = filters[ filters.length - 1 ];

    var renderReport = function (node) {
        try {
            var key = node.userData.fn;
            var cb = ReportFactory[key];
            if (MMTDrop.tools.isFunction(cb)) {
                var rep = ReportFactory[key](filter, database);
                if (rep) {
                    rep.renderTo(node.id + "-content");
                }
            }
            
            //loading is defined in each tab
            if( loading )
                loading.totalChart ++;
            
        } catch (ex) {
            console.error("Error when rending report [" + key + "] to the DOM [" + node.id + "]");
            console.error(ex.stack);
        }
    }

    var data = Grid.together(arr);

    for (var i in data) {
        var node = data[i];
        renderReport( node);
    }


    //fire the chain of filters
    setTimeout( function(){
        filters[0].filter(); 
    }, 0 );



    //update the modal show list of reports to user
    var $modal = $("#modal");

    $modal.find(".btn-group .btn").on("click", function () {
        var $el = $(this);
        $("#reportColor").val($el.data("type"));
    })

    var $sel = $("#reportList");
    for (var i in availableReports) {
        var label = availableReports[i];
        $sel.append($("<option>", {
            "value": i,
            "text": label + " Report"
        }));
    }

    //when use selected a kind of report and click on "Done"
    $modal.find("#doneBtn").on("click", function () {

        $modal.modal("hide");

        var id = $sel.val();
        var label = $("#reportTitle").val();

        if (label == undefined || label == "")
            label = availableReports[id] + " Report";

        var node = {
            id: "custom-report-" + MMTDrop.tools.getUniqueNumber(),
            title: label,
            width: 12,
            height: 4,
            x: 0,
            y: 0,
            type: $("#reportColor").val(),
            userData: {
                fn: id
            }
        };

        Grid.add_widget(node);
        Grid.save_grid();

        renderReport(node);

    });
    
    
    
    setTimeout(function(){
        var p = fPeriod.getDistanceBetweenToSamples() * 1000;
        if( p <= 60*1000 )
            p = 60*1000;
        setTimeout( function(){
            location.reload();
            throw new Error("Stop");
        }, p);
    }, 100);

});