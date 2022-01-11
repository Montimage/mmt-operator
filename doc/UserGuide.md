# Welcome

This page presents about how-to use MMT-Operator framework to show a report.

# Report

A report 
It contains two groups.



# List of available report

The pre-defined reports in `MMTDrop` are defined in `MMTDrop.reportFactory` namespace. 
User can create a new kind of report by following this [[DeveloperGuide]].

Function name             | Description
------------------------- | ---
`createRealtimeReport`    | realtime data
`createHierarchyReport`   | hierarchy protocols
`createCategoryReport`    | cateogries protocols
`createApplicationReport` | protocol
`createFlowCloudReport`   | cloud of flows
`createFlowDensityReport` | flow density


# Show a report

To show a report into a Web page: 

1. import `MMTDrop` library and its dependencies into the Web page
2. use `MMTDrop.reportFactory` to create a report
3. call `renderTo` method of report to render it into an HTML element of the Web page


## Example

The following will show an hierarchy report into an HTML element having `id = "content"`.


```javascript
var report = MMTDrop.reportFactory.createHierarchyReport();
report.renderTo( "content" );

```
