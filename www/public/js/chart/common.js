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

*/

MMTDrop.setOptions({
    //serverURL: "http://localhost:8088",
});


if( ReportFactory === undefined )
    var ReportFactory = {};

for (var i in ReportFactory)
        MMTDrop.reportFactory[i] = ReportFactory[i];

ReportFactory = MMTDrop.reportFactory;

var fPeriod = MMTDrop.filterFactory.createPeriodFilter();
var fProbe  = MMTDrop.filterFactory.createProbeFilter();
var reports = [];
var COL     = MMTDrop.constants.StatsColumn;
//this database is reload firstly when a page is loaded
//this db contains status of probe, interval to get data of reports
var status_db = new MMTDrop.Database({collection: "status"});

var fAutoReload = {
  hide : function(){
    $("#autoReload").hide();
    $("#isAutoReloadChk").prop("checked", false);
  }
};

$(function () {
    'use strict'

    if( typeof arr === "undefined" ){
        console.error("No Reports are defined!");
        $("#waiting").hide();
        return;
    }

    $("#waiting").on("click", function(){
            $("#waiting").hide();
    });

    if (fPeriod == undefined) {
        throw new Error("Need to defined fPeriod filter")
    }
    //init toolbar-box
    if( arr.length == 1 )
      $("#deleteBtn").hide();
    if( MMTDrop.tools.object2Array(availableReports).length == 0 )
      $("#addBtn").hide();

    //fProbe.renderTo("toolbar-box");

    fPeriod.renderTo("toolbar-box");
    fPeriod.onChange( loading.onShowing  );

    var renderReport = function (node) {
        try {
            var key = node.userData.fn;
            var cb = ReportFactory[key];
            if (MMTDrop.tools.isFunction(cb)) {
                var rep = ReportFactory[key]( fPeriod );
                if (rep) {
                    rep.renderTo(node.id + "-content");
                    reports.push( rep );
                }else{
                  //rep is not a real report (it could be a form, ...)
                  //=> hide loading icon
                  loading.onHide();
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



    //reload databases of reports
    var reloadReports = function( data, group_by ){
      //there are no reports
      if (reports.length == 0 ){
        loading.onHide();
      }else{
        var probe_id = MMTDrop.tools.getURLParameters().probe_id;
        try{
            for( var i=0; i<reports.length; i++ ){
              var param = reports[ i ].database.param;
              var param = {period: status_db.time, period_groupby: group_by};
              if( probe_id != undefined ){
                param.probe = [ parseInt( probe_id ) ];

                var $match = {};
                $match[ COL.PROBE_ID.id ] =  parseInt( probe_id ) ;
                param.query = [{$match: $match}];
              }


              reports[ i ].database.reload( param , function(new_data, rep){
                    //for each element in dataFlow array
                    for( var j in rep.dataFlow ){
                        var filter = rep.dataFlow[ j ];
                        if(!filter) return;

                        filter = filter.object;
                        if (filter instanceof MMTDrop.Filter)
                            filter.filter();
                        else if( filter ){ //chart
                            filter.attachTo( rep.database );
                            filter.redraw();
                        }
                    }
                }, reports[ i ]);
            }
        }catch ( err ){
            loading.onHide();
            console.error( err );
        }
      }//end if
    }

    fPeriod.onFilter( function( opt ){
        console.log("fProbe filtering");
        var period = MMTDrop.tools.getURLParameters().period;
        if( period == undefined )
          status_db.reload({ action: fPeriod.getSamplePeriodTotal()*1000 }, reloadReports, opt.id );
        else
          status_db.reload({ action: period }, reloadReports, opt.id );
    });

    //fire the chain of filters
    setTimeout( function(){
        fPeriod.filter();
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

        window.location.reload();
        //renderReport(node);

    });


    var reloadCount = 0;
    var auto_reload_timer = null;
    function start_auto_reload_timer(){
        if( auto_reload_timer )
            clearInterval( auto_reload_timer );
        var p = fPeriod.getDistanceBetweenToSamples() * 1000;
        if( p <= 60*1000 )
            p = 60*1000;
        //p = 10*1000;
        auto_reload_timer = setInterval( function(){
            reloadCount ++;
            console.log( reloadCount + " Reload ======>");

            if( reloadCount >= 10 ){
                location.reload();
                throw new Error("Stop");
            }

            loading.onShowing();
            fPeriod.filter();
        }, p);
    }
    $("#isAutoReloadChk").change( function(){
        var is_on = $(this).is(":checked");
        console.log( "autoReload: " + is_on );
        MMTDrop.tools.localStorage.set("autoreload", is_on, false);
        if( is_on ){
            start_auto_reload_timer();
        }else{
            clearInterval( auto_reload_timer );
        }
    });


    var checked = MMTDrop.tools.localStorage.get("autoreload", false);
    //checkbox default is "true"
    if(  checked === false ){
        $("#isAutoReloadChk").prop("checked", false);
    }else
        //checkbox is already checked ==> trigger its event
        $("#isAutoReloadChk").trigger("change");


    //download images
    $("#exportBtn").click( function(){
      d3.selectAll("path").attr("fill", "none");
      d3.selectAll(".tick line, path.domain, c3-ygrid").attr("stroke", "black");

      var $form = MMTDrop.tools.createDOM({
        type : "<form>",
        attr : {
          method : "POST"
        },
        children:[{
          type : "<input>",
          attr : {
            name : "data",
          }
        }]
      });

      function render_image( index ){
        if( index >= data.length ) return;
        var node       = data[index];
        var targetElem = $("#" + node.id);

        console.log( "Rendering image for tab." + node.id)

        // First render all SVGs to canvases
        var elements = targetElem.find('svg').map(function() {
            var svg    = $(this);
            var canvas = $('<canvas>');

            // Get the raw SVG string and curate it
            var content = svg[0].outerHTML.trim();
            canvg( canvas[0], content );

            //temporary replace the svg by the canvas
            //the svg will be put back after rendering image
            svg.replaceWith(canvas);

            return {
                svg   : svg,
                canvas: canvas
            };
        });
        //return;
        // At this point the container has no SVG, it only has HTML and Canvases.
        html2canvas( targetElem, {
          //allowTaint: true,
          letterRendering: true,
	        onrendered: function(canvas) {
            var ctx=canvas.getContext("2d");

            // Put the SVGs back in place
            elements.each(function() {
              this.canvas.replaceWith(this.svg);
            });

            //add water mark
	    	    ctx.font      = "14px Arial";
		        ctx.fillStyle = "grey";
	    	    ctx.fillText("Montimage", 15, canvas.height - 12);
            //get image based_64
	    	    var image    = canvas.toDataURL("image/png");
		        var fileName = node.id + "-" + (new Date()).toLocaleString() + ".png";

            $form.attr("action", "/export?filename=" + fileName);
            $form.children().val( image );
            $form.submit();

            //for others reports
            if( index < data.length - 1 )
              setTimeout( render_image, 1000, index + 1);
	        }
	      });// end html2canvas
      }
      render_image( 0 );

    })//end $("#exportBtn").click
});
