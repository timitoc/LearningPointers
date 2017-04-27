var MemoryHandler = function() {
    this.UIElement=null;
    this.JUIElement=null;
    this.n = 10;
    this.m = 10;
}

MemoryHandler.prototype.init = function(UIElement) {
    this.UIElement = UIElement;
    this.JUIElement = $(this.UIElement);
    this.invalidate();
}

MemoryHandler.prototype.resize = function(height, width) {
    this.n = height;
    this.m = width;
    this.invalidate();    
}

MemoryHandler.prototype.invalidate = function() {
    //this.JUIElement.empty();
    this.UIElement.style.width  = '210px';
    this.UIElement.style.border = '1px solid black';
    for(var i = 0; i < this.n; i++){
        var tr = this.UIElement.insertRow();
        for(var j = 0; j < this.m; j++){
            var td = tr.insertCell();
            //$(td).addClass("memory_cell");
            td.appendChild(document.createTextNode(i*this.n + j));
            td.style.border = '1px solid black';
            td.style.width = '30px';
        }
    }
}

MemoryHandler.prototype.colorRange = function(lo, hi) {
    var filteredCells = $('memory_cell').filter(function(i){
        var num = parseInt(this.text, 10);
        return (num >= lo && num <= hi)
    });
    filteredCells.css('color', 'red');
}

var memoryHandler = new MemoryHandler();

function initLeftPart() {
    $("#left_content").text("Memory status");
    function tableCreate(){
        var body = document.getElementById("left_content"),
            tbl  = document.createElement('table');
        $(tbl).addClass("memory_table_class");
        memoryHandler.init(tbl);
        body.appendChild(tbl);
    }
    tableCreate();
}
initLeftPart();