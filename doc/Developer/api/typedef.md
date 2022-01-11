
## Objects


### MMTDrop

*Format*: `MMTDrop` :`object`


*Description*: MMTDrop An object container for all MMTDrop library functions. This class is just a container for all the objects and constants used in the library.  It is not meant to be instantiated, but to provide a namespace for library objects, constants, and functions.



## Typedefs


### Index

*Format*: `Index` :`Object`


*Description*: An object with id and label


*Properties*: 

| Name | Type |
| --- | --- |
| id | `Value` | 
| label | `string` | 



### FilterParam

*Format*: `FilterParam` :`Object`


*Description*: The parameter when creating a new filter


*Properties*: 

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| id | `id` |  |  |
| label | `string` |  |  |
| options | [`Array.<Index>`](typedef#markdown-header-index) |  | List of options |
| onchange | `function` |  |  If {param.onchange} function is defined, it will handle the changing.   If the function return `true`, the default actions     (store the change to localStorage, apply the change to its attached database)     are then executed. |



### ChartParam

*Format*: `ChartParam` :`Object`


*Description*: The parameter when creating a chart.


*Properties*: 

| Name | Type | Description |
| --- | --- | --- |
| title | `string` | title of the chart |
| ylabel | `string` |  |
| click |  | - |
| getData.getDataFn | [`ChartPrepreData`](typedef#markdown-header-chartprepredata) | a |
| getData.getDataArgs | `Object` | an argument to be passed to getData.getDataFn |
| columns | [`Array.<Index>`](typedef#markdown-header-index) | columns tobe shown. |



### ChartPrepreData

*Format*: `ChartPrepreData` ⇒`Object`


*Description*: Processing data before displaying them into charts



### ChartRenderFn

*Format*: `ChartRenderFn` :`function`


*Description*: Render a chart



### Data

*Format*: `Data` :`Array.<Array>`


*Description*: Data getting from MMT-Operator Each element of Data is an array.  The elements in the array are depended on its kind and defined by either by: - [StatsColumn](constants#markdown-header-statscolumn) - [FlowStatsColumn](constants#markdown-header-flowstatscolumn) - [HttpStatsColumn](constants#markdown-header-httpstatscolumn) - [TlsStatsColumn](constants#markdown-header-tlsstatscolumn) - [RtpStatsColumn](constants#markdown-header-rtpstatscolumn)



### DatabaseParam

*Format*: `DatabaseParam` :`Object`


*Description*: Parameters using to get data from MMT-Operator


*Properties*: 

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| period | [`period`](constants#markdown-header-period) | MINUTE | - |
| format | [`CsvFormat`](constants#markdown-header-csvformat) | 99 | kind of data |
| source | `Array.<string>` | [] | source |
| probe | `Array.<number>` | [] | probe Id |



### DatabaseProcessFn

*Format*: `DatabaseProcessFn` ⇒[`Data`](typedef#markdown-header-data)


*Description*: Processing database



### ChartData

*Format*: `ChartData` :`Array`


*Description*: Data to render to a chart - The first column = X value, cateogrie (), first column of TableChart - The next columns = Y values,





|                                                           |
|----------------------------------------------------------:|
|*documentation generated on Tue, 28 Apr 2015 14:25:17 GMT*|