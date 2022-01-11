**Welcome**

This page briefs about how to modify the MMTDrop library in order to create a new **Filter**.

# Architecture

A filter is in form of a DOM select box containing a drop-down list of options.
Each option corresponds to a criteria of filtering.
It is attached to a database that is an instance of [`MMTDrop.Database`](api/Database.md). 
When user changes the current selected option, data in database will be filtered out based on the corresponding criteria.

For example, the probe filter created by [`MMTDrop.filterFactory.createProbeFilter`](api/filterFactory.md#createProbeFilter) contains a list of options that are the list of probe IDs existing in database.
When use selects an option, the database retains only data containing probe ID that equals to the one of the selected option.

Features:

* The list of options of a filter can be updated at runtime.
* 



```
data ======>FILTER=====>data'
```

# API

An API document of [`MMTDrop.Filter`](api/Filter.md) is presented [here](api/Filter.md).


# Create a new Filter

There exist some kinds of filters in [`MMTDrop.filterFactory`](api/filterFactory.md).
A new filter is created by creating a new instance of [`MMTDrop.Filter`](api/Filter.md) class.

```javascript
function createProbeFilter(){
    var probeID = "probe_filter_" + MMTDrop.tools.getUniqueNumber();

    //create a list of options 
    var options = [{id: 0, label: "All"}];
    var data = {};

    var filter =  new MMTDrop.Filter({
        id      : probeID,
        label   : "Probe",
        options : options,
    }, function (val, db){
        //show data from probeID = val (val.value=0 ==> any)
        db.data( data[val.id] );
    }, 
    //cache data
    function (db){
        //update the list of probes when database changing
        console.log("update list of probes when DB loaded");
        //update a list of probe IDs when database beeing available
        //to speedup, data are splited into groupes having the same probeID

        data       = db.stat.splitDataByProbe();

        //get a list of probe IDs
        var keys = Object.keys(data);

        //all
        data[0] = db.data();

        //create list of options
        var opts = [];
        for (var i in keys){
            opts.push({id:  keys[i], label: keys[i]});
        }
        //if there are more than one option or no option ==> add "All" to top
        if (opts.length != 1)
            opts.unshift(MMTDrop.tools.cloneData(options[0]));

        filter.option( opts );
        filter.redraw();
    });

    return filter;
},
```

The constructor of this class requires two parameters:

* option - 
* filterFn -
* prepareDataFn - 
