var arr = [
    {
        id: "traffic",
        title: "Traffic",
        x: 0,
        y: 0,
        width: 12,
        height: 4
    },
    {
        id: "protocol",
        title: "Protocols",
        x: 0,
        y: 4,
        width: 12,
        height: 4,
        type: "danger"
    },
    {
        id: "node",
        title: "Nodes",
        x: 0,
        y: 8,
        width: 12,
        height: 4,
        type: "info"
    }
    
        ];
Grid.together(arr);

MMTDrop.setOptions({
    serverURL: "http://192.168.0.40:8088",
});

var fProbe = MMTDrop.filterFactory.createProbeFilter();
var fPeriod = MMTDrop.filterFactory.createPeriodFilter();

fProbe.renderTo("toolbar-box");
fProbe.onFilter( function(sel, db){
    EVENTS.publish("probe-change", {select: sel, database: db});
})

fPeriod.renderTo("toolbar-box");

var database = MMTDrop.databaseFactory.createStatDB();
fProbe.attachTo( database);
fPeriod.attachTo(database);
fPeriod.onFilter( function( val, db){
    fProbe.attachTo( db );
    fProbe.filter();
} )


//var report = ReportFactory.createRep(fProbe, database);
//report.renderTo("traffic-content");

var rep = ReportFactory.createTrafficReport(fProbe, database);
rep.renderTo("traffic-content");

var rep2 = ReportFactory.createProtocolReport(fProbe, database);
rep2.renderTo("protocol-content");

var rep3 = ReportFactory.createNodeReport(fProbe, database);
rep3.renderTo("node-content");


fPeriod.filter();