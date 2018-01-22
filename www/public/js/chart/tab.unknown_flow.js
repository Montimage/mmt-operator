var arr = [
   {
      id: "unknown_traffic",
      title: "Pcap Files of Unknown Flows",
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
   fPeriod.hide();
   
   const tableString = 
'<div style="position: absolute; top: 35px; bottom: 10px; left: 10px; right: 10px; overflow: auto">\
<table id="example" class="table table-striped table-bordered table-condensed dataTable no-footer">\
<thead>\
   <tr>\
       <th>Start Time</th>\
       <th>End Time</th>\
       <th>File Size (B)</th>\
       <th>Pcap File</th>\
   </tr>\
</thead>\
</table>\
</div>'
   
   $("#unknown_traffic-content" ).append( tableString ) ;
   $(document).ready(function() {
      $('#example').DataTable( {
          "ajax": {
             "url": "/info/file/list_pcap_dump",
             "dataSrc": ""
          },
          "columns": [
             { "data": "start", render: function( x ){ return MMTDrop.tools.formatDateTime( x*1000 )} },
             { "data": "end",   render: function( x ){ return MMTDrop.tools.formatDateTime( x*1000 )} },
             { "data": "size",  render: {
                   display: MMTDrop.tools.formatDataVolume,
                   //sort   : function( x ){ return x }
                }
             },
             { "data": "file",  render: function( x ){ return '<a href="/info/file/get_pcap_dump/' + x + '" title="Click to download">'+ x +'</a>'} },
          ],
      } );
   });
}
