**Welcome**

This page briefs about how to modify the MMTDrop library in order to create a new **Chart**.

# Architecture

There exist several kinds of chart in [`MMTDrop.chartFactory`](api/chartFactory.md).
They can be classified into 4 groups: table, bar, line and pie.
Developers can create a new kind of chart based on [`MMTDrop.Chart`](api/Chart.md) class.

# API

An API document of [`MMTDrop.Chart`](api/Chart.md) is presented [here](api/Chart.md).


# Create a new Chart

A new chart is created by creating a new instance of [`MMTDrop.Chart`](api/Chart.md) class.


```javascript
function createSimpleChart(){
    
    var param = {
        getData : {
            getDataFn: function( db ){
                return {data: db.data(), column: [{id:1, label: "First column"}]}
            }
        }
    };
    
    var chart = new MMTDrop.Chart( param, 
            function( elemID, option, data){
                $('#' + elemID).html(JSON.stringify(data);
            }
    );
       
    chart.getIcon = function(){
        return $('<i>', {'class': 'glyphicons-bar'});
    };
    
    return chart;
}
```
