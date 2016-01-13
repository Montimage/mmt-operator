function OK(){
    this.value = 0;
    this.inc = function(){
        this.value ++;
        this.ok.inc();
    }
    this.print = function(){
        console.log( this.value );
        this.ok.print();
    }
    
    this.ok = new OK();
}

var a = new OK();
a.print();
a.inc();
a.print();