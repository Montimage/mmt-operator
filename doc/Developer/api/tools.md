## tools

*Format*: `MMTDrop.tools` :`object`



*Description*: A set of support tools

*Kind*: static namespace of [`MMTDrop`](typedef#markdown-header-mmtdrop)  


* [`.tools`](#markdown-header-tools) : `object`
    * [`.object2Array(obj)`](#markdown-header-object2array) ⇒ `Array`
    * [`.getFirstElement(obj)`](#markdown-header-getfirstelement) ⇒ `object`
    * [`.mergeObjects(obj1, obj2)`](#markdown-header-mergeobjects) ⇒ `object`
    * [`.cloneData(obj)`](#markdown-header-clonedata) ⇒ `object`
    * [`.getUniqueNumber()`](#markdown-header-getuniquenumber) ⇒ `number`
    * [`.capitalizeFirstLetter(str)`](#markdown-header-capitalizefirstletter) ⇒ `string`
    * [`.isFunction(callback)`](#markdown-header-isfunction) ⇒ `boolean`
    * [`.isNumber(n)`](#markdown-header-isnumber) ⇒ `boolean`
    * [`.splitData(data, col)`](#markdown-header-splitdata) ⇒ `Object`
    * [`.splitDataByGroupAndSubgroup()`](#markdown-header-splitdatabygroupandsubgroup) ⇒ `Object`
    * [`.sumUp(data, colSums)`](#markdown-header-sumup) ⇒ `Object`
    * [`.sumByGroup()`](#markdown-header-sumbygroup) ⇒ `Object`
    * [`.sumByGroups(data, colsToSum, colsToGroup)`](#markdown-header-sumbygroups) ⇒ [`Data`](typedef#markdown-header-data)
    * [`.sumByGroupAndSubgroup()`](#markdown-header-sumbygroupandsubgroup) ⇒ `Object`


### object2Array

*Format*: `tools.object2Array(obj)` ⇒`Array`

*Description*: Convert an object to an array

*Kind*: static method of [`tools`](tools)  


*Parameters*:

| Param | Type | Description |
| --- | --- | --- |
| obj | `Object` | object tobe converted |


### getFirstElement

*Format*: `tools.getFirstElement(obj)` ⇒`object`

*Description*: Get the first element of an Object or Array

*Kind*: static method of [`tools`](tools)  


*Returns*: `object` - the first elemen  

*Parameters*:

| Param | Type |
| --- | --- |
| obj | `object` | 


### mergeObjects

*Format*: `tools.mergeObjects(obj1, obj2)` ⇒`object`

*Description*: Overwrites recursively obj1's values with obj2's and adds obj2's if non existent in `obj1`

*Kind*: static method of [`tools`](tools)  


*Returns*: `object` - obj1  

*Parameters*:

| Param | Type |
| --- | --- |
| obj1 | `object` | 
| obj2 | `object` | 


### cloneData

*Format*: `tools.cloneData(obj)` ⇒`object`

*Description*: Clone a data object

*Kind*: static method of [`tools`](tools)  


*Returns*: `object` - a new object having the same dataThis cannot clone object's functions  

*Parameters*:

| Param | Type | Description |
| --- | --- | --- |
| obj | `object` | object tobe cloned |


### getUniqueNumber

*Format*: `tools.getUniqueNumber()` ⇒`number`

*Description*: Get an unique number.This counter will be reseted when the page loaded. It starts from 1.

*Kind*: static method of [`tools`](tools)  


### capitalizeFirstLetter

*Format*: `tools.capitalizeFirstLetter(str)` ⇒`string`

*Description*: Capitalize the first letter of a string

*Kind*: static method of [`tools`](tools)  


*Returns*: `string` - s  

*Parameters*:

| Param | Type |
| --- | --- |
| str | `string` | 


### isFunction

*Format*: `tools.isFunction(callback)` ⇒`boolean`

*Description*: Check if an object is a function

*Kind*: static method of [`tools`](tools)  


*Returns*: `boolean` - true if yes  

*Parameters*:

| Param | Type | Description |
| --- | --- | --- |
| callback | `Object` | object tobe checked |


### isNumber

*Format*: `tools.isNumber(n)` ⇒`boolean`

*Description*: Check whether a value is a number

*Kind*: static method of [`tools`](tools)  


*Returns*: `boolean` - true if yes, false if no  

*Parameters*:

| Param | Type | Description |
| --- | --- | --- |
| n | `object` | data to check |


### splitData

*Format*: `tools.splitData(data, col)` ⇒`Object`

*Description*: Split data into n array, each array contains only element having the same value of the @{col}th column

*Kind*: static method of [`tools`](tools)  


*Parameters*:

| Param | Type | Description |
| --- | --- | --- |
| data | `Array` | is an array of array |
| col | `number` | is a key of an element of @{data} |


### splitDataByGroupAndSubgroup

*Format*: `tools.splitDataByGroupAndSubgroup()` ⇒`Object`

*Description*: Split data

*Kind*: static method of [`tools`](tools)  


*Returns*: `Object` - data  

### sumUp

*Format*: `tools.sumUp(data, colSums)` ⇒`Object`

*Kind*: static method of [`tools`](tools)  


*Parameters*:

| Param | Type | Description |
| --- | --- | --- |
| data | [`Data`](typedef#markdown-header-data) | array of array |
| colSums | `Array.<number>` | array of numbers |


### sumByGroup

*Format*: `tools.sumByGroup()` ⇒`Object`

*Description*: Sum data by group

*Kind*: static method of [`tools`](tools)  

*See*: [MMTDrop.tools#sumByGroups](tools#markdown-header-sumbygroups)  

### sumByGroups

*Format*: `tools.sumByGroups(data, colsToSum, colsToGroup)` ⇒[`Data`](typedef#markdown-header-data)

*Description*: Sum up element of [Data](typedef#markdown-header-data) by group, sub group, ... and so more

*Kind*: static method of [`tools`](tools)  


*Returns*: [`Data`](typedef#markdown-header-data) - data  

*Parameters*:

| Param | Type | Description |
| --- | --- | --- |
| data | [`Data`](typedef#markdown-header-data) |  |
| colsToSum | [`Array.<Index>`](typedef#markdown-header-index) | list of column Ids to sumup |
| colsToGroup | [`Array.<Index>`](typedef#markdown-header-index) | list of column Ids to group by |


### sumByGroupAndSubgroup

*Format*: `tools.sumByGroupAndSubgroup()` ⇒`Object`

*Description*: Sum data by group and subgroup

*Kind*: static method of [`tools`](tools)  

*See*: [MMTDrop.tools#sumByGroups](tools#markdown-header-sumbygroups)  

|                                                           |
|----------------------------------------------------------:|
|*documentation generated on Tue, 28 Apr 2015 14:25:18 GMT*|