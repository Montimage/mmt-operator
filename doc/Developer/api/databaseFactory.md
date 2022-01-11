## databaseFactory

*Format*: `MMTDrop.databaseFactory` :`object`



*Description*: Create new instances of [Database](Database).Add some special processing depending on kinds of data format, see [CsvFormat](constants#markdown-header-csvformat).

*Kind*: static namespace of [`MMTDrop`](typedef#markdown-header-mmtdrop)  


* [`.databaseFactory`](#markdown-header-databasefactory) : `object`
    * [`.createStatDB(param, [isAutoLoad])`](#markdown-header-createstatdb) ⇒ `MMTDrop.DatabaseStat`
    * [`.createFlowDB(param)`](#markdown-header-createflowdb) ⇒ [`Database`](Database)


### createStatDB

*Format*: `databaseFactory.createStatDB(param, [isAutoLoad])` ⇒`MMTDrop.DatabaseStat`

*Description*: Create database for statistic of traffic (format = 99)

*Kind*: static method of [`databaseFactory`](databaseFactory)  


*Returns*: `MMTDrop.DatabaseStat` - database  

*Parameters*:

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| param | [`DatabaseParam`](typedef#markdown-header-databaseparam) |  | option to get data from server. It will be overridden `format` property, e.g., `param.format=99` |
| [isAutoLoad] | `boolean` | false | if it is true, database will load automatically when its data property is call for the first time |


### createFlowDB

*Format*: `databaseFactory.createFlowDB(param)` ⇒[`Database`](Database)

*Description*: Create database for statistic of flow (format = 0)

*Kind*: static method of [`databaseFactory`](databaseFactory)  


*Parameters*:

| Param | Type | Description |
| --- | --- | --- |
| param | [`DatabaseParam`](typedef#markdown-header-databaseparam) | It will be overridden with `param.format = 0 ` |


|                                                           |
|----------------------------------------------------------:|
|*documentation generated on Tue, 28 Apr 2015 14:25:18 GMT*|