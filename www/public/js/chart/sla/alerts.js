var arr = [
    {
        id: "security",
        title: "SLA Metric Verification Data",
        x: 0,
        y: 7,
        width: 12,
        height: 6,
        type: "warning",
        userData: {
            fn: "createReport"
        }
    }
];


var availableReports = {
    "createNodeReport": "Security",
}

MMTDrop.callback = {
    chart: {
        afterRender: loading.onChartLoad
    }
};

var ReportFactory = {};


ReportFactory.createReport = function (fPeriod) {
    /*
     var database = new MMTDrop.Database({
         format: MMTDrop.constants.CsvFormat.SECURITY_FORMAT,
         userData: {
             type: "security"
         }
     }, null, false);
 */

    const database = new MMTDrop.Database({
        collection: "metrics_alerts",
        query: [], action: "aggregate", raw: true, no_group: true, no_override_when_reload: true
    });

    database.updateParameter = function () {
        const $match = {};
        $match["0"] = { "$gte": status_db.time.begin, "$lt": status_db.time.end };
        //$match[ 1 ] = URL_PARAM.app_id(); //app id
        $match["2"] = URL_PARAM.probe_id;
        $match["3"] = URL_PARAM.metric_id;

        return { query: [{ $match: $match }] }
    }

    var cTable = MMTDrop.chartFactory.createTable({
        getData: {
            getDataFn: function (db) {
                const data = db.data();
                for (var i = 0; i < data.length; i++)
                    data[i][0] = MMTDrop.tools.formatDateTime(data[i][0]);
                return {
                    columns: [{ id: 0, label: "Timestamp" },
                    //{id: 1, label: "App ID"},
                    { id: 2, label: "Comp. ID", align: "right" },
                    { id: 3, label: "Metric ID" },
                    { id: 4, label: "Type" },
                    { id: 5, label: "Priority" },
                    { id: 6, label: "Threshold" },
                    { id: 7, label: "Value" }],
                    data: data
                };
            }
        },
        chart: {
            order: [[5, "asc"]],
            dom: "<'row'<'col-sm-5'l><'col-sm-7'f>><'row-cursor-pointer't><'row'<'col-sm-3'i><'col-sm-9'p>>",
            deferRender: true
         },
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
        [{ object: cTable }]
    );

    return report;
};

//create report for Isolation metric
function _createIsolationReport(fPeriod) {
    const database = new MMTDrop.Database({
        collection: "data_link",
        query: [],
        action: "aggregate",
        raw: true,
        no_override_when_reload: true
    });

    const sliceId = URL_PARAM.probe_id + "";

    database.updateParameter = function () {
        const $match = {};
        //$match[GTP.TEIDs.id] = { "$exists": true };
        $match["slices"] = sliceId ;

        return {
            query: [{ $match: $match }],
            period: status_db.time,
            period_groupby: fPeriod.selectedOption().id
        };
    };
    const type = "Alert";
    var cTable = MMTDrop.chartFactory.createTable({
        getData: {
            getDataFn: function (db) {
                const data = db.data();
                return {
                    columns: [
                        { id: COL.TIMESTAMP.id, label: "Timestamp", format: MMTDrop.tools.formatDateTime },
                        { id: COL.IP_SRC.id, align: "right", label: "IP src." },
                        { id: COL.IP_DST.id, align: "right", label: "IP dst." },
                        { id: "slices", align: "right", label: "Interconnecting Slices", format: function( a) { return a.join(", ");} }
                    ],
                    data: data
                };
            }
        },
        chart: {
            order: [[3, "desc"],[0, "asc"]],
            dom: "<'row'<'col-sm-5'><'col-sm-7'f>><t><'row'<'col-sm-3'i><'col-sm-9'p>>",
            deferRender: false
         },
    });

    var report = new MMTDrop.Report(
        null,
        database,
        [],
        [
            {
                charts: [cTable],
                width: 12
            },
        ],
        [{ object: cTable }]
    );

    return report;
}

//create report for GTP limitation metric
function _createGtpLimitationReport(fPeriod) {
    const database = new MMTDrop.Database({
        collection: "data_link",
        query: [],
        action: "aggregate",
        raw: true,
        no_override_when_reload: true
    });

    const sliceId = URL_PARAM.probe_id + "";

    database.updateParameter = function () {
        const $match = {};
        $match[GTP.TEIDs.id] = { "$exists": true };
        $match["slices"] = sliceId ;

        return {
            query: [{ $match: $match }],
            period: status_db.time,
            period_groupby: fPeriod.selectedOption().id
        };
    };
    const type = "Alert";
    var cTable = MMTDrop.chartFactory.createTable({
        getData: {
            getDataFn: function (db) {
                const data = db.data();

                return {
                    columns: [
                        { id: COL.TIMESTAMP.id, label: "Timestamp", format: MMTDrop.tools.formatDateTime },
                        { id: COL.IP_SRC.id, align: "right", label: "IP src." },
                        { id: COL.IP_DST.id, align: "right", label: "IP dst." },
                        { id: "slices",  align: "right", label: "Inter. Slices", format: function( a) { return a.join(", ");} },
                        { id: GTP.TEIDs.id,  align: "right", label: "TEIDs", format: function(a) { return a.sort().join(", ");} },
                        { id: GTP.TEIDs.id,  align: "right", label: "#TEIDs", format: function(a) { return a.length;} }
                    ],
                    data: data
                };
            }
        },
        chart: {
            order: [[5, "desc"],[0, "asc"]],
            dom: "<'row'<'col-sm-5'><'col-sm-7'f>><t><'row'<'col-sm-3'i><'col-sm-9'p>>",
            deferRender: false
         },
    });

    var report = new MMTDrop.Report(
        null,
        database,
        [],
        [
            {
                charts: [cTable],
                width: 12
            },
        ],
        [{ object: cTable }]
    );

    return report;
}


const metric_id = URL_PARAM.metric_id;
if (metric_id.indexOf("isolation_access") !== -1)
    ReportFactory.createReport = _createIsolationReport;
else if( metric_id.indexOf("limit_gtp") !== -1 )
    ReportFactory.createReport = _createGtpLimitationReport;