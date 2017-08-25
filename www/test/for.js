https://jsperf.com/caching-array-length/82
var arr = [];
arr.length = 5555555;
arr.fill( Math.random() );

var total = 0;

var start = Date.now();
var total = 0;
for( var i in arr)
   total += arr[i];
var end = Date.now();
console.log(" took: " + (end - start));

var start = Date.now();
var total = 0;
for( var i=0; i<arr.length; i++)
   total += arr[i];
var end = Date.now();
console.log(" took: " + (end - start));

var start = Date.now();
var total = 0;
var length = arr.length
while( --length )
   total += arr[ length ];
var end = Date.now();
console.log(" took: " + (end - start));

//=======

var start = Date.now();
var total = 0;
for( var i in arr)
   total += arr[i];
var end = Date.now();
console.log(" took: " + (end - start));

var start = Date.now();
var total = 0;
for( var i=0; i<arr.length; i++)
   total += arr[i];
var end = Date.now();
console.log(" took: " + (end - start));

var start = Date.now();
var total = 0;
var length = arr.length
while( --length )
   total += arr[ length ];
var end = Date.now();
console.log(" took: " + (end - start));