## Chart

*Format*: `MMTDrop.Chart`



*Description*: A template to create a new chart.

*Kind*: static class of [`MMTDrop`](typedef#markdown-header-mmtdrop)  


* [`.Chart`](#markdown-header-chart)
    * [`new MMTDrop.Chart(renderFn, [option])`](#markdown-header-mmtdropchart)
    * [`.isVisible()`](#markdown-header-isvisible) ⇒ `boolean`
    * [`.isVisible(val)`](#markdown-header-isvisible)
    * [`.attachTo(db, [isCloneData])`](#markdown-header-attachto)
    * [`.option(val)`](#markdown-header-option)
    * [`.option()`](#markdown-header-option) ⇒ [`ChartParam`](typedef#markdown-header-chartparam)
    * [`.renderTo(elemID)`](#markdown-header-renderto)
    * [`.redraw()`](#markdown-header-redraw)
    * [`.getIcon()`](#markdown-header-geticon) ⇒ `JQueryObject`


### MMTDrop.Chart

*Format*: `new MMTDrop.Chart(renderFn, [option])`


*Parameters*:

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| renderFn | [`ChartRenderFn`](typedef#markdown-header-chartrenderfn) |  | is a callback using to render the chart to an HTML element |
| [option] | [`ChartParam`](typedef#markdown-header-chartparam) | {title:"", data: {getDataFn: null, columns: []}} |  |


### isVisible

*Format*: `chart.isVisible()` ⇒`boolean`

*Description*: Get the visibility property of the chart

*Kind*: instance method of [`Chart`](Chart)  


### isVisible

*Format*: `chart.isVisible(val)`

*Description*: Set the visibility property of the chart. The chart will be redraw when it become visible.

*Kind*: instance method of [`Chart`](Chart)  


*Parameters*:

| Param | Type |
| --- | --- |
| val | `boolean` | 


### attachTo

*Format*: `chart.attachTo(db, [isCloneData])`

*Description*: Attach the chart to a database.

*Kind*: instance method of [`Chart`](Chart)  


*Parameters*:

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| db | [`Database`](Database) |  |  |
| [isCloneData] | `boolean` | true | clone data of database.   The `redraw` method will display database on the chart.  Database can be changed before `redraw` beeing called. If this parameter is `true`, the chart will show data of `db` at  the moment of this method beeing called by preserving a copy of data. Otherwise, the chart will show data of database ah the moment of `redraw` method beeing called. |


### option

*Format*: `chart.option(val)`

*Description*: Set option property of the chart

*Kind*: instance method of [`Chart`](Chart)  

*See*: [MMTDrop.tools#mergeObject](tools#markdown-header-mergeobject)  

*Parameters*:

| Param | Type | Description |
| --- | --- | --- |
| val | [`ChartParam`](typedef#markdown-header-chartparam) | a new option will merge with the current option |


### option

*Format*: `chart.option()` ⇒[`ChartParam`](typedef#markdown-header-chartparam)

*Description*: Get option property

*Kind*: instance method of [`Chart`](Chart)  


*Returns*: [`ChartParam`](typedef#markdown-header-chartparam) - opt  

### renderTo

*Format*: `chart.renderTo(elemID)`

*Description*: Render the chart to an HTML element

*Kind*: instance method of [`Chart`](Chart)  


*Parameters*:

| Param | Type | Description |
| --- | --- | --- |
| elemID | `string` | id of the HTML element |


### redraw

*Format*: `chart.redraw()`

*Description*: Redraw the chart.This should be called to redraw the chart when:* a new option is updated by `.option(opt)`* attaching to a new database by `.attachedTo(db)`* its database being changed by a filter

*Kind*: instance method of [`Chart`](Chart)  


### getIcon

*Format*: `chart.getIcon()` ⇒`JQueryObject`

*Description*: Icon reprenting for this chart.This method must be implemented when createing a chart.

*Kind*: instance method of [`Chart`](Chart)  


*Returns*: `JQueryObject` - a DOM element  

|                                                           |
|----------------------------------------------------------:|
|*documentation generated on Tue, 28 Apr 2015 14:25:17 GMT*|