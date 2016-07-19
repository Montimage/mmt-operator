var CircularBuffer = require("../libs/CircularBuffer");

var buf = new CircularBuffer(3);
console.log( buf.toarray() );
buf.enq(1);
buf.enq(0);
console.log( buf.toarray() );
console.log( buf.toarray() );
buf.enq(11);
console.log( buf.toarray() );
buf.deq();
console.log( buf.toarray() );
