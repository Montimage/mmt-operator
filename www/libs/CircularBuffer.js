function CircularBuffer(capacity) {
    if (!(this instanceof CircularBuffer)) return new CircularBuffer(capacity);
    if (typeof capacity != "number" || capacity % 1 != 0 || capacity < 1)
        throw new TypeError("Invalid capacity");

    this._buffer = new Array(capacity);
    this._capacity = capacity;
    this._first = 0;
    this._size = 0;
}

CircularBuffer.prototype = {
    /*
     * Returns the current number of items in the buffer.
     */
    size: function() {
        return this._size;
    },
    /*
     * Returns the maximum number of items in the buffer (specified when creating it).
     */
    capacity: function() {
        return this._capacity;
    },
    empty: function(){
      this._size = this.first = 0;
      this._buffer = new Array(this._capacity);
      return this;
    },
    /*
     * Enqueue value at the start of the buffer
     */
    enq: function(value) {
        if (this._first > 0) this._first--;
        else this._first = this._capacity - 1;
        this._buffer[this._first] = value;
        if (this._size < this._capacity) this._size++;
        return this;
    },
    /*
     * Dequeue an item from the start of the buffer; returns that item. Throws RangeError when the buffer is empty on invocation.
     */
    deq: function() {
        if (this._size == 0) throw new RangeError("dequeue on empty buffer");
        var value = this._buffer[(this._first + this._size - 1) % this._capacity];
        this._size--;
        return value;
    },
    data : function(){
      return this._buffer;
    },
    /*
     * Equivalent to buf.get(0,buf.size() - 1): exports all items in the buffer in order.
     */
    toarray: function() {
      var start = 0, end = this._size - 1;

      if (this._size == 0 ) return [];

      if (this._first + start >= this._capacity) {
          //make sure first+start and first+end are in a normal range
          start -= this._capacity; //becomes a negative number
          end -= this._capacity;
      }
      if (this._first + end < this._capacity)
          return this._buffer.slice(this._first + start, this._first + end + 1);
      else
          return this._buffer.slice(this._first + start, this._capacity).concat(this._buffer.slice(0, this._first + end + 1 - this._capacity));
    }
};

module.exports = CircularBuffer;
