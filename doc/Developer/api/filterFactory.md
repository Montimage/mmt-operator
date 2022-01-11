## filterFactory

*Format*: `MMTDrop.filterFactory` :`object`



*Description*: A namespace to create some instances of [Filter](Filter)

*Kind*: static namespace of [`MMTDrop`](typedef#markdown-header-mmtdrop)  


* [`.filterFactory`](#markdown-header-filterfactory) : `object`
    * [`.createFlowMetricFilter()`](#markdown-header-createflowmetricfilter) ⇒ [`Filter`](Filter)
    * [`.createMetricFilter()`](#markdown-header-createmetricfilter) ⇒ [`Filter`](Filter)
    * [`.createPeriodFilter()`](#markdown-header-createperiodfilter) ⇒ [`Filter`](Filter)
    * [`.createProbeFilter()`](#markdown-header-createprobefilter) ⇒ [`Filter`](Filter)
    * [`.createAppFilter()`](#markdown-header-createappfilter) ⇒ [`Filter`](Filter)
    * [`.createClassFilter()`](#markdown-header-createclassfilter) ⇒ [`Filter`](Filter)


### createFlowMetricFilter

*Format*: `filterFactory.createFlowMetricFilter()` ⇒[`Filter`](Filter)

*Description*: Create a filter metric for flow statistic.The list of options is defined by [FlowMetricFilter](constants#markdown-header-flowmetricfilter).This filter does not filter out its database.

*Kind*: static method of [`filterFactory`](filterFactory)  


*Returns*: [`Filter`](Filter) - filter  

### createMetricFilter

*Format*: `filterFactory.createMetricFilter()` ⇒[`Filter`](Filter)

*Description*: Create a filter matric for general statistic.This filter does not filter out its database.

*Kind*: static method of [`filterFactory`](filterFactory)  


*Returns*: [`Filter`](Filter) - filter  

### createPeriodFilter

*Format*: `filterFactory.createPeriodFilter()` ⇒[`Filter`](Filter)

*Description*: Create a period filter for any database.This filter will `reload` its database with a new `period` parameter, see [reload](Database#markdown-header-reload).The list of options is defined by [period](constants#markdown-header-period)

*Kind*: static method of [`filterFactory`](filterFactory)  


*Returns*: [`Filter`](Filter) - filter  

### createProbeFilter

*Format*: `filterFactory.createProbeFilter()` ⇒[`Filter`](Filter)

*Description*: Create a probe filter.This filter retains in database only element having `PROBE_ID.id` equals to `id` of the current selected option.The list of options is automatically updated by probe Ids existing in `database` its attached to.

*Kind*: static method of [`filterFactory`](filterFactory)  


*Returns*: [`Filter`](Filter) - filter  

### createAppFilter

*Format*: `filterFactory.createAppFilter()` ⇒[`Filter`](Filter)

*Description*: Create an application filter.This filter retains only in database the element having `APP_ID.id` equals to `id` of the current selected option.Its lits of options is automatically updated by application Ids existing in the `database` the filter attached to.

*Kind*: static method of [`filterFactory`](filterFactory)  


*Returns*: [`Filter`](Filter) - filter  

### createClassFilter

*Format*: `filterFactory.createClassFilter()` ⇒[`Filter`](Filter)

*Description*: Create an application filter.This filters retains only in database the element having `APP_ID.id` in the current selected class, see [CategoriesAppIdsMap](constants#markdown-header-categoriesappidsmap).The list of options is automatically updated by classes existing in `database` its attached to.

*Kind*: static method of [`filterFactory`](filterFactory)  


|                                                           |
|----------------------------------------------------------:|
|*documentation generated on Tue, 28 Apr 2015 14:25:18 GMT*|