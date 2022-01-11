## Filter

*Format*: `MMTDrop.Filter`



*Description*: Filter data before visualizing them by [Chart](Chart)

*Kind*: static class of [`MMTDrop`](typedef#markdown-header-mmtdrop)  


* [`.Filter`](#markdown-header-filter)
    * [`new MMTDrop.Filter(param, filterFn, [prepareDataFn])`](#markdown-header-mmtdropfilter)
    * [`.renderTo(elemID)`](#markdown-header-renderto)
    * [`.selectedOption()`](#markdown-header-selectedoption) ⇒ [`Index`](typedef#markdown-header-index)
    * [`.selectedOption(sel)`](#markdown-header-selectedoption) ⇒ [`Filter`](Filter)
    * [`.option()`](#markdown-header-option) ⇒ [`Array.<Index>`](typedef#markdown-header-index)
    * [`.option(lst)`](#markdown-header-option) ⇒
    * [`.redraw()`](#markdown-header-redraw)
    * [`.attachTo(database)`](#markdown-header-attachto)
    * [`.onFilter(callback, userData)`](#markdown-header-onfilter)
    * [`.filter()`](#markdown-header-filter)


### MMTDrop.Filter

*Format*: `new MMTDrop.Filter(param, filterFn, [prepareDataFn])`


*Parameters*:

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| param | [`FilterParam`](typedef#markdown-header-filterparam) |  |  |
| filterFn | `function` |  | This function defines how database is filtered.  It takes the form `callback(sel, db)`:  with `sel` typed of [Index](typedef#markdown-header-index) is current selected option and `db` typed of [Database](Database) is a database the filter attached to. |
| [prepareDataFn] | `function` |  | This function may be usedful for caching data when an option being selected again. That is, instead of re-calculate/filter database  we cache data that were filtered at the first time of selecting the option and reuse for next times.   This is called when calling `.filter()`. |


### renderTo

*Format*: `filter.renderTo(elemID)`

*Description*: Render the filter into an HTML element

*Kind*: instance method of [`Filter`](Filter)  


*Parameters*:

| Param | Type | Description |
| --- | --- | --- |
| elemID | `string` | Id of the HTML element |


### selectedOption

*Format*: `filter.selectedOption()` ⇒[`Index`](typedef#markdown-header-index)

*Description*: Get the current selected option

*Kind*: instance method of [`Filter`](Filter)  


*Returns*: [`Index`](typedef#markdown-header-index) - the current selected option  

### selectedOption

*Format*: `filter.selectedOption(sel)` ⇒[`Filter`](Filter)

*Description*: Set the current selected option

*Kind*: instance method of [`Filter`](Filter)  


*Returns*: [`Filter`](Filter) - this  

*Parameters*:

| Param | Type |
| --- | --- |
| sel | [`Index`](typedef#markdown-header-index) | 


### option

*Format*: `filter.option()` ⇒[`Array.<Index>`](typedef#markdown-header-index)

*Description*: Get list of options of the filter

*Kind*: instance method of [`Filter`](Filter)  


*Returns*: [`Array.<Index>`](typedef#markdown-header-index) - lst  

### option

*Format*: `filter.option(lst)`

*Description*: Set a new list of options of the filter

*Kind*: instance method of [`Filter`](Filter)  


*Returns*: [MMTDrop.Filter] this  

*Parameters*:

| Param | Type |
| --- | --- |
| lst | [`Array.<Index>`](typedef#markdown-header-index) | 


### redraw

*Format*: `filter.redraw()`

*Description*: Redraw the filter.This should be called after updating new option by `.option(lst)`

*Kind*: instance method of [`Filter`](Filter)  


### attachTo

*Format*: `filter.attachTo(database)`

*Description*: Bind the filter to a database

*Kind*: instance method of [`Filter`](Filter)  


*Parameters*:

| Param | Type |
| --- | --- |
| database | [`Database`](Database) | 


### onFilter

*Format*: `filter.onFilter(callback, userData)`

*Description*: Register a callback after the filter filters out data.User can register more than one callback.

*Kind*: instance method of [`Filter`](Filter)  


*Parameters*:

| Param | Type | Description |
| --- | --- | --- |
| callback | `function` | It takes the form  `callback(sel, db, userData)` where: `sel` is the current selected option, `db` is database after filtering. |
| userData | `object` | It will be passed as the last parameter of `callback`. |


### filter

*Format*: `filter.filter()`

*Description*: Filter out database with the current selected option

*Kind*: instance method of [`Filter`](Filter)  


|                                                           |
|----------------------------------------------------------:|
|*documentation generated on Tue, 28 Apr 2015 14:25:17 GMT*|