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
    this.JUIElement.empty();
    this.UIElement.style.width  = '210px';
    this.UIElement.style.border = '1px solid black';
    for(var i = 0; i < this.n; i++){
        var tr = this.UIElement.insertRow();
        for(var j = 0; j < this.m; j++){
            var td = tr.insertCell();
            $(td).addClass("memory_cell");
            td.appendChild(document.createTextNode(i*this.m + j));
            td.style.border = '1px solid black';
            td.style.width = '30px';
        }
    }
    this.reColor();
}

MemoryHandler.prototype.reColor = function() {
    this.colorRange(3, 7);
}

MemoryHandler.prototype.colorRange = function(lo, hi) {
    // var filteredCells = $('.memory_cell').filter(function(i){
    //     console.log(JSON.stringify($(this)));
    //     var num = parseInt(this.html(), 10);
    //     return num >= lo && num <= hi;
    // });
    var cells = $('.memory_cell');
    for (var index = 0; index < cells.length; index++){
        var num = parseInt($(cells[index]).text(), 10);
        if (num >= lo && num <= hi)
            $(cells[index]).css('color', 'red');
    };
    //console.log(filteredCells);
    //filteredCells.css('color', 'red');
}

var memoryHandler = new MemoryHandler();

function refresh() {
    var height = parseInt($('#htext').val(), 10);
    var width = parseInt($('#wtext').val(), 10);    
    alert(height + " : " + width);
    memoryHandler.resize(height, width);
    memoryHandler.invalidate();
}

function initLeftPart() {
    $("#left_content").text("Memory status");
    var body = document.getElementById("left_content"); 
    function tableCreate(){
        var tbl  = document.createElement('table');
        $(tbl).addClass("memory_table_class");
        memoryHandler.init(tbl);
        body.appendChild(tbl);
    }
    var x = $("<div>Height: <input type='text' id='htext'><br>Width:   <input type='text' id='wtext'><br></div>");
    $(body).append(x);
    x = $("<button  onclick='refresh()'> Refresh </button>");
    $(body).append(x);
    tableCreate();
}
initLeftPart();