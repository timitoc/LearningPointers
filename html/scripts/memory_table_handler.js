var MemoryHandler = function() {
    this.UIElement=null;
    this.JUIElement=null;
    this.n = 10;
    this.m = 10;
    this.selected = {st:0, dr:-1};
    this.adresses = [];
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
    this.selected = {st:0, dr:-1};
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
    this.gatherVarData();
}

function uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    })
}

MemoryHandler.prototype.gatherVarData = function() {
    if (!simpleVar || !pointerVar)
        return;
    var a = simpleVar.getEntries();
    var b = pointerVar.getEntries();
    for (var i = 0; i < b.length; i++) {
        a.push(b[i]);
    }
    this.adresses = uniq(a);
    console.log(this.adresses);
}

MemoryHandler.prototype.reColor = function() {
    this.highlight(3, 7);
}

MemoryHandler.prototype.highlight = function(lo, hi) {
    this.colorRange(this.selected.st, this.selected.dr);
    this.selected = {st: lo, dr: hi};
    this.colorRange(lo, hi);
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
        if (num >= lo && num <= hi) {
            $(cells[index]).toggleClass("colored_cell");
        }
    };
    //console.log(filteredCells);
    //filteredCells.css('color', 'red');
}

MemoryHandler.prototype.select = function(str) {
    console.log("looking for " + str);
    var ind = findIndex(this.adresses, str);
    console.log("Selected index is " + ind);
    if (ind === -1) return;
    ++ind;
    this.highlight(ind, ind);
}

function findIndex(array, elem) {
    for (var i = 0; i < array.length; i++)
        if (array[i] === elem)
            return i;
    return -1;
}

var memoryHandler = new MemoryHandler();

function refresh() {
    var height = parseInt($('#htext').val(), 10);
    var width = parseInt($('#wtext').val(), 10);    
    memoryHandler.resize(height, width);
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
