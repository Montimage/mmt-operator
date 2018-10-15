var arr = [
   {
      id: "unknown_traffic",
      title: "Unknown Statistic",
      x: 0,
      y: 0,
      width: 12,
      height: 6,
      type: "success",
      userData: {
         fn: "createReport"
      }
   }
   ];


var availableReports = {}

MMTDrop.callback = {
      chart : {
         afterRender : loading.onChartLoad
      }
};

var ReportFactory = {};

ReportFactory.createReport = function () {
   //fPeriod.hide();
   
   //mongoDB aggregate
   const match = {}; //
   //match[ COL.APP_ID.id ] = 0; //unknown app
   
   const group = { _id : {} };
   [COL.APP_PATH.id, 
      COL.IP_SRC.id, COL.IP_DST.id
   ].forEach( function( el ){
      group["_id"][ el ] = "$" + el; 
   });
   
   //total
   [ COL.DATA_VOLUME.id, COL.PACKET_COUNT.id ].forEach( function( el ){
      group[ el ] = {"$sum": "$" + el};
   });
   
   //first
   [COL.APP_PATH.id, COL.TIMESTAMP.id, COL.MAC_SRC.id, COL.MAC_DST.id,
      COL.IP_SRC.id, COL.IP_DST.id,
      COL.THREAD_NUMBER.id,
      COL.START_TIME.id //start time
   ].forEach( function( el ){
      group[ el ] = {"$first":  "$" + el}; 
   });
   
   //got all thread_id
   group[ COL.THREAD_NUMBER.id ] = {"$addToSet": "$" + COL.THREAD_NUMBER.id };
   
   group[ "end-time" ]   = {"$last":  "$" + COL.TIMESTAMP.id}; //end time
   
   const sort = {};
   sort[ COL.DATA_VOLUME.id ] = -1;
   //database
   const database = new MMTDrop.Database({collection: "data_unknown_flows_real", 
       action: "aggregate",
       no_group : true, 
       no_override_when_reload: false,
       query: [{"$group": group}, {$sort: sort}, {$limit: 1000}], 
       raw: true});
   
   const columnsToShow = [
      {
         id: COL.TIMESTAMP.id,
         label: "Start time"
      },
      {
         id: "duration",
         label: "Duration (s)",
         align: "right"
      },
//      {
//         id: COL.APP_PATH.id,
//         label: "Protocol path"
//      },
      {
         id: COL.MAC_SRC.id,
         label: "local MAC"
      },{
         id: COL.MAC_DST.id,
         label: "remote MAC"
      },{
         id: COL.IP_SRC.id,
         label: "local IP"
      },{
         id: COL.IP_DST.id,
         label: "remote IP"
      },
      {
         id: COL.PACKET_COUNT.id,
         label: "#Packets",
         align: "right"
      },
      {
         id: COL.DATA_VOLUME.id,
         label: "Data (B)",
         align: "right"
      },{
         id: "packetSize",
         label: "Avg. Pkt Size (B)",
         align: "right"
      },{
         id: "percentData",
         label: "% Total Data",
         align: "right"
      },
      {
         id: "pcap_file",
         label: "Pcaps",
         align: "center"
      },{
         id: "detail",
         label: "",
         align: "center"
      }
      ];

   
   //detail of each property
   const STAT = {};
   //database to calculate total data/packets
   const totalDB = new MMTDrop.Database({collection : "data_total_real", action : "aggregate", raw: true })
   
   function _percentage( a, b ){
      if( b )
         a = a/b;
      
      return ' <span style="color:grey">(' + (a*100).toFixed(2) + "%)</span>";
   }
   
   function _showTotalStatistics(){
      //get total data in this period
    //load data corresponding to the selected apps
      const $match = {};
      $match[ COL.TIMESTAMP.id ] = {"$gte": STAT.startTime, "$lte": STAT.endTime };
      const $group = { _id: null }; //total
      [ COL.DATA_VOLUME.id, COL.PACKET_COUNT.id, COL.ACTIVE_FLOWS.id
      ].forEach( function( el, index){
        $group[ el ] = {"$sum" : "$" + el};
      });

      totalDB.reload( { query : [{$match: $match},  {$group: $group}] }, function( new_data ){
         //got data
         var msg = new_data[0];
         
         if( msg == undefined )
            return;
         
         //show the total statistic
         $("#mmt-verdict-total").html( '<div style="margin-left:80px">'
            + "<u>Start time</u>: "            + MMTDrop.tools.formatDateTime( STAT.startTime )
            + ", <u>Duration</u>: "            + MMTDrop.tools.formatInterval( (STAT.endTime - STAT.startTime)/1000, true )
            
            + ",<br/> <u>Number of flows</u>: "+ MMTDrop.tools.formatLocaleNumber( STAT.sessionCount )
            + _percentage( STAT.sessionCount, msg[ COL.ACTIVE_FLOWS.id ] )
            
            + ", <u>Total packets</u>: "       + MMTDrop.tools.formatLocaleNumber( STAT.packetCount )
            +  _percentage( STAT.packetCount, msg[ COL.PACKET_COUNT.id ] )
            
            + ", <u>Total data (B)</u>: "      + MMTDrop.tools.formatLocaleNumber( STAT.dataVolume )
            +  _percentage( STAT.dataVolume, msg[ COL.DATA_VOLUME.id ] )
            
            + ", <u>Avg. bandwidth (bps)</u>: " + MMTDrop.tools.formatLocaleNumber( STAT.dataVolume * 8 / ( STAT.endTime - STAT.startTime) )
            + "</div> ");
      } );
   }

   var PCAP_LIST = null;
   
   var cTable = MMTDrop.chartFactory.createTable({
      getData: {
         getDataFn: function (db) {
            const arr = db.data();
            
            //total stat values
            STAT.startTime = Number.MAX_VALUE,
            STAT.endTime = 0,
            STAT.packetCount = 0,
            STAT.dataVolume = 0;
            STAT.sessionCount = arr.length;
            
            
            for( var i=0; i<arr.length; i++ ){
               var msg = arr[i];
               
               //calculate the total statistic values
               if( msg[ COL.TIMESTAMP.id ] < STAT.startTime )
                  STAT.startTime = msg[ COL.TIMESTAMP.id ];
               if( msg[ "end-time" ] > STAT.endTime )
                  STAT.endTime = msg[ "end-time" ];
               STAT.packetCount += msg[ COL.PACKET_COUNT.id ];
               STAT.dataVolume  += msg[ COL.DATA_VOLUME.id ]
            }
            
            for( var i=0; i<arr.length; i++ ){
               var msg = arr[i];
               var match = {};
               match[ COL.IP_SRC.id ] = msg[ COL.IP_SRC.id ];
               match[ COL.IP_DST.id ] = msg[ COL.IP_DST.id ];
               match = JSON.stringify( match );
               
               //friendly values to show
               msg[ "percentData" ]      = MMTDrop.tools.formatPercentage( msg[ COL.DATA_VOLUME.id ] / STAT.dataVolume );
               var duration = msg[ "end-time" ] - msg[ COL.TIMESTAMP.id ];
               //we donn't know exactly duration of one flow as we do sample for each x seconds (5s for example)
               //so if a flow starts then ends inside the sample period, i.e., the duration is zero, 
               //then we say its duration is x seconds ????
               if( duration == 0 )
                  msg[ "duration"  ] = MMTDrop.config.probe_stats_period;
               else
                  duration /= 1000; //milisecond => second
               
               msg[ "duration" ] = '<span title="' + MMTDrop.tools.formatInterval( duration, true ) + '">'+ duration +'</span>';
               msg["pcap_file"]          = '<span class="data-pcap-files" data-thread-id="' + JSON.stringify( msg[COL.THREAD_NUMBER.id] ) + '"'
                  + ' data-timestamp="'+ msg[ COL.TIMESTAMP.id ] + '"'
                  + ' data-localip="'  + msg[ COL.IP_SRC.id ] +'"'
                  + ' data-remoteip="' + msg[ COL.IP_DST.id ] +'"'
                  + '><i class = "fa fa-spinner fa-pulse fa-fw"/></span>';
               
               msg[ COL.TIMESTAMP.id ]   = MMTDrop.tools.formatDateTime( msg[ COL.TIMESTAMP.id ] );
               
               if( msg[ COL.PACKET_COUNT.id] == 0 )
                  msg["packetSize"] = 0;
               else
                  msg["packetSize"] = Math.round( msg[ COL.DATA_VOLUME.id] / msg[ COL.PACKET_COUNT.id] );
               
               msg[ COL.DATA_VOLUME.id]  = MMTDrop.tools.formatLocaleNumber( msg[ COL.DATA_VOLUME.id ] );
               msg[ COL.PACKET_COUNT.id] = MMTDrop.tools.formatLocaleNumber( msg[ COL.PACKET_COUNT.id ] );
               
               
               
               var fun = "createPopupReport('unknown_flows_real'," //collection
                  //+ COL.SESSION_ID.id  //key
        	      //+",'" + msg[ "_id" ] //id
            	  + "'match'"
            	   + ", this.getAttribute('match')"
                  +", 'unknown flows " + msg[ COL.IP_SRC.id ]  + " &#x21cb; " + msg[ COL.IP_DST.id ]  //title 
                  //+"', " + fProbe.selectedOption().id //probe_id
                  +"', undefined"
                  + ", true" //no_group
                  //+ ", true" //no_override_when_reload
                  + " )";
               msg["detail"] = '<a title="Click to show graph" onclick="'+ fun +'" match=\''+ match +'\'><i class="fa fa-line-chart" aria-hidden="true"></i></a>';
            }
            
            return {
               columns: columnsToShow,
               data   : arr
            };
         }
      },
      __bgPercentage:{
         table : ".dataTables_scrollBody",
         column: 12, //index of column, start from 1
         css   : "bg-img-1-red-pixel"
      },
      chart: {
         "order": [[0, "asc"]],
         dom: "<'row' <'col-sm-9'<'#mmt-verdict-total'>><'col-sm-3'f>><'dataTables_scrollBody overflow-auto-xy 't><'row'<'col-sm-3'l><'col-sm-9'p>>",
      },
      afterEachRender: function (_chart) {
         _showTotalStatistics();
         ///configuration of interface: arrange components
         //hide the filers of report (not the one of Datatable)
         $("#report_filters").hide();

         var table = _chart.chart;
         if( table == undefined )
            return;

         //updateTotalVerdictDisplay();

         table.on("draw.dt", function () {
            var $div = $('.dataTables_scrollBody');
            var h = $div.parents().filter(".grid-stack-item-content").height() - 120;
            $div.css('height', h);
            $div.css('margin-top', 10);
            $div.css('margin-bottom', 10);
            $div.children().filter("table").css( "border-top", "thin solid #ddd" );
            
            _updatePcapFiles();
         });

         //jump to the last page of table
         table.api().page('last');

         //show 25 items/page
         table.DataTable().page.len(10).draw(false); //either 5, 10, 25, 50, 100

         //resize when changing window size
         $(window).resize(function () {
            if (table)
               table.api().draw(false);
         });

         MMTDrop.tools.ajax("/info/file/list_pcap_dump",
            //data
            {},
            "GET", //method
            //callback
            function( data ){
               //Data is an array of file name
               if( data.length == 0 )
                  return;
               
               PCAP_LIST = data;
               if( typeof _updatePcapFiles == "function" )
                  _updatePcapFiles();
            });
      }
   });
   
   //update pcap file name
   window._updatePcapFiles = function(){
      if( PCAP_LIST == undefined )
         return;

      $("head").append($('<style type="text/css">.pcapFile:visited {color: grey !important;}</style>') );

      //for each cell in "Pcap file" column
      $(".data-pcap-files").each( function( index, el ){
         const $el = $(el);
         $el.html("");

         const timestamp = parseInt( $el.data("timestamp") ) / 1000; //mili => second
         const threadIds = $el.data("thread-id");
         if( ! Array.isArray( threadIds ))
            return;
         
         //
         //for each pcap file
         for( var i=0; i<PCAP_LIST.length; i++ ){
            var file = PCAP_LIST[i];
            //must be in the same thread
            if( threadIds.indexOf( file.thread ) == -1 )
               continue;
            //must be in the same period
            if( timestamp >= file.start && timestamp < file.end ){
               $el.append($(" <a>", {
                  "title": "Download packets of thread " + file.thread 
                           + "\n from " + MMTDrop.tools.formatDateTime( file.start * 1000 )
                           + "\n to "   + MMTDrop.tools.formatDateTime( file.end * 1000 ),
                  "class": "pcapFile",
                  "href" : "/info/file/extract_pcap_dump/" + file.file + "/" +  $el.data("localip") + "/" +  $el.data("remoteip") ,
                  "html" : '<i class="fa fa-file" aria-hidden="true">'
               }));
            }
         }
      });
   }
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
            [{object: cTable}]
   );

   return report;
}
