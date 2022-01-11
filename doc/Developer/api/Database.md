## Database

*Format*: `MMTDrop.Database`



*Description*: A class representing data getting from server

*Kind*: static class of [`MMTDrop`](typedef#markdown-header-mmtdrop)  


* [`.Database`](#markdown-header-database)
    * [`new MMTDrop.Database(param, [dataProcessingFn], [isAutoLoad])`](#markdown-header-mmtdropdatabase)
    * [`.stat`](#markdown-header-stat) : `object`
    * [`.data()`](#markdown-header-data) ⇒ [`Data`](typedef#markdown-header-data)
    * [`.data(val)`](#markdown-header-data) ⇒ [`Database`](Database)
    * [`.reload([new_param])`](#markdown-header-reload)
    * [`.reset()`](#markdown-header-reset)
    * [`.onMessage(callback, userData)`](#markdown-header-onmessage)
    * [`.stat.splitDataByProbe()`](#markdown-header-statsplitdatabyprobe)
    * [`.stat.getProbes()`](#markdown-header-statgetprobes) ⇒ `Array.<string>`
    * [`.stat.filter(criteria)`](#markdown-header-statfilter) ⇒ [`Data`](typedef#markdown-header-data)


### MMTDrop.Database

*Format*: `new MMTDrop.Database(param, [dataProcessingFn], [isAutoLoad])`


*Parameters*:

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| param | [`DatabaseParam`](typedef#markdown-header-databaseparam) |  |  |
| [dataProcessingFn] | [`DatabaseProcessFn`](typedef#markdown-header-databaseprocessfn) |  | processing data |
| [isAutoLoad] | `boolean` | false | auto load data for the first call of `data()` |


### stat

*Format*: `database.stat` :`object`

*Description*: Statistic

*Kind*: instance property of [`Database`](Database)  


### data

*Format*: `database.data()` ⇒[`Data`](typedef#markdown-header-data)

*Description*: Get data of database

*Kind*: instance method of [`Database`](Database)  


*Returns*: [`Data`](typedef#markdown-header-data) - data  

### data

*Format*: `database.data(val)` ⇒[`Database`](Database)

*Description*: Set data

*Kind*: instance method of [`Database`](Database)  


*Returns*: [`Database`](Database) - this  

*Parameters*:

| Param | Type |
| --- | --- |
| val | [`Data`](typedef#markdown-header-data) | 


### reload

*Format*: `database.reload([new_param])`

*Description*: Reload data from MMT-Operator.

*Kind*: instance method of [`Database`](Database)  

*See*: [MMTDrop.tools#mergeObjects](tools#markdown-header-mergeobjects)  

*Parameters*:

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [new_param] | [`DatabaseParam`](typedef#markdown-header-databaseparam) |  | a new parameter of database.  The new parameter will merge with the current one of the database. |


### reset

*Format*: `database.reset()`

*Description*: This resets any changes of data.

*Kind*: instance method of [`Database`](Database)  


### onMessage

*Format*: `database.onMessage(callback, userData)`

*Description*: Register a callback when receiving a new message in realtime from MMT-Operator.

*Kind*: instance method of [`Database`](Database)  


*Parameters*:

| Param | Type | Description |
| --- | --- | --- |
| callback | `function` | The callback will be passed two paramenters: the received message and the `userData` |
| userData | `object` |  |


### stat.splitDataByProbe

*Format*: `database.stat.splitDataByProbe()`

*Description*: Group data by probeID

*Kind*: instance method of [`Database`](Database)  


### stat.getProbes

*Format*: `database.stat.getProbes()` ⇒`Array.<string>`

*Description*: Get set of probe

*Kind*: instance method of [`Database`](Database)  


*Returns*: `Array.<string>` - list of probe Ids existing in data  

### stat.filter

*Format*: `database.stat.filter(criteria)` ⇒[`Data`](typedef#markdown-header-data)

*Description*: Filter out data that do not satisfy some criteria.This function does not change data `Database.data()`

*Kind*: instance method of [`Database`](Database)  


*Returns*: [`Data`](typedef#markdown-header-data) - data after filtering out.  

*Parameters*:

| Param | Type | Description |
| --- | --- | --- |
| criteria | `Array.<{id: Value, data: Array.<object>}>` | List of criteria to retain data.  It states that each element `msg` of `Database.data()` having `msg[id]` equals to one of element in `data`. |


|                                                           |
|----------------------------------------------------------:|
|*documentation generated on Tue, 28 Apr 2015 14:25:17 GMT*|