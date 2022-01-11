# Workflow to Update a New Protocol #
When a new protocol was implemented in [mmt-sdk](https://bitbucket.org/montimage/mmt-sdk/wiki/Add%20New%20Protocol), we need to update **mmt-operator** in order to recognise this change.

Let say the new protocol having `number=625` and `name=LEMONDE`.

The following steps will help you to update **mmt-operator**.

All the changes you need to do are in the file **public/lib/mmt/js/mmt_drop.js**


## 1-Update Protocol ID-Name ##

Goto object `MMTDrop.constants.ProtocolsIDName` and add a field `625: 'LEMONDE'`

For example:
```
#!javascript

/**
* A table of Protocol-Id : Name 
*/
ProtocolsIDName: {
    0: 'All', 2: '163', ... , 625: 'LEMONDE'
}
```


## 2-Update Category of the new Protocol ##

Goto object `MMTDrop.constants.CategoriesAppIdsMap`, and add `625` to 

 * the first array (e.g., `MMTDrop.constants.CategoriesAppIdsMap["1"]`) 
 * and the second array (e.g., `MMTDrop.constants.CategoriesAppIdsMap["2"]`) 

in order to add the new protocol to category `All` and `Web`.

For example:

```
#!javascript

/**
* A table of Category-Id: Application-Id[]
*/
CategoriesAppIdsMap: {
   1: [2, 3, ..., 625],
   2: [17, 28, ..., 625],
   .... 
}
```



## 3-Voilà ##