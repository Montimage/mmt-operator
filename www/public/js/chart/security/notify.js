var arr = [
   {
      id: "security",
      title: "Security Alerts",
      x: 0,
      y: 7,
      width: 12,
      height: 7,
      type: "danger",
      userData: {
         fn: "createSecurityRealtimeReport"
      }
   }
];


var availableReports = {
      "createNodeReport":     "Security",
}

var ReportFactory = {};

ReportFactory.createSecurityRealtimeReport = function (fPeriod, opt) {
   //hide period filter
   fPeriod.hide();
   //hide the report itself
   //$("#" + opt.domID).parent().hide();
   
   
   const obj = {
         type : "<div>",
         attr: {
            class: "container-fluid", 
            style: "padding-top: 20px; padding-bottom: 10px"
         },
         children: [{
            type: "<div>",
            attr: {
               class: "col-md-12", 
            },
            children: [{
               type : "<table>",
               attr : {
                  class: "table table-striped table-bordered table-condensed dataTable no-footer",
                  id   : "alertList"
               },
               children : [
                  {
                     type: "<thead>",
                     children: [{
                        type: "<tr>",
                        children:[{
                           type: "<th>",
                           attr: {
                              html: "Timestamp"
                           }
                        },{
                           type: "<th>",
                           attr: {
                              html: "Notifications"
                           }
                        }]
                     }]
                  }
                  ]
            }]
         }]
   };
   
   $("#security-content" ).html( MMTDrop.tools.createForm( obj ) ) ;
   
   //list of IP being blocked
   const blockedIPs = {};
   
   const COL = MMTDrop.constants.SecurityColumn;
   let lastTimestamp = 0;
   
   
   //get IPs from a security alert
   function getIp( msg, cb ){
      const history = msg[ COL.HISTORY.id ];
      for( const i in history ){
         const event = history[ i ].attributes;
         for( const j in event ){
             const atts = event[j];
             for( const key in atts )
                 if( key.indexOf( "ip.src") === 0 || key.indexOf( "ip.dst") === 0 ){
                     const ip = atts[key];
                     const ts = history[ i ].timestamp;
                     cb( ip, ts );
                 }
         }
     }
   }
   function processSecurityAlert( msg ){
      //get all IPs in the alert msg
      getIp( msg, function( ip, ts ){
         //the ip has been processed
         if( blockedIPs[ip] !== undefined )
            return;
         
         //remember the ip
         blockedIPs[ip] = ts;
         
         //ip
         
         const html = '<tr><td>' + MMTDrop.tools.formatDateTime( ts*1000 ) + '</td><td>'
                     + ' Blocked ' + ip + "</td></tr>";
         $("#alertList").prepend( $(html) );         
      });
   };
   
   //database containing all security alerts
   const database = new MMTDrop.Database({
      format: MMTDrop.constants.CsvFormat.SECURITY_FORMAT,
   }, null, false);

   //callback once database received data from server
   database.afterReload( function( data ){
      //console.log( data );
      data.forEach( processSecurityAlert );
   });
   
   
   let reloadTimer = null;
   //override the default onchange event of fAutoReload
   fAutoReload.onchange = function( isEnable ){
      //clear the old timer if any
      if( reloadTimer )
         clearInterval( reloadTimer );
      
      //when this filter is disable => do nothing
      if( !isEnable )
         return;
      
      //reload database each second
      reloadTimer = setInterval( function(){
         database.reload();
      }, 1000 );
   };
};
