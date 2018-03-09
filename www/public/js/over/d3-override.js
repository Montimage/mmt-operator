d3.selection.prototype.moveUp = function() {
    return this.each(function() {
        this.parentNode.appendChild(this);
    });
};