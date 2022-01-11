## Report

*Format*: `MMTDrop.Report`



*Description*: Report

*Kind*: static class of [`MMTDrop`](typedef#markdown-header-mmtdrop)  


* [`.Report`](#markdown-header-report)
    * [`new MMTDrop.Report(title, database, filters, groupCharts, dataFlow)`](#markdown-header-mmtdropreport)
    * [`.activeCharts`](#markdown-header-activecharts) : [`Array.<Chart>`](Chart)
    * [`.renderTo(elemID)`](#markdown-header-renderto)


### MMTDrop.Report

*Format*: `new MMTDrop.Report(title, database, filters, groupCharts, dataFlow)`


*Parameters*:

| Param | Type | Description |
| --- | --- | --- |
| title | `string` | title of report |
| database | [`Database`](Database) |  |
| filters | [`Array.<Filter>`](Filter) | list of filters |
| groupCharts | `Array.<{charts: Array.<MMTDrop.Chart>, width: number}>` | groups of charts |
| dataFlow | `DataFlow` | flow of data |


### activeCharts

*Format*: `report.activeCharts` :[`Array.<Chart>`](Chart)

*Description*: The charts being showing

*Kind*: instance property of [`Report`](Report)  


### renderTo

*Format*: `report.renderTo(elemID)`

*Description*: Render the report to an HTML element

*Kind*: instance method of [`Report`](Report)  


*Parameters*:

| Param | Type | Description |
| --- | --- | --- |
| elemID | `string` | id of the HTML element |


|                                                           |
|----------------------------------------------------------:|
|*documentation generated on Tue, 28 Apr 2015 14:25:17 GMT*|