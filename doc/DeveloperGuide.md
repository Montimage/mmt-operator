# Welcome

This page briefs about how to modify the MMTDrop library in order to create a new report.

On this page:

* [Architecture of a Report](#markdown-header-architecture-of-a-report)
    * [Basic elements](#markdown-header-basic-elements)
    * [Data flow](#markdown-header-data-flow)
* [Create a new Report](#markdown-header-create-a-new-report)


# Architecture of a Report

A report is created using Javascript.
It requests data from server side and visualizes them in a Web browser at client side.
There exist some kinds of reports in MMTDrop, see [[UserGuide]].
Developers can create a new kind of report based on `MMTDrop.Report` class.

## Basic elements

A report consists of three basic elements:

* [Database](Developer/api/Database): it communicates with server to get data. 
Some pre-processing can be done in database before forwarding data to filters.
The pre-defined database are: StatDB, FlowDB.
See [here](Developer/CreateDatabase) to create a new kind of database.

* [Filters](Developer/api/Filter) contains a list of filters that filter data following some criterion before being visualized by charts.
A report may have one or many filters.
The pre-defined filters are: period, probe, application, class, stat metric, flow metric.
See [here](Developer/CreateFilter) to create a new kind of filter.


* [Charts](Developer/api/Charts) contains a list of charts.
A report may have one or many charts. The charts can be put into one or many groups.  
The pre-defined charts are: line, time, scatter, pie, bar, table, tree.
See [here](Developer/CreateChart) to create a new kind of chart.

## Data flow

We need to define a data flow to combine the basic elements of a report.
An example of data flow is as the figure below.
It defines data flow getting from SERVER through DATABASE to FILTER then FILTER1.
The data flow outputting from FILTER1 is visualized by CHART1 
and it passes also through FILTER2 before being visualized by CHART2.


```

 ------------------------
|                        |
|    CHART1      CHART2  |
|      ^^         ^^     |
|      ||         ||     |
|   FILTER1 ==> FILTER2  |
|      ||                |
|      ||                |
|    FILTER              |
|      ||                |
|       ====DATABASE================= SERVER
|                        |
 ------------------------
```

# Create a new Report

A new report is created by creating a new instance of `MMTDrop.Report` class.
We need to give 5 parameters:

Name     | Type                    | Description 
---------|-------------------------|-----------
title    | `string`                | title of the report 
database | [`MMTDrop.Database`](Developer/api/Database)      |  
filters  | `Array<MMTDrop.Filter>` | List of filters  
charts   | `Array<{charts: Array<MMTDrop.Chart>, width: <1-12>}>`           | Groups of charts.
flow     | `Array<{object: <MMTDrop.ChartMMTDrop.Filter>, effect: Array }>` | Data flow in the report. `effect` takes the same format as `flow`. As the data flow in a report always start from `database`, this parameter does not need to take into account `database`.

The example below creates a report consisting of 4 filters and two charts.
The report is rendered into an HTML element having `id='content'`.

 
```
#!javascript

var database = MMTDrop.databaseFactory.createStatDB();

var fPeriod  = MMTDrop.filterFactory.createPeriodFilter();
var fProbe   = MMTDrop.filterFactory.createProbeFilter();
var fClass   = MMTDrop.filterFactory.createClassFilter();
var fMetric  = MMTDrop.filterFactory.createMetricFilter();
    
var cTable  = MMTDrop.chartFactory.createTable({
    getData:{
        getDataFn: function( db ){
            var cols = [MMTDrop.constants.StatsColumn.PACKET_COUNT,
                        MMTDrop.constants.StatsColumn.ACTIVE_FLOWS];
            return db.stat.getDataTableForChart( cols, false );
        }
    }
});
var cPie  = MMTDrop.chartFactory.createPie({
        getData: {
            getDataFn : function( db ){
                var col = [fMetric.selectedOption()];
                return db.stat.getDataTableForChart( col, false );
            }
        }
});

var dataFlow = [ {
    object : fPeriod,
    effect : [ {
        object : fProbe,
        effect : [ {
            object : fClass,
            effect : [ {
                object : fMetric,
                effect : [ {
                    object : cPie,
                    effect : []
                }]
            },{
                object : cTable,
                effect : []
            } ]
        } ]
    } ]
} ];

var report = new MMTDrop.Report(
        "Application Categories Report",    // title
        database,                           // database
        [fPeriod, fProbe, fClass, fMetric], // filers
        [                                   // chart groups
         {charts: [cPie, cTable], width: 12},
        ],
        dataFlow                           // order of data flow
);


report.renderTo('content');                 // render report to an HTML element having id='conent'
```
