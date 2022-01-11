## reportFactory

*Format*: `MMTDrop.reportFactory` :`object`



*Description*: A namespace to create several kinds of reports.

*Kind*: static namespace of [`MMTDrop`](typedef#markdown-header-mmtdrop)  


* [`.reportFactory`](#markdown-header-reportfactory) : `object`
    * [`.createRealtimeReport()`](#markdown-header-createrealtimereport) ⇒ [`Report`](Report)
        * [`~timer`](#markdown-header-timer)
    * [`.createHierarchyReport()`](#markdown-header-createhierarchyreport) ⇒ [`Report`](Report)
    * [`.createCategoryReport()`](#markdown-header-createcategoryreport) ⇒ [`Report`](Report)
    * [`.createApplicationReport()`](#markdown-header-createapplicationreport) ⇒ [`Report`](Report)
    * [`.createFlowCloudReport()`](#markdown-header-createflowcloudreport) ⇒ [`Report`](Report)
    * [`.createFlowDensityReport()`](#markdown-header-createflowdensityreport) ⇒ [`Report`](Report)


### createRealtimeReport

*Format*: `reportFactory.createRealtimeReport()` ⇒[`Report`](Report)

*Description*: Dashboard using a timeline chart to show traffic in realtime

*Kind*: static method of [`reportFactory`](reportFactory)  


*Returns*: [`Report`](Report) - report  

#### timer

*Format*: `createRealtimeReport~timer`

*Description*: A timer that will insert a dump message in order to move forward the chart when no traffic.

*Kind*: inner property of [`createRealtimeReport`](reportFactory#markdown-header-createrealtimereport)  


### createHierarchyReport

*Format*: `reportFactory.createHierarchyReport()` ⇒[`Report`](Report)

*Description*: Create a report representing the hierarchy of protocols

*Kind*: static method of [`reportFactory`](reportFactory)  


*Returns*: [`Report`](Report) - report  

### createCategoryReport

*Format*: `reportFactory.createCategoryReport()` ⇒[`Report`](Report)

*Description*: Create a report representing the cateogries of protocols

*Kind*: static method of [`reportFactory`](reportFactory)  


*Returns*: [`Report`](Report) - report  

### createApplicationReport

*Format*: `reportFactory.createApplicationReport()` ⇒[`Report`](Report)

*Description*: Create a deail report of protocols

*Kind*: static method of [`reportFactory`](reportFactory)  


*Returns*: [`Report`](Report) - report  

### createFlowCloudReport

*Format*: `reportFactory.createFlowCloudReport()` ⇒[`Report`](Report)

*Description*: Create a report represeting a cloud of traffic

*Kind*: static method of [`reportFactory`](reportFactory)  


*Returns*: [`Report`](Report) - report  

### createFlowDensityReport

*Format*: `reportFactory.createFlowDensityReport()` ⇒[`Report`](Report)

*Description*: Create a report representing the density of traffic

*Kind*: static method of [`reportFactory`](reportFactory)  


*Returns*: [`Report`](Report) - report  

|                                                           |
|----------------------------------------------------------:|
|*documentation generated on Tue, 28 Apr 2015 14:25:18 GMT*|